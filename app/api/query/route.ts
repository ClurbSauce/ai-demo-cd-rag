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
        topK: 5,
        includeMetadata: true,
        includeValues: true
    });
    // const llm = new OpenAI({
    //     modelName: "gpt-3.5-turbo-instruct",
    //     streaming: true
    // });
    // const chain = loadQAStuffChain(llm);
    const concatenatedPageContent = queryResponse.matches.map((match) => match.metadata.pageContent).join(" ");
    // const result = await chain.invoke({
    //     input_documents: [new Document({ pageContent: concatenatedPageContent })],
    //     question: question,
    //     callbacks: [
    //         {
    //             handleLLMNewToken(token: string) {
    //                 console.log({token});
    //             },
    //         },
    //     ],
    // });
    console.log(concatenatedPageContent);
    // console.log(concatenatedPageContent);
    // const prompt = PromptTemplate.fromTemplate(TEMPLATE)
    // const outputParser = new BytesOutputParser();
    // const chainResponse = prompt.pipe(llm).pipe(outputParser);

    // const streamResponse = await chainResponse.stream({
    //     chat_history: formattedPreviousMessages.join('\n'),
    //     input: currentMessageContent,
    //     content: concatenatedPageContent
    //   })
    // Ask OpenAI for a streaming chat completion given the prompt
    // const response = await openai.chat.completions.create({
    //     model: 'gpt-3.5-turbo',
    //     stream: true,
    //     messages,
    // });

    // const response = await openai.completions.create({
    //     model: 'gpt-3.5-turbo-instruct',
    //     prompt: `You are a helpful assistant for architects and contractors. You are knowledgeable about construction techniques and an expert at reading construction documents. Answer the user's question: ${question} based on this content: ${concatenatedPageContent}`,
    //     max_tokens: 1000,
    //     stream: true,
    //     // messages,
    // });
    
    // Convert the response into a friendly text-stream
    // const stream = OpenAIStream(response);
    // // Respond with the stream
    // return new StreamingTextResponse(stream);
    return concatenatedPageContent;
}