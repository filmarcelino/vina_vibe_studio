import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toStrings(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v.map((it) => {
      if (typeof it === 'string') return it;
      if (typeof it?.text === 'string') return it.text;
      if (typeof it?.content === 'string') return it.content;
      if (typeof it?.answer === 'string') return it.answer;
      return JSON.stringify(it);
    });
  }
  if (typeof v === 'object') {
    if (Array.isArray(v.answers)) return v.answers.map(String);
    if (Array.isArray(v.results)) return toStrings(v.results);
    if (typeof v.result === 'string') return [v.result];
    if (typeof v.output === 'string') return [v.output];
    if (typeof v.message === 'string') return [v.message];
  }
  return [JSON.stringify(v)];
}

async function tryPostJSON(url: string, body: any, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!r.ok) throw new Error(`POST ${url} -> ${r.status}`);
    return toStrings(await r.json());
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function tryGet(url: string, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const r = await fetch(url, { 
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!r.ok) throw new Error(`GET ${url} -> ${r.status}`);
    return toStrings(await r.json());
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const { query = '', q = '' } = await req.json().catch(() => ({}));
    const qStr = String(q || query || '').trim();
    
    if (!qStr) {
      console.warn('[RAG] Query vazia recebida');
      return NextResponse.json({ ok: false, error: 'query vazia' }, { status: 400 });
    }

    const base = process.env.RAG_SERVER_URL || process.env.NEXT_PUBLIC_RAG_URL;
    if (!base) {
      console.error('[RAG] RAG_SERVER_URL não configurado');
      return NextResponse.json({ ok: false, error: 'RAG_SERVER_URL não definido' }, { status: 500 });
    }

    console.log(`[RAG] Processando query: "${qStr}" para servidor: ${base}`);

    const candidates: Array<{ name: string; fn: () => Promise<string[]> }> = [
      { name: 'POST /search (q)', fn: () => tryPostJSON(`${base}/search`, { q: qStr }) },
      { name: 'POST /search (query)', fn: () => tryPostJSON(`${base}/search`, { query: qStr }) },
      { name: 'GET /search?q=', fn: () => tryGet(`${base}/search?q=${encodeURIComponent(qStr)}`) },
      { name: 'GET /search?query=', fn: () => tryGet(`${base}/search?query=${encodeURIComponent(qStr)}`) },
      { name: 'POST /v1/search (q)', fn: () => tryPostJSON(`${base}/v1/search`, { q: qStr }) },
      { name: 'GET /v1/search?q=', fn: () => tryGet(`${base}/v1/search?q=${encodeURIComponent(qStr)}`) },
    ];

    let lastErr: unknown = null;
    
    for (const { name, fn } of candidates) {
      try {
        console.log(`[RAG] Tentando: ${name}`);
        const answers = await retryWithBackoff(fn);
        
        if (answers.length) {
          const duration = Date.now() - startTime;
          console.log(`[RAG] Sucesso com ${name} em ${duration}ms - ${answers.length} respostas`);
          return NextResponse.json({ ok: true, answers, method: name, duration });
        } else {
          console.log(`[RAG] ${name} retornou array vazio`);
        }
      } catch (e) {
        lastErr = e;
        const errorMsg = e instanceof Error ? e.message : String(e);
        console.warn(`[RAG] Falha em ${name}: ${errorMsg}`);
      }
    }

    const duration = Date.now() - startTime;
    console.error(`[RAG] Todos os métodos falharam em ${duration}ms. Último erro:`, lastErr);
    
    return NextResponse.json(
      { 
        ok: false, 
        error: `RAG indisponível. Tentamos ${candidates.length} métodos diferentes.`,
        lastError: lastErr instanceof Error ? lastErr.message : String(lastErr),
        duration
      },
      { status: 502 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[RAG] Erro inesperado:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Erro interno do servidor RAG',
        duration
      },
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