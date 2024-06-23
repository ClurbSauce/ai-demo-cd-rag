'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef, useState } from 'react';
import PDFViewer from './component/pdfViewer';

export default function Chat() {
  const { messages, input, isLoading, append, handleInputChange, handleSubmit } = useChat();

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [question, setQuestion] = useState('');

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className="flex h-screen flex-row items-center justify-between pb-10 bg-gradient-to-b from-[#BDE5F8] to-[#BCD2F7]">
      <div className="flex flex-col relative bg-[#BDE5F8] w-2/6 h-5/6 stretch rounded-lg border-white border-4 m-4 p-4">
        {/* <h1 className="text-4xl font-bold">AI Chatbot</h1> */}
        <div className='overflow-auto mb-16 w-full' ref={messagesContainerRef}>
          {messages.map(m => (
            <div key={m.id} className={`whitespace-pre-wrap ${
              m.role == 'user'
              ? "bg-white text-black text-right p-3 m-2 rounded-lg ml-20"
              : "bg-[#E87531] p-3 m-2 rounded-lg mr-20"
            }`}>
              {m.role === 'user' ? 'User: ' : 'AI: '}
              {m.content}
            </div>
          ))}
          {isLoading && (
            <div className='flex justify-end pr-4'>
              <span className='animate-bounce'>...</span>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <input 
            className='absolute bottom-0 w-11/12 p-2 mb-8 border border-gray-300 rounded shadow-xl text-black'
            value={input}
            placeholder='Ask a question about the CDs...'
            onChange={handleInputChange}
          />
        </form>
      </div>
      <div className="bg-[#BCD2F7] w-4/6 h-5/6 rounded-lg border-white border-4 m-4 p-4">
        {/* <h1 className="text-4xl font-bold">Construction Docs</h1> */}
        <PDFViewer fileUrl='/files/Cioffi House CDs - A600 - SECTION DETAILS.pdf' />
      </div>
    </main>
  );
}
