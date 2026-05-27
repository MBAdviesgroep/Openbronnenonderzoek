# Openbronnen Onderzoek · MB adviesgroep

AI-gestuurde verkenningstool voor bedrijven, bestuurders en reputatie — gebaseerd op openbare bronnen via GPT‑4o met live web search.

De OpenAI API-sleutel zit **server-side** in een environment variable — gebruikers hoeven nooit een sleutel in te vullen.

---

## 🚀 Live zetten op Vercel

### Optie A · vanuit GitHub (aanbevolen)

1. Push deze map naar een GitHub-repository.
2. Ga naar [vercel.com/new](https://vercel.com/new) en importeer de repo.
3. Onder **Environment Variables** voeg toe:

   | Naam | Waarde |
   |---|---|
   | `OPENAI_API_KEY` | `sk-...` (uw OpenAI-sleutel) |

4. Klik **Deploy**. Klaar.

### Optie B · met de Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link            # koppel aan een nieuw of bestaand project
vercel env add OPENAI_API_KEY    # plak de sleutel
vercel --prod
```

---

## 🧪 Lokaal draaien

```bash
npm i -g vercel
echo "OPENAI_API_KEY=sk-..." > .env.local
vercel dev
```

Open daarna [http://localhost:3000](http://localhost:3000).

> **Let op:** als u `index.html` direct in de browser opent (zonder `vercel dev`) bestaat `/api/onderzoek` niet en krijgt u een foutmelding. Voor lokaal gebruik altijd `vercel dev` draaien.

---

## 📁 Structuur

```
.
├── index.html              # de tool (HTML + CSS + JS, alles inline)
├── api/
│   └── onderzoek.js        # serverless function → OpenAI
├── assets/
│   └── logo.webp           # MB adviesgroep-logo
├── vercel.json             # function-config (maxDuration 60s)
├── package.json
├── .env.example
└── README.md
```

---

## 🔐 Beveiliging

- De OpenAI-sleutel staat **alleen** in `OPENAI_API_KEY` op Vercel — nooit in code, browser of repository.
- `.env.local` en `.vercel` zijn ge‑gitignored.
- De serverless function valideert input-lengte en doet geen logging van prompts.

**Optioneel — toegang afschermen:**  wilt u de tool alleen intern beschikbaar? Zet er Vercel Password Protection (Pro plan) of een eenvoudig wachtwoord-veld vóór, of beperk via Vercel's Deployment Protection.

---

## ⚙️ Aanpassingen

- **Andere LLM / model**: pas `model: 'gpt-4o'` aan in `api/onderzoek.js`.
- **Promptstijl**: zoek `buildPrompt` in `index.html`.
- **Huisstijl-kleuren**: bovenaan de `<style>` in `index.html`, sectie `:root`.

---

## ℹ️ Versie

v2.0 — May 2026 · gebouwd voor MB adviesgroep
