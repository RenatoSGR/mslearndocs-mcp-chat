import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Login Component
const LoginPanel = ({ onLogin, error }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simple validation for default credentials
        if (username === 'stu' && password === 'bestteam') {
            setTimeout(() => {
                onLogin(true);
                setIsLoading(false);
            }, 500); // Small delay for better UX
        } else {
            setTimeout(() => {
                onLogin(false);
                setIsLoading(false);
            }, 500);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-600 rounded-full p-3">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to access Microsoft Learn Docs Chat</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-red-700 text-sm">
                                    Wrong password. Please ask for access or try again.
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Need access? Contact your administrator
                    </p>
                </div>
            </div>
        </div>
    );
};

// Custom hook for communication with our own backend API route
const useMcp = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [abortController, setAbortController] = useState(null);

    const sendMessage = async (message, conversationHistory = [], onChunk) => {
        // Create new AbortController for this request
        const controller = new AbortController();
        setAbortController(controller);
        setIsLoading(true);
        setError(null); // Clear any previous errors
        
        try {
            const response = await fetch('/api/mcp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message,
                    conversationHistory 
                }),
                signal: controller.signal
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                throw new Error(`Network error (${response.status}): ${errorText}`);
            }

            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ') && line.length > 6) {
                        const data = line.slice(6).trim();
                        
                        if (data === '[DONE]') {
                            return accumulatedContent;
                        }
                        
                        try {
                            const parsed = JSON.parse(data);
                            
                            if (parsed.error) {
                                throw new Error(parsed.error);
                            }
                            
                            if (parsed.content) {
                                accumulatedContent += parsed.content;
                                // Call the onChunk callback with the accumulated content
                                if (onChunk) {
                                    onChunk(accumulatedContent);
                                }
                            }
                        } catch (parseError) {
                            // Skip invalid JSON chunks
                            continue;
                        }
                    }
                }
            }
            
            return accumulatedContent || "I'm sorry, I couldn't generate a response.";
        } catch (err) {
            if (err.name === 'AbortError') {
                throw new Error('Request cancelled');
            }
            setError(err.message || 'Something went wrong');
            throw err;
        } finally {
            setIsLoading(false);
            setAbortController(null);
        }
    };

    const cancelRequest = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setIsLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
    };

    return { sendMessage, cancelRequest, clearError, isLoading, error };
};

// Simple Image Component for markdown with expand and link features
const MarkdownImage = ({ alt, src, title, ...props }) => {
    const [imageError, setImageError] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    const handleImageClick = () => {
        if (!imageError) {
            setIsExpanded(true);
        }
    };

    const handleCloseExpanded = (e) => {
        if (e.target === e.currentTarget) {
            setIsExpanded(false);
        }
    };

    // Simple URL processing - just ensure HTTPS for external URLs
    const processedSrc = src && src.startsWith('http://') && !src.includes('localhost') 
        ? src.replace('http://', 'https://') 
        : src;

    // Function to get a short version of the URL for display
    const getShortUrl = (url) => {
        if (!url) return '';
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            const filename = pathParts[pathParts.length - 1];
            return filename || urlObj.hostname;
        } catch {
            return url.length > 30 ? url.substring(0, 27) + '...' : url;
        }
    };

    if (imageError || !processedSrc) {
        return (
            <div className="my-2 p-4 bg-gray-100 border border-gray-300 rounded-lg text-center text-gray-600">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Image could not be loaded</p>
                {alt && <p className="text-xs mt-1">{alt}</p>}
            </div>
        );
    }

    return (
        <>
            <div className="my-2">
                {/* Image with hover expand button */}
                <div className="relative group cursor-pointer" onClick={handleImageClick}>
                    <img 
                        className="max-w-full h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                        alt={alt || "Image"}
                        src={processedSrc}
                        title={title || "Click to expand"}
                        onError={handleImageError}
                        loading="lazy"
                        {...props}
                    />
                    {/* Very transparent hover overlay with expand icon */}
                    <div className="absolute inset-0 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white bg-opacity-95 rounded-full p-2 shadow-lg border border-gray-200">
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                {/* Small URL link below the image */}
                <div className="mt-1 text-center">
                    <a 
                        href={processedSrc} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-blue-600 underline transition-colors duration-200 inline-flex items-center gap-1"
                        title={processedSrc}
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {getShortUrl(processedSrc)}
                    </a>
                </div>
            </div>

            {/* Expanded Image Modal */}
            {isExpanded && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                    onClick={handleCloseExpanded}
                >
                    <div className="relative max-w-full max-h-full">
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg z-10 transition-all duration-200"
                            title="Close expanded view"
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img 
                            className="max-w-full max-h-full rounded-lg shadow-2xl"
                            alt={alt || "Expanded image"}
                            src={processedSrc}
                            title={title}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default function ChatPage() {
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginError, setLoginError] = useState(null);

    // Chat application state (initialize all hooks first)
    const [messages, setMessages] = useState([
        { 
            id: 'welcome',
            text: `Hello! I can search the official Microsoft documentation, powered by Microsoft Learn Docs MCP Server. Here are some examples how to interact with me:
\`\`\`
Give me the Azure CLI commands to create an Azure Container App with a managed identity. search Microsoft docs
\`\`\`

\`\`\`
How to setup on AI Foundry a PTU for a model? Provide the steps and sample images.
\`\`\`

What would you like to know?`, 
            sender: 'ai' 
        }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const { sendMessage, cancelRequest, clearError, isLoading, error } = useMcp();

    const handleLogin = (success) => {
        if (success) {
            setIsAuthenticated(true);
            setLoginError(null);
            // Store authentication in sessionStorage for the session
            sessionStorage.setItem('authenticated', 'true');
        } else {
            setLoginError(true);
        }
    };

    // Check for existing authentication on component mount
    useEffect(() => {
        const authStatus = sessionStorage.getItem('authenticated');
        if (authStatus === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const clearConversation = () => {
        setMessages([{ id: 'welcome', text: "Hello! I can search the official Microsoft Learn documentation. What would you like to know?", sender: 'ai' }]);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('authenticated');
        setIsAuthenticated(false);
        setMessages([{ id: 'welcome', text: "Hello! I can search the official Microsoft Learn documentation. What would you like to know?", sender: 'ai' }]);
    };

    // If not authenticated, show login panel
    if (!isAuthenticated) {
        return <LoginPanel onLogin={handleLogin} error={loginError} />;
    }

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

        // Clear any previous errors when starting a new request
        clearError();

        const userMessage = { text: input, sender: 'user' };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');

        // Add a placeholder AI message that will be updated with streaming content
        const aiMessageId = Date.now();
        const placeholderAiMessage = { 
            text: '', 
            sender: 'ai', 
            id: aiMessageId,
            isSearching: true 
        };
        setMessages(prev => [...prev, placeholderAiMessage]);

        try {
            // Pass the updated conversation history and a callback to update the streaming message
            await sendMessage(input, updatedMessages, (accumulatedContent) => {
                setMessages(prev => 
                    prev.map(msg => 
                        msg.id === aiMessageId 
                            ? { ...msg, text: accumulatedContent, isSearching: false }
                            : msg
                    )
                );
            });

            // Mark streaming as complete
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === aiMessageId 
                        ? { ...msg, isSearching: false }
                        : msg
                )
            );
        } catch (error) {
            if (error.message === 'Request cancelled') {
                console.log('Request was cancelled by user');
                // Remove the placeholder message on cancellation
                setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
            } else {
                // Update the placeholder message with error and show a retry button
                setMessages(prev => 
                    prev.map(msg => 
                        msg.id === aiMessageId 
                            ? { 
                                ...msg, 
                                text: "Sorry, there was an error processing your request. Please try again.", 
                                isSearching: false,
                                hasError: true
                            }
                            : msg
                    )
                );
            }
            // Error is already handled by the hook
        }
    };

    const handleCancel = () => {
        cancelRequest();
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
        // Style headings with tighter spacing (inherit text color)
        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-1 mt-3 border-b border-gray-200 pb-1" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-1 mt-2 border-b border-gray-100 pb-0.5" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-1 mt-2" {...props} />,
        h4: ({node, ...props}) => <h4 className="text-base font-bold mb-0.5 mt-1" {...props} />,
        h5: ({node, ...props}) => <h5 className="text-sm font-bold mb-0.5 mt-1" {...props} />,
        h6: ({node, ...props}) => <h6 className="text-xs font-bold mb-0.5 mt-1" {...props} />,
        
        // Style paragraphs with tighter spacing (inherit text color)
        p: ({node, ...props}) => <p className="mb-1 leading-snug" {...props} />,
        
        // Style links with better visibility
        a: ({node, ...props}) => (
            <a
                className="text-blue-600 hover:text-blue-800 underline font-medium bg-blue-50 px-1 py-0.5 rounded transition-all duration-200 hover:bg-blue-100"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
            />
        ),
        
        // Style lists with tighter spacing (inherit text color)
        ul: ({node, ...props}) => <ul className="mb-2 pl-6 space-y-0.5 list-disc" {...props} />,
        ol: ({node, ...props}) => <ol className="mb-2 pl-6 space-y-0.5 list-decimal" {...props} />,
        li: ({node, ...props}) => <li className="leading-snug" {...props} />,
        
        // Enhanced code blocks and inline code (with language labels but original colors and scroll)
        code: ({node, inline, children, className, ...props}) => {
            const codeText = String(children).replace(/\n$/, '');
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            return inline ? (
                <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono border border-gray-200" {...props}>
                    {children}
                </code>
            ) : (
                <div className="relative group mb-2">
                    {language && (
                        <div className="bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600 border border-gray-200 border-b-0 rounded-t-lg flex justify-between items-center">
                            <span>{language}</span>
                            <button
                                onClick={() => copyCodeToClipboard(codeText)}
                                className="p-1 bg-gray-300 hover:bg-gray-400 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2"
                                title="Copy code"
                            >
                                <CopyCodeIcon />
                            </button>
                        </div>
                    )}
                    <code className={`block bg-gray-100 text-gray-800 p-2 sm:p-3 ${language ? 'pr-3 sm:pr-3 rounded-b-lg' : 'pr-8 sm:pr-10 rounded-lg'} overflow-x-auto border border-gray-200 font-mono text-xs sm:text-sm`} {...props}>
                        {children}
                    </code>
                    {!language && (
                        <button
                            onClick={() => copyCodeToClipboard(codeText)}
                            className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-1.5 bg-gray-200 hover:bg-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            title="Copy code"
                        >
                            <CopyCodeIcon />
                        </button>
                    )}
                </div>
            );
        },
        
        // Handle pre tags to avoid conflicts (with proper scrolling)
        pre: ({node, children, ...props}) => {
            // If already styled by code component, just return children
            if (props.className?.includes('block bg-gray-100')) {
                return <>{children}</>;
            }
            return (
                <pre className="bg-gray-100 text-gray-800 p-2 sm:p-3 rounded-lg mb-2 overflow-x-auto border border-gray-200 font-mono text-xs sm:text-sm" {...props}>
                    {children}
                </pre>
            );
        },
        
        // Enhanced blockquotes (reverted blue colors, inherit text color)
        blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-blue-400 pl-4 py-2 mb-2 bg-blue-50 italic" {...props} />
        ),
        
        // Fixed tables with proper structure (simplified working version)
        table: ({node, ...props}) => (
            <div className="overflow-x-auto mb-2">
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden" {...props} />
            </div>
        ),
        th: ({node, ...props}) => (
            <th className="bg-gray-100 border border-gray-200 px-3 py-2 text-left font-medium text-gray-800" {...props} />
        ),
        td: ({node, ...props}) => (
            <td className="bg-white border border-gray-200 px-3 py-2 text-gray-700" {...props} />
        ),
        
        // Style horizontal rules (reverted)
        hr: ({node, ...props}) => <hr className="border-gray-300 my-2" {...props} />,
        
        // Enhanced text formatting (inherit text color)
        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
        em: ({node, ...props}) => <em className="italic font-medium" {...props} />,
        
        // Add support for other markdown elements (inherit text color)
        del: ({node, ...props}) => <del className="line-through opacity-75" {...props} />,
        mark: ({node, ...props}) => <mark className="bg-yellow-200 px-1 rounded" {...props} />,
        
        // Simple image support
        img: MarkdownImage,
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
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:block">
                                        <RightLogo />
                                    </div>
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
                                    <button
                                        onClick={handleLogout}
                                        className="px-2 py-1 sm:px-4 sm:py-2 bg-red-100 hover:bg-red-200 rounded-lg transition-all duration-200 text-red-700 text-xs sm:text-sm font-medium border border-red-300"
                                        title="Sign out"
                                    >
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </header>

                        {/* Chat Messages Area */}
                        <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 bg-gray-50/30">
                            {messages.map((msg, index) => (
                                <div
                                    key={msg.id || index}
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
                                        {msg.isSearching ? (
                                            <div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-4 h-4 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                    <p className="text-sm text-blue-600 font-medium">Searching Microsoft Docs...</p>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Finding relevant documentation and generating response</p>
                                            </div>
                                        ) : (
                                            <div className={msg.sender === 'user' ? 'text-white' : 'text-gray-900'}>
                                                {renderMessageContent(msg.text)}
                                            </div>
                                        )}
                                    </div>
                                    {msg.sender === 'user' && (
                                        <div className="p-2 sm:p-3 bg-gray-600 rounded-full shadow-sm flex-shrink-0">
                                            <UserIcon />
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="p-4 text-red-600 text-center border-t border-gray-200 bg-red-50">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm">{error}</span>
                                </div>
                                <button
                                    onClick={clearError}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                >
                                    Dismiss & Try Again
                                </button>
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
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        // Clear error when user starts typing again
                                        if (error) {
                                            clearError();
                                        }
                                    }}
                                    placeholder="Ask about Azure, AI, etc..."
                                    className="flex-1 p-3 sm:p-4 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                                    disabled={isLoading}
                                />
                                <button
                                    type={isLoading ? "button" : "submit"}
                                    onClick={isLoading ? handleCancel : undefined}
                                    disabled={false}
                                    className={`p-3 sm:p-4 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm flex-shrink-0 ${
                                        isLoading 
                                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                                            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed'
                                    }`}
                                    title={isLoading ? "Cancel request" : "Send message"}
                                >
                                    {isLoading ? (
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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