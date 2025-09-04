import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { messages, stream = true, temperature = 0.7, max_tokens = 1000 } = await request.json();

    // Get the API key from environment variables
    const apiKey = process.env.CLONE_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(
        { error: 'API key not configured. Please set CLONE_KEY in your environment variables.' },
        { status: 500 }
      );
    }

    // Make the request to the external API
    const response = await fetch('https://mbpzfjgj6wjdhzgrsfhgt6ql.agents.do-ai.run/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages,
        stream,
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      
      return NextResponse.json(
        { error: `API request failed with status ${response.status}` },
        { status: response.status }
      );
    }

    // If streaming is requested, pass through the stream
    if (stream) {
      const stream = new ReadableStream({
        start(controller) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          
          function pump() {
            return reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();
                return;
              }
              
              // Filter out [DONE] markers and clean content
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');
              const filteredLines = lines.filter(line => 
                line.trim() !== '[DONE]' && 
                !line.includes('data: [DONE]') &&
                line.trim() !== ''
              );
              
              if (filteredLines.length > 0) {
                controller.enqueue(new TextEncoder().encode(filteredLines.join('\n')));
              }
              
              return pump();
            });
          }
          
          return pump();
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // For non-streaming responses
      const data = await response.json();
      return NextResponse.json(data);
    }

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
