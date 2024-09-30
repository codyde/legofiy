import { useVariationRsc } from '@/lib/ld/server';
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI();

export async function POST(req: Request, res: Response) {

  console.log("Receiving request to generate image.")
  const data = await req.json();

//   const context = {
//     key: "DefaultUser",
//     name: "Default User"
//   }

  // flag example
//   const flag = await useVariationRsc("generate-image", context, false);



  console.log(data)

  const AnalysisPrompt: string = `
  Use the details provided to build a new image of the described individual, inspired by lego brick characters, based on themes from the lego universe. Pay close attention to the detail and ensure you are matching the styles that have been described. Ensure you are keeping the scene and details as much as possible:  
  `

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `${AnalysisPrompt} \n\n${data.image}`,
    n: 1,
    size: "1024x1024",
    quality: "hd",
    response_format: "b64_json"
  });

  // console.log(response.data[0])

  return NextResponse.json(response.data[0].b64_json);
}
