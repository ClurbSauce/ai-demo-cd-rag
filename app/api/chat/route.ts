import OpenAI from 'openai';
import { OpenAIEmbeddings } from "@langchain/openai";
import { OpenAIStream, StreamingTextResponse, Message as VercelChatMessage } from 'ai';
import { Pinecone } from "@pinecone-database/pinecone";
import extractQuestion from '@/app/component/extractQuestion';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
    apiKey: process.env.OpenAI_API_KEY,
});
const client = new Pinecone({
    apiKey: process.env.PINECONE_SL_API_KEY as string
});

const formatMessage = (message: VercelChatMessage) => {
    return `${message.role}: ${message.content}`
}

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request, res: Response) {
    const { messages } = await req.json();
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;
    const question = extractQuestion(messages);
    if (!question) {
        console.log('No user question found');
        return;
    }
    const indexName = "cd-challenge-sl-v2";
    const vectorDimension = 1536;

    const index = client.index(indexName);
    const model = new OpenAIEmbeddings();
    const embed = await model.embedQuery(currentMessageContent);
    let queryResponse = await index.namespace('ns1').query({
        vector: embed,
        topK: 2,
        includeMetadata: true,
        includeValues: true
    });
    const concatenatedPageContent = queryResponse.matches.map((match) => match.metadata.pageContent).join(" ");
    console.log(concatenatedPageContent);

    const response = await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: `You are a helpful assistant for architects and contractors. You are knowledgeable about construction techniques and an expert at reading construction documents. Answer the user's question: ${currentMessageContent} based on this content: ${concatenatedPageContent}`,
        max_tokens: 2000,
        stream: true,
    });
    
    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    // Respond with the stream
    return new StreamingTextResponse(stream);
    
}