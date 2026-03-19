// netlify/functions/generate-tokens.js
// Analiza el logo con Gemini y genera tokens.css único para el restaurante

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const PROMPT = `Eres un experto en diseño de identidad visual para restaurantes.

Analiza este logo y genera un sistema de diseño CSS completamente único y original.

IMPORTANTE:
- El estilo debe ser 100% fiel a la personalidad del logo
- Los colores deben ser extraídos o derivados del logo
- Las tipografías deben complementar la estética del logo
- NUNCA uses estilos genéricos — cada restaurante debe verse único
- Usa Google Fonts disponibles gratuitamente

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta (sin markdown, sin backticks):

{
  "style": "nombre del estilo detectado (ej: Rústico Peruano, Moderno Minimalista, Elegante Oscuro)",
  "description": "descripción de 1-2 oraciones de la identidad visual generada",
  "colors": [
    {"hex": "#xxxxxx", "name": "nombre del color", "role": "primary"},
    {"hex": "#xxxxxx", "name": "nombre del color", "role": "secondary"},
    {"hex": "#xxxxxx", "name": "nombre del color", "role": "accent"},
    {"hex": "#xxxxxx", "name": "nombre del color", "role": "background"},
    {"hex": "#xxxxxx", "name": "nombre del color", "role": "text"}
  ],
  "fonts": [
    {"name": "Nombre Google Font", "role": "Display / Títulos", "weights": "700,900"},
    {"name": "Nombre Google Font", "role": "Body / Texto", "weights": "400,500,600"}
  ],
  "tokens_css": "/* tokens.css completo aquí */"
}

El tokens_css debe incluir TODAS estas variables CSS con valores únicos basados en el logo:
:root {
  --clr-black: (fondo más oscuro);
  --clr-black-rich: (variante oscura);
  --clr-surface: (superficie de cards);
  --clr-surface-2: (superficie secundaria);
  --clr-border: (borde sutil);
  --clr-border-light: (borde muy sutil rgba);
  --clr-white: (texto principal);
  --clr-white-dim: (texto secundario rgba);
  --clr-white-ghost: (texto muy sutil rgba);
  --clr-red: (COLOR PRIMARIO de la marca extraído del logo);
  --clr-red-bright: (variante brillante del primario);
  --clr-red-dark: (variante oscura del primario);
  --clr-red-glow: (primario con baja opacidad rgba);
  --clr-red-glow-hard: (primario con media opacidad rgba);
  --clr-gold: (COLOR ACENTO de la marca extraído del logo);
  --clr-gold-warm: (variante cálida del acento);
  --clr-gold-pale: (acento muy claro);
  --clr-gold-glow: (acento con baja opacidad rgba);
  --clr-gold-glow-hard: (acento con media opacidad rgba);
  --font-display: 'FontElegida', fallback;
  --font-heading: 'FontHeading', fallback;
  --font-body: 'FontBody', fallback;
  --font-label: 'FontLabel', monospace;
  --fw-regular: 400; --fw-medium: 500; --fw-semibold: 600; --fw-bold: 700; --fw-black: 900;
  --fs-xs: clamp(0.75rem, 1.2vw, 0.875rem);
  --fs-sm: clamp(0.875rem, 1.5vw, 1rem);
  --fs-base: clamp(1rem, 1.8vw, 1.125rem);
  --fs-md: clamp(1.125rem, 2vw, 1.375rem);
  --fs-lg: clamp(1.375rem, 2.5vw, 1.75rem);
  --fs-xl: clamp(1.75rem, 3.5vw, 2.5rem);
  --fs-2xl: clamp(2.5rem, 5vw, 4rem);
  --fs-3xl: clamp(3.5rem, 7vw, 6.5rem);
  --fs-hero: clamp(3.5rem, 9vw, 9rem);
  --sp-1: 0.25rem; --sp-2: 0.5rem; --sp-3: 0.75rem; --sp-4: 1rem;
  --sp-5: 1.25rem; --sp-6: 1.5rem; --sp-8: 2rem; --sp-10: 2.5rem;
  --sp-12: 3rem; --sp-16: 4rem; --sp-20: 5rem; --sp-24: 6rem;
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 16px;
  --radius-xl: 24px; --radius-pill: 9999px; --radius-circle: 50%;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.6);
  --shadow-md: 0 4px 20px rgba(0,0,0,0.7);
  --shadow-lg: 0 8px 40px rgba(0,0,0,0.8);
  --shadow-red: 0 0 30px VAR_RED_GLOW, 0 0 80px VAR_RED_GLOW;
  --shadow-red-hard: 0 4px 24px VAR_RED_GLOW_HARD;
  --z-dropdown: 100; --z-sticky: 200; --z-overlay: 300; --z-modal: 400; --z-toast: 500;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --dur-fast: 150ms; --dur-normal: 250ms; --dur-slow: 400ms;
  --transition-fast: all 150ms cubic-bezier(0.25, 1, 0.5, 1);
  --transition-normal: all 250ms cubic-bezier(0.25, 1, 0.5, 1);
  --transition-slow: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
  --blur-sm: blur(4px); --blur-md: blur(12px); --blur-lg: blur(24px);
  --grad-black-bottom: linear-gradient(to top, VAR_BLACK 0%, transparent 100%);
  --grad-overlay: linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 100%);
  --grad-red: linear-gradient(135deg, VAR_RED 0%, VAR_RED_DARK 100%);
  --grad-gold: linear-gradient(135deg, VAR_GOLD 0%, VAR_GOLD_WARM 100%);
  --grad-surface: linear-gradient(180deg, VAR_SURFACE 0%, VAR_BLACK_RICH 100%);
}

NOTA CRÍTICA: --clr-red y --clr-gold NO son rojo y dorado literalmente.
Son los slots del color primario y acento. Úsalos con los colores reales del logo.
Ejemplo: logo azul y naranja → --clr-red: #1a4f8a; --clr-gold: #f07d3a`

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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inline_data: {
                mime_type: mediaType || 'image/png',
                data: image
              }
            },
            { text: PROMPT }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 3000,
        }
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini API error:', err)
      throw new Error('Error al llamar a Gemini API: ' + err)
    }

    const gemini = await response.json()
    const text = gemini.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!text) throw new Error('Gemini no devolvió respuesta')

    // Limpiar posibles backticks de markdown
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(clean)
    } catch (e) {
      console.error('Error parsing Gemini response:', text)
      throw new Error('Gemini no devolvió JSON válido')
    }

    return { statusCode: 200, headers, body: JSON.stringify(parsed) }

  } catch (err) {
    console.error('Function error:', err)
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }
  }
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { image, mediaType } = JSON.parse(event.body)

    if (!image) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Imagen requerida' }) }
    }

    // ── Llamar a Claude API ──────────────────────────────
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type:       'base64',
                media_type: mediaType || 'image/png',
                data:       image,
              }
            },
            {
              type: 'text',
              text: `Eres un experto en diseño de identidad visual para restaurantes.

Analiza este logo y genera un sistema de diseño CSS completamente único y original.

IMPORTANTE:
- El estilo debe ser 100% fiel a la personalidad del logo
- Los colores deben ser extraídos o derivados del logo
- Las tipografías deben complementar la estética del logo
- NUNCA uses estilos genéricos — cada restaurante debe verse único
- Usa Google Fonts disponibles gratuitamente

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:

{
  "style": "nombre del estilo detectado (ej: Rústico Peruano, Moderno Minimalista, Elegante Oscuro)",
  "description": "descripción de 1-2 oraciones de la identidad visual generada",
  "colors": [
    {"hex": "#xxxxxx", "name": "nombre del color", "role": "primary|secondary|accent|background|text"},
    {"hex": "#xxxxxx", "name": "nombre del color", "role": "primary|secondary|accent|background|text"},
    {"hex": "#xxxxxx", "name": "nombre del color", "role": "primary|secondary|accent|background|text"},
    {"hex": "#xxxxxx", "name": "nombre del color", "role": "primary|secondary|accent|background|text"},
    {"hex": "#xxxxxx", "name": "nombre del color", "role": "primary|secondary|accent|background|text"}
  ],
  "fonts": [
    {"name": "Nombre Google Font", "role": "Display / Títulos", "weights": "700,900"},
    {"name": "Nombre Google Font", "role": "Body / Texto", "weights": "400,500,600"}
  ],
  "tokens_css": "/* tokens.css completo aquí */"
}

El tokens_css debe incluir TODAS estas variables CSS con valores únicos:
:root {
  /* Colores de marca */
  --clr-black, --clr-black-rich, --clr-surface, --clr-surface-2
  --clr-border, --clr-border-light
  --clr-white, --clr-white-dim, --clr-white-ghost
  --clr-red (color primario de marca), --clr-red-bright, --clr-red-dark
  --clr-red-glow, --clr-red-glow-hard
  --clr-gold (color de acento), --clr-gold-warm, --clr-gold-pale
  --clr-gold-glow, --clr-gold-glow-hard
  
  /* Tipografía */
  --font-display (la fuente display elegida)
  --font-heading
  --font-body (la fuente body elegida)
  --font-label
  
  /* Pesos */
  --fw-regular: 400; --fw-medium: 500; --fw-semibold: 600; --fw-bold: 700; --fw-black: 900;
  
  /* Tamaños fluidos con clamp() */
  --fs-xs, --fs-sm, --fs-base, --fs-md, --fs-lg, --fs-xl, --fs-2xl, --fs-3xl, --fs-hero
  
  /* Espaciado */
  --sp-1 al --sp-24
  
  /* Radios */
  --radius-sm, --radius-md, --radius-lg, --radius-xl, --radius-pill, --radius-circle
  
  /* Sombras */
  --shadow-sm, --shadow-md, --shadow-lg
  --shadow-red (usando el color primario), --shadow-red-hard
  
  /* Z-index */
  --z-dropdown: 100; --z-sticky: 200; --z-overlay: 300; --z-modal: 400; --z-toast: 500;
  
  /* Timing */
  --ease-out-expo, --ease-out-quart, --ease-spring
  --dur-fast: 150ms; --dur-normal: 250ms; --dur-slow: 400ms;
  --transition-fast, --transition-normal, --transition-slow
  
  /* Blur */
  --blur-sm, --blur-md, --blur-lg
  
  /* Gradientes únicos para este restaurante */
  --grad-black-bottom, --grad-overlay, --grad-red, --grad-gold, --grad-surface
}

NOTA: Las variables --clr-red y --clr-gold NO tienen que ser rojo y dorado literalmente.
Son los slots del color primario y acento de la marca. Úsalos con los colores del logo.
Por ejemplo si el logo es azul y naranja: --clr-red podría ser #1a4f8a y --clr-gold podría ser #f07d3a`
            }
          ]
        }]
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Claude API error:', err)
      throw new Error('Error al llamar a Claude API')
    }

    const claude = await response.json()
    const text = claude.content[0]?.text || ''

    // Parsear JSON de la respuesta
    let parsed
    try {
      // Limpiar posibles backticks de markdown
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(clean)
    } catch (e) {
      console.error('Error parsing Claude response:', text)
      throw new Error('Claude no devolvió JSON válido')
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(parsed)
    }

  } catch (err) {
    console.error('Function error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    }
  }
}