// ================================================================
// MB adviesgroep · Openbronnen Onderzoek
// Vercel serverless function — calls OpenAI server-side so the
// API-sleutel nooit in de browser komt.
//
// Vereist één environment variable in Vercel:
//   OPENAI_API_KEY = sk-...
// ================================================================

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY ontbreekt op de server. Voeg toe in Vercel → Settings → Environment Variables.'
    });
  }

  // Vercel parses JSON bodies automatically when Content-Type is application/json,
  // but be defensive:
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const { prompt } = body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Ongeldig verzoek: prompt ontbreekt.' });
  }
  if (prompt.length > 8000) {
    return res.status(400).json({ error: 'Prompt te lang.' });
  }

  try {
    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        tools: [{ type: 'web_search_preview' }],
        input: prompt
      })
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data?.error?.message || `OpenAI gaf status ${upstream.status} terug.`
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      error: 'Kon OpenAI niet bereiken: ' + (err?.message || 'onbekende fout')
    });
  }
}

// Vercel function configuration — give it room for web-search to finish.
export const config = {
  maxDuration: 60
};
