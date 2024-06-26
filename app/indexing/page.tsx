"use client";

import { useState } from "react";

export default function Home() {
    // const [base64String, setBase64String] = useState("");
    // const [description, setDescription] = useState("");
    const [files, setFiles] = useState<Array<{ name: string, base64: string | null, description: string | null }>>([]);
    const [selectedFile, setSelectedFile] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [embeddingText, setEmbeddingText] = useState("Write description, then generate embedding.");
    const [title, setTitle] = useState('');
    const [generalDescription, setGeneralDescription] = useState('');
    const [detailDescription, setDetailDescription] = useState('');

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const filesArray = Array.from(event.target.files);
            
            Promise.all(filesArray.map(file => {
                return new Promise<{ name: string, base64: string | null }>((resolve, reject) => {
                    const reader = new FileReader();
                    
                    reader.onloadend = () => {
                        const base64Data = reader.result;
                        resolve({ name: file.name, base64: base64Data ? base64Data.toString() : null });
                    };
                    
                    reader.onerror = reject;
                    
                    reader.readAsDataURL(file);
                });
            }))
            .then(filesData => {
                // Each fileData object contains `name` and `base64` properties
                setFiles(filesData.map(fileData => ({
                    ...fileData,
                    description: null // Initial state with no description
                })));
            })
            .catch(error => {
                console.error("Error reading files:", error);
            });
        }
    };
    
    // const generateDescription = async (fileIndex: number) => {
    //     setIsLoading(true);
    //     const response = await fetch("http://127.0.0.1:7860/interrogator/prompt", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         image: base64String,
    //         clip_model_name: "ViT-L-14/openai",
    //         mode: "fast",
    //       }),
    //     });
    //     const data = await response.json();
    //     setDescription(data.prompt);
    //     setIsLoading(false);
    // };

    const selectFile = (index) => {
        setSelectedFile(index);
    };

    const handleTitleChange = (title) => {
        const newFiles = [...files];
        newFiles[selectedFile].title = title;
        setFiles(newFiles);
    };

    const handleGeneralDescriptionChange = (generalDescription) => {
        const newFiles = [...files];
        newFiles[selectedFile].generalDescription = generalDescription;
        setFiles(newFiles);
    };

    const handleDetailDescriptionChange = (detailDescription) => {
        const newFiles = [...files];
        newFiles[selectedFile].detailDescription = detailDescription;
        setFiles(newFiles);
    };

    return (
        <div className="flex flex-row items-center justify-center min-h-screen bg-sky-100 p-4 bg-gradient-to-b from-[#BDE5F8] to-[#BCD2F7]">
            <div className="flex flex-col relative bg-[#BDE5F8] w-2/6 h-5/6 stretch rounded-lg border-white border-4 m-4 p-4">
                <input
                    type="file"
                    multiple
                    onChange={handleFileInputChange}
                    className="mb-2"
                />
                <div className="overflow-auto h-32 text-xs">
                    {files.map((file, index) => (
                        <div key={index}
                             onClick={() => selectFile(index)}
                             className="cursor-pointer bg-[#B6DDEF] text-black p-1 hover:bg-gray-200">
                            {file.name}
                        </div>
                    ))}
                </div>
                {selectedFile !== null && files[selectedFile] && (
                    <div className="p-1 bg-[#BDE5F8] rounded-lg h-full w-6/6 m-1 items-center justify-center">
                    <label className="block text-base font-semibold text-black mb-1">
                        Title:
                    </label>
                    {/* <input
                        type="text"
                        value={files[selectedFile].title || ""}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="mt-2 w-full p-2 border border-gray-300 rounded text-black text-sm mb-5"
                        placeholder="Enter title here" 
                    /> */}
                    <textarea
                        className="mt-2 w-full p-2 border border-gray-300 rounded text-black text-sm h-10"
                        placeholder="Enter title here" 
                        value={files[selectedFile].title || ""}
                        onChange={(e) => handleTitleChange(e.target.value)}
                    />
                    <label className="block text-base font-semibold text-black mb-1">
                        General Description
                    </label>
                    {/* <input
                        type="text"
                        value={files[selectedFile].generalDescription || ""}
                        onChange={(e) => handleGeneralDescriptionChange(e.target.value)}
                        className="mt-2 w-full p-2 border border-gray-300 rounded text-black text-sm mb-5 h-24 text-wrap"
                        placeholder="Enter general description here" 
                    /> */}
                    <textarea
                        className="mt-2 w-full p-2 border border-gray-300 rounded text-black text-sm h-24"
                        placeholder="Enter general description here" 
                        value={files[selectedFile].generalDescription || ""}
                        onChange={(e) => handleGeneralDescriptionChange(e.target.value)}
                    />
                    <label className="block text-base font-semibold text-black mb-1">
                        Detailed Description:
                    </label>
                    {/* <input
                        type="text"
                        value={files[selectedFile].detailDescription || ""}
                        onChange={(e) => handleDetailDescriptionChange(e.target.value)}
                        className="mt-2 w-full p-2 border border-gray-300 rounded text-black h-2/6"
                        placeholder="Enter detailed description here" 
                    /> */}
                    <textarea
                        className="mt-2 w-full p-2 border border-gray-300 rounded text-black text-sm h-40"
                        placeholder="Enter detailed description here" 
                        value={files[selectedFile].detailDescription || ""}
                        onChange={(e) => handleDetailDescriptionChange(e.target.value)}
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
                                body: JSON.stringify({title, generalDescription, detailDescription}),
                            });
                            const data = await response.json();
                            setEmbeddingText(data.embeddingText);
                            // console.log(data.embeddingText);
                            console.log('test');
                        }}
                    >
                        Generate Embedding
                    </button>
                    <textarea
                        className="mt-2 w-full p-2 border border-gray-300 rounded text-black h-32"
                        placeholder={embeddingText}
                        readOnly
                    />
                </div>
                )}
                
            </div>
            {selectedFile !== null && files[selectedFile] && (
                <>
                <div className="bg-[#BCD2F7] w-4/6 h-5/6 rounded-lg border-white border-4 m-4 p-4">
                    <div className="mt-5 items-center w100">
                        <img src={files[selectedFile].base64} alt={`Uploaded by ${files[selectedFile].name}`} className="w-full rounded-lg shadow-lg items-center" />
                        {/* <p className="mt-2 text-lg font-semibold text-black">
                            {files[selectedFile].description || "No description available"}
                        </p> */}
                    </div>
                </div>
                
                </>
            )}
        </div>
    );
}