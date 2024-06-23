import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
    apiKey: process.env.OpenAI_API_KEY,
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
    // const { input }: { input: string } = await req.json();

    const { questionInput, topResultContent } = await req.json();

    // Ask OpenAI for a streaming chat completion given the prompt
    const response = await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: `You are a helpful assistant for architects and contractors. You are knowledgeable about construction techniques and an expert at reading construction documents. Answer the user's question: ${questionInput} based on this content ${topResultContent}. Answer the user's question concisely and do not provide additional information not asked. If the answer is not in the provided context, then respond with, "I do not know, the answer is not in the context provided".`,
        max_tokens: 2000,
        stream: false,
        // messages,
    });
    console.log(response);
    return new Response(JSON.stringify(
        {completionResponse: response.choices[0].text}
    ))

    // // Convert the response into a friendly text-stream
    // const stream = OpenAIStream(response);
    // // Respond with the stream
    // return new StreamingTextResponse(stream);
}