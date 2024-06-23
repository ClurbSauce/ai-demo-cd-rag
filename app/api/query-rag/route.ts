// import OpenAI from 'openai';
import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { OpenAIStream, LangChainStream, StreamingTextResponse, Message as VercelChatMessage } from 'ai';
import { Pinecone } from "@pinecone-database/pinecone";
import extractQuestion from '@/app/component/extractQuestion';
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";
import { BytesOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

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
const TEMPLATE = `You are a helpful assistant for architects and contractors. You are knowledgeable about construction techniques and an expert at reading construction documents. Answer the user's question: {input} based on this content: {content}

Current conversation:
{chat_history}

User: {input}
AI:`

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request, res: Response) {
    // const { messages } = await req.json();
    // const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    // const currentMessageContent = messages[messages.length - 1].content;
    // const question = extractQuestion(messages);
    const { questionInput, topK } = await req.json();
    const question = questionInput;
    if (!question) {
        console.log('No user question found');
        return;
    }
    const indexName = "cd-challenge-sl-v2";
    const vectorDimension = 1536;

    const index = client.index(indexName);
    const model = new OpenAIEmbeddings();
    const embed = await model.embedQuery(question);
    let queryResponse = await index.namespace('ns1').query({
        vector: embed,
        topK: topK,
        includeMetadata: true,
        includeValues: true
    });

    const concatenatedPageContent = queryResponse.matches.map((match) => match.metadata.pageContent).join("\n");
    const resultsViewName = queryResponse.matches.map((match) => match.metadata.viewNumber).join("\n");
    const queryResults = queryResponse;
    // console.log(queryResponse);
    // console.log(concatenatedPageContent);
    return new Response(JSON.stringify(
        {queryResponseResults: queryResponse},
    ))
}