import { NextRequest, NextResponse } from 'next/server';

interface RagRequest {
  query?: string;
  q?: string;
}

interface RagResponse {
  ok: boolean;
  answers: string[];
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RagRequest = await request.json();
    const query = body.query || body.q;
    
    if (!query) {
      return NextResponse.json(
        { ok: false, answers: [], error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const ragServerUrl = process.env.RAG_SERVER_URL;
    if (!ragServerUrl) {
      return NextResponse.json(
        { ok: false, answers: [], error: 'RAG server not configured' },
        { status: 500 }
      );
    }

    // Try first endpoint: /search?q=query
    let response;
    try {
      const searchUrl = `${ragServerUrl}/search?q=${encodeURIComponent(query)}`;
      response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000),
      });
      
      if (response.status === 404) {
        // Try alternative endpoint: /search?query=query
        const altSearchUrl = `${ragServerUrl}/search?query=${encodeURIComponent(query)}`;
        response = await fetch(altSearchUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        });
      }
    } catch (error) {
      console.error('RAG server connection error:', error);
      return NextResponse.json(
        { ok: false, answers: [], error: 'Failed to connect to RAG server' },
        { status: 503 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, answers: [], error: `RAG server error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Normalize response - handle different response formats
    let answers: string[] = [];
    
    if (Array.isArray(data)) {
      // Direct array of strings
      answers = data.slice(0, 3).map(item => 
        typeof item === 'string' ? item : JSON.stringify(item)
      );
    } else if (data.results && Array.isArray(data.results)) {
      // { results: [...] }
      answers = data.results.slice(0, 3).map((item: any) => 
        typeof item === 'string' ? item : (item.text || item.content || JSON.stringify(item))
      );
    } else if (data.answers && Array.isArray(data.answers)) {
      // { answers: [...] }
      answers = data.answers.slice(0, 3).map((item: any) => 
        typeof item === 'string' ? item : JSON.stringify(item)
      );
    } else if (data.documents && Array.isArray(data.documents)) {
      // { documents: [...] }
      answers = data.documents.slice(0, 3).map((item: any) => 
        item.content || item.text || JSON.stringify(item)
      );
    } else {
      // Fallback: try to extract any meaningful text
      const fallbackText = data.response || data.answer || data.text || JSON.stringify(data);
      answers = [fallbackText].slice(0, 3);
    }

    const normalizedResponse: RagResponse = {
      ok: true,
      answers: answers.filter(answer => answer && answer.trim().length > 0)
    };

    return NextResponse.json(normalizedResponse);
    
  } catch (error) {
    console.error('RAG proxy error:', error);
    return NextResponse.json(
      { ok: false, answers: [], error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}