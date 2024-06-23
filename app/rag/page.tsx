"use client";
import { useChat } from 'ai/react';
import { useState } from "react";

export default function Home() {
    // const [base64String, setBase64String] = useState("");
    // const [description, setDescription] = useState("");
    const { messages, input, append, handleInputChange, handleSubmit } = useChat();

    const [files, setFiles] = useState<Array<{ name: string, base64: string | null, description: string | null }>>([]);
    const [selectedFile, setSelectedFile] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [embeddingText, setEmbeddingText] = useState("Write question, then generate embedding.");
    const [topK, setTopK] = useState('5');
    const [questionInput, setQuestionInput] = useState('');
    const [topResultViews, setTopResultViews] = useState('Query database to see most relevant views');
    const [topResultContent, setTopResultContent] = useState('Query database to combine relevant views information');
    const [prompt, setPrompt] = useState(`You are a helpful assistant for architects and contractors. You are knowledgeable about construction techniques and an expert at reading construction documents. Answer the user's question: ${questionInput} based on this content: ${topResultContent}`);
    const [responseText, setResponseText] = useState("Send question and context to LLM, then generate answer.");
    const [topResultName, setTopResultName] = useState('');
    const [responseReference, setResponseReference] = useState("Location of information referenced to answer question");


    return (
        <div className="flex flex-row items-center justify-center min-h-screen bg-sky-100 p-4 bg-gradient-to-b from-[#BDE5F8] to-[#BCD2F7]">
            <div className="flex flex-col relative bg-[#BDE5F8] w-2/6 h-4/6 stretch rounded-lg border-white border-4 m-4 p-4">
                <div className="p-1 bg-[#BDE5F8] rounded-lg h-4/6 w-6/6 m-1 items-center justify-center">
                    <label className="block text-base font-semibold text-black mb-1">
                        Question:
                    </label>
                    <textarea
                        className="mt-2 w-full p-2 border border-gray-300 rounded text-black text-sm h-10"
                        placeholder="Enter question here" 
                        value={questionInput}
                        onChange={(e) => setQuestionInput(e.target.value)}
                    />
                    <button
                        className=" bg-[#E87531] mt-2 p-2 text-white rounded shadow-xl"
                        disabled={isLoading}
                        onClick={async () => {
                            const response = await fetch("api/embedding", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({questionInput}),
                            });
                            const data = await response.json();
                            setEmbeddingText(data.embeddingText);
                            // console.log(data.embeddingText);
                            console.log('test');
                        }}
                    >
                        Generate Embedding
                    </button>
                    <label className="block text-base font-regular text-gray-500 mt-5 mb-1">
                        Question Embedding
                    </label>
                    <textarea
                        className="mt-2 w-full p-2 border border-gray-300 rounded text-black text-sm h-16"
                        placeholder={embeddingText}
                    />
                    <div
                        className="mt-2 w-full border border-white rounded text-black text-sm h-px"
                    />
                    <label className="text-base font-semibold text-black mt-1 mb-1">
                        Quantity of Top Results:
                    </label>
                    <textarea
                        className="ml-10 mt-5 w-1/5 p-2 border border-gray-300 rounded text-black text-sm h-10"
                        placeholder={topK}
                        value={topK}
                        onChange={(e) => setTopK(e.target.value)}
                    />
                    <button
                        className=" bg-[#E87531] mt-5 p-2 text-white rounded shadow-xl"
                        disabled={isLoading}
                        onClick={async () => {
                            const response = await fetch("api/query-rag", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({questionInput, topK}),
                            });
                            const data = await response.json();
                            console.log(data.queryResponseResults);
                            const concatenatedPageContent = data.queryResponseResults.matches.map((match) => match.metadata.pageContent).join("\n\n");
                            const resultsViewName = data.queryResponseResults.matches.map((match) => match.metadata.viewNumber).join("\n");
                            const topResultReference = data.queryResponseResults.matches[0].metadata.viewNumber;
                            setTopResultViews(resultsViewName);
                            setTopResultName(topResultReference);
                            setTopResultContent(concatenatedPageContent);
                            console.log(topResultReference);
                            // console.log(resultsViewName);
                        }}
                    >
                        Query Vector Database
                    </button>
                    <label className="block text-base font-semibold text-black mt-5 mb-1">
                        Top {topK} Results:
                    </label>
                    <textarea
                        className="mt-2 w-full p-2 border border-gray-300 rounded text-black text-sm h-14"
                        placeholder={topResultViews}
                    />
                    <label className="block text-base font-semibold text-black mb-1">
                        Top {topK} Results Content:
                    </label>
                    <textarea
                        className="mt-2 w-full p-2 border border-gray-300 rounded text-black text-sm h-32"
                        placeholder={topResultContent}
                        readOnly
                    />
                </div>
                
            </div>
            <div className="flex flex-col relative bg-[#BCD2F7] w-2/6 h-5/6 stretch rounded-lg border-white border-4 m-4 p-4">
                <div className="p-1 bg-[#BCD2F7] rounded-lg h-full w-6/6 m-1 items-center justify-center">
                    <label className="block text-base font-semibold text-black mb-1">
                        LLM:
                    </label>
                    <textarea
                        className="mt-2 w-full p-2 border border-gray-300 rounded text-black text-sm h-10"
                        placeholder="gpt-3.5-turbo-instruct"
                    />
                    <label className="block text-base font-semibold text-black mb-1">
                        Prompt:
                    </label>
                    <form onSubmit={handleSubmit}>
                        <textarea 
                            className="mt-2 w-full p-2 border border-gray-300 rounded text-black text-sm h-32 text-wrap"
                            value={input}
                            placeholder="You are a helpful assistant for architects and contractors. You are knowledgeable about construction techniques and an expert at reading construction documents. Answer the user's question: ${question} based on this content: ${topResultContent}."
                            onChange={handleInputChange}
                        />
                    </form>
                    <button
                        className=" bg-[#E87531] mt-5 p-2 text-white rounded shadow-xl"
                        disabled={isLoading}
                        onClick={async () => {
                            const response = await fetch("api/completion", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({questionInput, topResultContent}),
                            });
                            const data = await response.json();
                            // setEmbeddingText(data.embeddingText);
                            // console.log(data.completionResponse);
                            setResponseText(data.completionResponse);
                            setResponseReference(topResultName);
                        }}
                    >
                        Generate Response
                    </button>
                    <label className="block text-base font-semibold text-black mt-8 mb-1">
                        LLM Response:
                    </label>
                    <textarea
                        className="mt-5 w-full p-2 border border-gray-300 rounded text-black text-sm h-48"
                        placeholder={responseText}
                    />
                    <label className="block text-base font-semibold text-black mb-1">
                        Answer Reference:
                    </label>
                    <textarea
                        className="mt-2 w-full p-2 border border-gray-300 rounded text-black text-sm h-10"
                        placeholder={responseReference}
                    />
                </div>
                
            </div>
        </div>
    );
}