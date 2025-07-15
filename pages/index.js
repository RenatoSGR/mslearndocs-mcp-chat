import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Custom hook for communication with our own backend API route
const useMcp = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const sendMessage = async (message, conversationHistory = []) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/mcp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message,
                    conversationHistory 
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return data.reply;
        } catch (err) {
            setError(err.message || 'Something went wrong');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { sendMessage, isLoading, error };
};

export default function ChatPage() {
    const [messages, setMessages] = useState([
        { 
            text: `Hello! I can search the official Microsoft documentation, powered by Microsoft Learn Docs MCP Server. Here are some examples how to interact with me:
\`\`\`
Give me the Azure CLI commands to create an Azure Container App with a managed identity. search Microsoft docs
\`\`\`

\`\`\`
Is gpt-4.1-mini available in EU regions? search Microsoft docs
\`\`\`

What would you like to know?`, 
            sender: 'ai' 
        }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const { sendMessage, isLoading, error } = useMcp();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const clearConversation = () => {
        setMessages([{ text: "Hello! I can search the official Microsoft Learn documentation. What would you like to know?", sender: 'ai' }]);
    };

    const copyCodeToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { text: input, sender: 'user' };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');

        try {
            // Pass the updated conversation history (including the new user message)
            const aiResponseText = await sendMessage(input, updatedMessages);
            const aiMessage = { text: aiResponseText, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            // Error is already handled by the hook
        }
    };

    const UserIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );

    const AiIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    );

    const CopyCodeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    );

    // Logo placeholder components
    // const LeftLogo = () => (
    //     <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg border border-blue-400/30">
    //         <span className="text-white font-bold text-lg">MS</span>
    //     </div>
      const LeftLogo = () => (
          <Image
              src="/mcp.png"
              alt="MCP Logo"
              width={52}
              height={48}
              className="w-14 h-12 rounded-xl shadow-lg"
              priority
          />
      );
    
    // const RightLogo = () => (
    //     <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg border border-purple-400/30">
    //         <span className="text-white font-bold text-lg">AI</span>
    //     </div>
    // );
      const RightLogo = () => (
          <Image
              src="/aimsft.png"
              alt="Microsoft"
              width={54}
              height={48}
              className="w-15 h-12 rounded-xl shadow-lg"
              priority
          />
      );



    // Custom markdown components for styling
    const markdownComponents = {
        // Style headings
        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-3 text-gray-800" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-2 text-gray-800" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 text-gray-800" {...props} />,
        h4: ({node, ...props}) => <h4 className="text-base font-bold mb-1 text-gray-800" {...props} />,
        h5: ({node, ...props}) => <h5 className="text-sm font-bold mb-1 text-gray-800" {...props} />,
        h6: ({node, ...props}) => <h6 className="text-xs font-bold mb-1 text-gray-800" {...props} />,
        
        // Style paragraphs
        p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
        
        // Style links
        a: ({node, ...props}) => (
            <a
                className="text-blue-600 hover:text-blue-800 underline font-medium bg-blue-50 px-1 py-0.5 rounded transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
            />
        ),
        
        // Style lists
        ul: ({node, ...props}) => <ul className="mb-3 pl-6 space-y-1 list-disc" {...props} />,
        ol: ({node, ...props}) => <ol className="mb-3 pl-6 space-y-1 list-decimal" {...props} />,
        li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
        
        // Style code blocks and inline code
        code: ({node, inline, children, ...props}) => {
            const codeText = String(children).replace(/\n$/, '');
            
            return inline ? (
                <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono border border-gray-200" {...props}>
                    {children}
                </code>
            ) : (
                <div className="relative group mb-3">
                    <code className="block bg-gray-100 text-gray-800 p-2 sm:p-3 pr-8 sm:pr-10 rounded-lg overflow-x-auto border border-gray-200 font-mono text-xs sm:text-sm" {...props}>
                        {children}
                    </code>
                    <button
                        onClick={() => copyCodeToClipboard(codeText)}
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-1.5 bg-gray-200 hover:bg-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Copy code"
                    >
                        <CopyCodeIcon />
                    </button>
                </div>
            );
        },
        
        // Handle pre tags separately
        pre: ({node, children, ...props}) => (
            <pre className="bg-gray-100 text-gray-800 p-3 rounded-lg mb-3 overflow-x-auto border border-gray-200" {...props}>
                {children}
            </pre>
        ),
        
        // Style blockquotes
        blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-blue-400 pl-4 py-2 mb-3 bg-blue-50 italic text-gray-700" {...props} />
        ),
        
        // Style tables
        table: ({node, ...props}) => (
            <div className="overflow-x-auto mb-3">
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden" {...props} />
            </div>
        ),
        th: ({node, ...props}) => (
            <th className="bg-gray-100 border border-gray-200 px-3 py-2 text-left font-medium text-gray-800" {...props} />
        ),
        td: ({node, ...props}) => (
            <td className="bg-white border border-gray-200 px-3 py-2 text-gray-700" {...props} />
        ),
        
        // Style horizontal rules
        hr: ({node, ...props}) => <hr className="border-gray-300 my-4" {...props} />,
        
        // Style strong and emphasis
        strong: ({node, ...props}) => <strong className="font-bold text-gray-800" {...props} />,
        em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
    };

    // Function to render message content with markdown support
    const renderMessageContent = (text) => {
        if (!text || typeof text !== 'string') {
            return text;
        }

        return (
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
            >
                {text}
            </ReactMarkdown>
        );
    };

    return (
        <>
            <Head>
                <title>MS Learn Docs AI Chat</title>
                <meta name="description" content="Chat with an AI to search Microsoft Learn documentation." />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
                <link rel="icon" href="/ai.ico" />
            </Head>
            
            <main className="min-h-screen bg-white text-gray-900 flex flex-col">
                {/* Clean background */}
                <div className="absolute inset-0 bg-gray-50/50"></div>
                
                <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-2 sm:p-4" style={{ height: '100vh' }}>
                    <div className="w-full max-w-4xl h-full flex flex-col bg-white rounded-none sm:rounded-lg shadow-sm border-0 sm:border border-gray-200 overflow-hidden">
                        
                        {/* Clean Header */}
                        <header className="p-3 sm:p-6 border-b border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                                <div className="hidden sm:block">
                                    <LeftLogo />
                                </div>
                                <div className="flex-1 text-center">
                                    <h1 className="text-lg sm:text-3xl font-semibold text-gray-800">
                                        MS Learn Docs AI Assistant 
                                    </h1>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
                                        Powered by Microsoft Learn Docs MCP Server
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <button
                                        onClick={clearConversation}
                                        className="px-2 py-1 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 text-gray-700 text-xs sm:text-sm font-medium border border-gray-300"
                                        title="Clear conversation history"
                                    >
                                        Clear
                                    </button>
                                    <div className="hidden sm:block">
                                        <RightLogo />
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Chat Messages Area */}
                        <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 bg-gray-50/30">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex items-start gap-2 sm:gap-4 ${
                                        msg.sender === 'user' ? 'justify-end' : ''
                                    }`}
                                >
                                    {msg.sender === 'ai' && (
                                        <div className="p-2 sm:p-3 bg-blue-600 rounded-full shadow-sm flex-shrink-0">
                                            <AiIcon />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[85%] sm:max-w-md p-3 sm:p-4 rounded-lg whitespace-pre-wrap shadow-sm border text-sm sm:text-base ${
                                            msg.sender === 'user'
                                                ? 'bg-blue-600 text-white border-blue-700 rounded-br-sm'
                                                : 'bg-white text-gray-900 border-gray-200 rounded-bl-sm'
                                        }`}
                                    >
                                        <div className={msg.sender === 'user' ? 'text-white' : 'text-gray-900'}>{renderMessageContent(msg.text)}</div>
                                    </div>
                                    {msg.sender === 'user' && (
                                        <div className="p-2 sm:p-3 bg-gray-600 rounded-full shadow-sm flex-shrink-0">
                                            <UserIcon />
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {isLoading && (
                                <div className="flex items-start gap-2 sm:gap-4">
                                    <div className="p-2 sm:p-3 bg-blue-600 rounded-full animate-pulse shadow-sm flex-shrink-0">
                                        <AiIcon />
                                    </div>
                                    <div className="max-w-[85%] sm:max-w-md p-3 sm:p-4 bg-white text-gray-900 rounded-lg rounded-bl-sm shadow-sm border border-gray-200">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="p-4 text-red-600 text-center border-t border-gray-200 bg-red-50">
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-3 sm:p-6 border-t border-gray-200 bg-white">
                            {/* Conversation Context Indicator */}
                            {messages.length > 2 && (
                                <div className="mb-3 text-center">
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full border border-gray-200">
                                        💬 {messages.length - 1} messages
                                    </span>
                                </div>
                            )}
                            <form onSubmit={handleSend} className="flex items-end space-x-2 sm:space-x-4">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about Azure, AI, etc..."
                                    className="flex-1 p-3 sm:p-4 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="p-3 sm:p-4 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm flex-shrink-0"
                                >
                                    {isLoading ? (
                                        <svg
                                            className="animate-spin h-6 w-6 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}