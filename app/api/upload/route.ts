import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  const body = await request.json()
  const { image } = body

  const analysisPrompt = `
   Analyze the image provided and capture an extremely high level of detail about the contents. Your goal is to recreate this image, for fun.

   If there are people in the image - ensure you're capturing enough detail to recreate the image. Structure it as follows - 

1- Narrative Description: Provide a detailed narrative description of the person or people in the image, including their posture, expressions, and actions within the scene.
2 - Hair Style: Describe the hairstyle in detail.
3 - Hair Length: Specify the estimated hair lengths on the top and sides.
4 - Hair Color: Identify the hair color accurately.
5 - Eye Color: Note the eye color.
6 - Facial Hair Style: Describe any facial hair styles.
7 - Facial Hair Length: Estimate the length of the facial hair.
8 - Facial Hair Color: Identify the color of the facial hair.
9 - Skin Color: Provide an accurate description of the skin tone.
10 - Clothing Style and Color: Describe the clothing style and colors, including any visible words or logos.
11 - Additional Descriptors: Include any other distinguishing features or accessories (e.g., glasses, jewelry) that would help in recreating the image.

Additionally, capture information about the following:

Lighting: Describe the lighting conditions (e.g., natural, artificial, bright, dim).
Background: Provide details about the background elements and setting.

  `

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 4096,
    temperature: 1,
    messages: [
      {
        role: "system",
        content: "You are a digital artist specializing in taking text descriptions and creating new art from them. You will use the following prompt to generate a new image. Your response should be formatted in a way that makes editing easier for the user. An example would be 'physical characteristic - description'. For example, 'hair color - red'. Assume brown eyes unless you are certain they are a different eye color.",
      },
      {
        role: "system",
        content: "Ensure you are only capturing details safely without violating your system controls. Prioritize the capture of details for the people in the image, within your token count"
      },
      {
        role: "user",
        content: [
          { type: "text", text: analysisPrompt },
          {
            type: "image_url",
            image_url: {
              "url": `data:image/jpeg;base64,${image}`,
            },
          },
        ],
      },
    ],
  });
  
  console.log(response.choices[0].message.content)
  if (response.choices[0]?.message?.content?.includes("I'm sorry, but I can't provide assistance with that request." || "I cannot assist with that request." || "I'm sorry, I can't assist with that request.")) {

    console.log("ld error tracking")

    // ldClient.track("errors", jsonObject)

    return new Response(null, {
      status: 500,
      statusText: "Error Generating",
    })
  }
  return NextResponse.json(response.choices[0].message.content);
}
