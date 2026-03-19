// netlify/functions/generate-tokens.js
// Analiza el logo con Claude y genera tokens.css único para el restaurante

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

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