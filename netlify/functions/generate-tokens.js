// netlify/functions/generate-tokens.js
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const PROMPT = `Eres un experto en diseño de identidad visual para restaurantes. Analiza este logo y genera un sistema de diseño CSS completamente único. Responde ÚNICAMENTE con JSON válido sin markdown:
{"style":"estilo detectado","description":"descripción breve","colors":[{"hex":"#xxxxxx","name":"nombre","role":"primary"},{"hex":"#xxxxxx","name":"nombre","role":"secondary"},{"hex":"#xxxxxx","name":"nombre","role":"accent"},{"hex":"#xxxxxx","name":"nombre","role":"background"},{"hex":"#xxxxxx","name":"nombre","role":"text"}],"fonts":[{"name":"Google Font","role":"Display / Títulos","weights":"700,900"},{"name":"Google Font","role":"Body / Texto","weights":"400,500,600"}],"tokens_css":":root { --clr-black: #0a0a0a; --clr-black-rich: #111; --clr-surface: #161616; --clr-surface-2: #1e1e1e; --clr-border: #2a2a2a; --clr-border-light: rgba(255,255,255,0.08); --clr-white: #ffffff; --clr-white-dim: rgba(255,255,255,0.65); --clr-white-ghost: rgba(255,255,255,0.10); --clr-red: COLOR_PRIMARIO; --clr-red-bright: PRIMARIO_BRILLANTE; --clr-red-dark: PRIMARIO_OSCURO; --clr-red-glow: PRIMARIO_RGBA_18; --clr-red-glow-hard: PRIMARIO_RGBA_38; --clr-gold: COLOR_ACENTO; --clr-gold-warm: ACENTO_CALIDO; --clr-gold-pale: ACENTO_PALIDO; --clr-gold-glow: ACENTO_RGBA_18; --clr-gold-glow-hard: ACENTO_RGBA_38; --font-display: FONT_DISPLAY; --font-heading: FONT_HEADING; --font-body: FONT_BODY; --font-label: FONT_LABEL; --fw-regular:400; --fw-medium:500; --fw-semibold:600; --fw-bold:700; --fw-black:900; --fs-xs:clamp(0.75rem,1.2vw,0.875rem); --fs-sm:clamp(0.875rem,1.5vw,1rem); --fs-base:clamp(1rem,1.8vw,1.125rem); --fs-md:clamp(1.125rem,2vw,1.375rem); --fs-lg:clamp(1.375rem,2.5vw,1.75rem); --fs-xl:clamp(1.75rem,3.5vw,2.5rem); --fs-2xl:clamp(2.5rem,5vw,4rem); --fs-3xl:clamp(3.5rem,7vw,6.5rem); --fs-hero:clamp(3.5rem,9vw,9rem); --sp-1:0.25rem; --sp-2:0.5rem; --sp-3:0.75rem; --sp-4:1rem; --sp-5:1.25rem; --sp-6:1.5rem; --sp-8:2rem; --sp-10:2.5rem; --sp-12:3rem; --sp-16:4rem; --sp-20:5rem; --sp-24:6rem; --radius-sm:4px; --radius-md:8px; --radius-lg:16px; --radius-xl:24px; --radius-pill:9999px; --radius-circle:50%; --shadow-sm:0 2px 8px rgba(0,0,0,0.6); --shadow-md:0 4px 20px rgba(0,0,0,0.7); --shadow-lg:0 8px 40px rgba(0,0,0,0.8); --shadow-red:0 0 30px var(--clr-red-glow); --shadow-red-hard:0 4px 24px var(--clr-red-glow-hard); --z-dropdown:100; --z-sticky:200; --z-overlay:300; --z-modal:400; --z-toast:500; --ease-out-expo:cubic-bezier(0.16,1,0.3,1); --ease-out-quart:cubic-bezier(0.25,1,0.5,1); --ease-spring:cubic-bezier(0.34,1.56,0.64,1); --dur-fast:150ms; --dur-normal:250ms; --dur-slow:400ms; --transition-fast:all 150ms cubic-bezier(0.25,1,0.5,1); --transition-normal:all 250ms cubic-bezier(0.25,1,0.5,1); --transition-slow:all 400ms cubic-bezier(0.16,1,0.3,1); --blur-sm:blur(4px); --blur-md:blur(12px); --blur-lg:blur(24px); --grad-black-bottom:linear-gradient(to top,var(--clr-black) 0%,transparent 100%); --grad-overlay:linear-gradient(135deg,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.4) 100%); --grad-red:linear-gradient(135deg,var(--clr-red) 0%,var(--clr-red-dark) 100%); --grad-gold:linear-gradient(135deg,var(--clr-gold) 0%,var(--clr-gold-warm) 100%); --grad-surface:linear-gradient(180deg,var(--clr-surface) 0%,var(--clr-black-rich) 100%); }"}`

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }

  try {
    const { image, mediaType } = JSON.parse(event.body)
    if (!image) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Imagen requerida' }) }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mediaType || 'image/png', data: image } },
            { text: PROMPT }
          ]
        }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 3000 }
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini API error:', err)
      throw new Error('Error Gemini: ' + err)
    }

    const gemini = await response.json()
    const text = gemini.candidates?.[0]?.content?.parts?.[0]?.text || ''
    if (!text) throw new Error('Gemini no devolvió respuesta')

    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(clean)
    } catch (e) {
      console.error('Parse error:', text)
      throw new Error('JSON inválido de Gemini')
    }

    return { statusCode: 200, headers, body: JSON.stringify(parsed) }

  } catch (err) {
    console.error('Function error:', err)
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }
  }
}
