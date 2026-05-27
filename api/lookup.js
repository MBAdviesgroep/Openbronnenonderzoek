// ================================================================
// MB adviesgroep · KvK Quick-lookup
// Korte AI-call die bij een KvK-nummer de basisgegevens ophaalt
// (bedrijfsnaam, locatie, bestuurder, sector) zodat het formulier
// automatisch gevuld kan worden.
// ================================================================

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY ontbreekt op de server.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const kvk = (body?.kvk || '').toString().replace(/\D/g, '');
  if (!kvk || kvk.length < 7 || kvk.length > 9) {
    return res.status(400).json({ error: 'Geldig KvK-nummer (7–9 cijfers) vereist.' });
  }

  const prompt = `Zoek via openbare bronnen (handelsregister, bedrijfswebsite, nieuwsberichten) de basisgegevens van de Nederlandse onderneming met KvK-nummer ${kvk}.

Antwoord UITSLUITEND met een geldig JSON-object (geen markdown, geen toelichting), in dit exacte format:

{
  "bedrijfsnaam": "Volledige statutaire naam",
  "locatie": "Plaats, provincie",
  "eigenaar": "Naam bestuurder/DGA (één persoon, indien bekend)",
  "sector": "Korte sector-omschrijving (1-3 woorden)"
}

Als een veld niet gevonden kan worden, gebruik een lege string "". Verzin niets.`;

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
        error: data?.error?.message || `OpenAI status ${upstream.status}`
      });
    }

    // Extract text from response
    let text = '';
    if (data.output) {
      for (const block of data.output) {
        if (block.type === 'message' && block.content) {
          for (const c of block.content) {
            if (c.type === 'output_text') text += c.text;
          }
        }
      }
    }

    // Find JSON object in response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(200).json({
        bedrijfsnaam: '', locatie: '', eigenaar: '', sector: '',
        warning: 'Geen gestructureerd antwoord ontvangen.'
      });
    }
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return res.status(200).json({
        bedrijfsnaam: parsed.bedrijfsnaam || '',
        locatie:      parsed.locatie || '',
        eigenaar:     parsed.eigenaar || '',
        sector:       parsed.sector || ''
      });
    } catch {
      return res.status(200).json({
        bedrijfsnaam: '', locatie: '', eigenaar: '', sector: '',
        warning: 'Kon antwoord niet parsen.'
      });
    }

  } catch (err) {
    return res.status(500).json({ error: 'Lookup mislukt: ' + (err?.message || 'onbekend') });
  }
}

export const config = { maxDuration: 30 };
