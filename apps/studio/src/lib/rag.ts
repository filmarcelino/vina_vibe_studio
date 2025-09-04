export async function askRag(query: string): Promise<string[]> {
  const base = process.env.NEXT_PUBLIC_RAG_URL!;
  try {
    // Tenta POST /query
    const r1 = await fetch(`${base}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (r1.ok) {
      const j = await r1.json();
      const arr = Array.isArray(j) ? j : (j.answers || j.result || j.output || []);
      return arr && arr.length ? arr.map(String) : [JSON.stringify(j)];
    }
  } catch (_) {}

  try {
    // Fallback GET /search?q=
    const r2 = await fetch(`${base}/search?q=` + encodeURIComponent(query));
    if (r2.ok) {
      const j = await r2.json();
      const arr = Array.isArray(j) ? j : (j.answers || j.result || j.output || []);
      return arr && arr.length ? arr.map(String) : [JSON.stringify(j)];
    }
  } catch (_) {}

  return ['[RAG] Não consegui obter resposta. Verifique URL/endpoint.'];
}