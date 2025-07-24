import fetch from 'node-fetch';
const {
  AZURE_OPENAI_ENDPOINT,
  AZURE_OPENAI_KEY,
  AZURE_OPENAI_DEPLOYMENT_NAME
} = process.env;


export default async function handler(req, res) {
  // Set CORS headers for container environments
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { message, conversationHistory = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  console.log(`[MCP] Processing request with ${conversationHistory.length} previous messages`);

  const MCP_SERVER_URL = 'https://learn.microsoft.com/api/mcp';

  // Build context from conversation history
  let contextString = '';
  if (conversationHistory.length > 0) {
    console.log('[MCP] Including conversation history in context');
    contextString = '\n\nPrevious conversation context:\n';
    conversationHistory.slice(-6).forEach((msg, index) => { // Keep last 6 messages for context
      const role = msg.sender === 'user' ? 'User' : 'Assistant';
      contextString += `${role}: ${msg.text}\n`;
    });
    contextString += '\n';
  }

  const enhancedQuestion = `Please provide a comprehensive and detailed explanation about: ${message}. Include practical examples, best practices, and step-by-step guidance where applicable.${contextString}Current question: ${message}`;

  const mcpPayload = {
    "jsonrpc": "2.0",
    "id": `chat-${Date.now()}`,
    "method": "tools/call",
    "params": {
      "name": "microsoft_docs_search",
      "arguments": {
        "question": enhancedQuestion
      }
    }
  };


  try {
    // Step 1: Call MCP Server
    console.log('[MCP] Request initiated');
    console.log(`[MCP] URL: ${MCP_SERVER_URL}`);
    
    const mcpResponse = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'User-Agent': 'mcp-remote-client',
      },
      body: JSON.stringify(mcpPayload),
    });

    console.log(`[MCP] Response received: HTTP ${mcpResponse.status}`);

    if (mcpResponse.ok) {
      console.log(`[MCP] ✅ Success - HTTP ${mcpResponse.status}`);
    } else {
      console.log(`[MCP] ❌ Error - HTTP ${mcpResponse.status}`);
    }

    if (!mcpResponse.ok) {
      const errorText = await mcpResponse.text();
      console.error('[MCP] Error response body:', errorText);
      throw new Error(`MCP Server responded with status: ${mcpResponse.status}`);
    }

    const responseText = await mcpResponse.text();
    const lines = responseText.split('\n').filter(line => line.trim() !== '');
    const dataLine = lines.find(line => line.trim().startsWith('data:') && line.includes('"jsonrpc"'));

    if (!dataLine) {
      console.error("[MCP] Could not find JSON-RPC response in SSE stream");
      throw new Error('Invalid response format from server.');
    }

    const jsonString = dataLine.substring(5).trim();
    const responseData = JSON.parse(jsonString);

    if (responseData.error) {
      console.error('[MCP] JSON-RPC Error:', responseData.error);
      throw new Error(`MCP error: ${responseData.error.message}`);
    }

    const toolResult = responseData.result;
    const retrievedText = toolResult.content
      .filter(part => part.type === 'text' && part.text)
      .map(part => part.text)
      .join('\n\n');

    console.log('[MCP] ✅ MCP server request completed successfully');

    if (!retrievedText.trim()) {
      return res.status(200).json({ reply: "I found some documentation, but it didn't contain any readable text to analyze." });
    }

    // Step 2: Call External AI Model for Summarization -Alternative Approach
    // const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer sk-proj-xxxxx`, // Replace with your API key
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-4', // Use the appropriate model
    //     messages: [
    //       { role: 'system', content: 'You are an expert assistant. Synthesize helpful answers based on the provided context.' },
    //       { role: 'user', content: `Context:\n${retrievedText}\n\nQuestion:\n${message}` }
    //     ],
    //     max_tokens: 500,
    //     temperature: 0.7,
    //   }),
    // });

    // if (!aiResponse.ok) {
    //   const errorText = await aiResponse.text();
    //   console.error('AI Model Error:', errorText);
    //   throw new Error('Failed to get a response from the AI model.');
    // }
  const azureUrl = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2025-01-01-preview`;

  // Build messages array with conversation history
  const messages = [
    { 
      role: 'system', 
      content: 'You are an expert assistant. Synthesize helpful answers based on the provided context from Microsoft documentation. Maintain conversation continuity and refer to previous context when relevant.' 
    }
  ];

  // Add conversation history (limit to last 10 messages to avoid token limits)
  if (conversationHistory.length > 0) {
    conversationHistory.slice(-10).forEach(msg => {
      const role = msg.sender === 'user' ? 'user' : 'assistant';
      messages.push({ role, content: msg.text });
    });
  }

  // Add current context and question
  messages.push({ 
    role: 'user', 
    content: `Based on the following Microsoft documentation context, please answer the question. Consider the previous conversation for continuity.\n\nContext from Microsoft Docs:\n${retrievedText}\n\nCurrent Question: ${message}` 
  });

  const aiResponse = await fetch(azureUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': AZURE_OPENAI_KEY
    },
    body: JSON.stringify({
      messages,
      max_tokens: 1000,
      temperature: 0.7
    }),
  });

  if (!aiResponse.ok) {
    const errorText = await aiResponse.text();
    console.error('Azure OpenAI Error:', errorText);
    throw new Error('Failed to get a response from Azure OpenAI.');
  }

    const aiResponseData = await aiResponse.json();
    const synthesizedAnswer = aiResponseData.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    // Step 3: Send the Synthesized Answer Back to the Frontend
    res.status(200).json({ reply: synthesizedAnswer });

  } catch (error) {
    console.error('[MCP] ❌ Error during MCP server request or AI processing:', error);
    console.error('[MCP] Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to process the request.' });
  }
}