import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI();

export async function POST(request: Request) {
  const { messages, newMessage } = await request.json();

  // Add the new message to the existing messages array
  const updatedMessages = [...messages, { role: 'user', content: newMessage }];

  const stream = await client.chat.completions.create({
    model: 'gpt-4',
    messages: updatedMessages,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new NextResponse(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}