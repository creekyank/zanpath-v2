# =========================
# Agent EN：英文文章（DeepSeek）
# =========================

def agent_en_article(title, module):
    return f"""You are a master of Chinese environmental culture (Feng Shui) and traditional aesthetics, blending classical theories with modern environmental psychology.

Your expertise includes:
- Feng Shui principles
- Qi (energy flow) analysis
- Yin-Yang balance in environments
- Five Elements theory (Wood, Fire, Earth, Metal, Water)
- Spatial harmony and environmental psychology

Write a high-quality educational article.

Title: {title}
Module: {module}

--------------------------------------------------

STRICT OUTPUT RULES:

1 Output MUST be pure Markdown
2 NO HTML
3 NO JSON
4 NO code blocks
5 NO links
6 NO images
7 NO metadata
8 NO FAQ
9 NO disclaimers
10 Do NOT explain the title at the beginning
11 Avoid repetition
12 NO Chinese characters (Strictly ONLY English)

--------------------------------------------------

ARTICLE STRUCTURE:

# {title}

Write a clear introduction explaining the topic.

## Core Concept

Explain the Feng Shui concept in simple terms:

- What this space/layout/element represents
- How it influences energy (Qi)
- Real-life examples of environments

## Traditional Feng Shui Perspective

Explain from classical Feng Shui principles:

- Yin-Yang balance in space
- Five Elements interactions
- Qi flow and spatial harmony
- Symbolism of layout, direction, and structure

## Modern Interpretation

Explain how modern people understand it:

- Environmental psychology
- Impact of space on mood and behavior
- Productivity, stress, and lifestyle influence
- Practical real-life meaning

## Insights

Write 3–5 bullet points.

Each bullet MUST:
- Be a complete sentence
- Be at least 12 words
- Provide a concrete, practical insight

DO NOT leave this section empty.

## Conclusion

Summarize clearly.

--------------------------------------------------

CONTENT GUIDELINES:

- 800–1200 words
- Educational tone
- Clear structure
- Short paragraphs
- Avoid fortune-telling conclusions
- Focus on explanation, not prediction

--------------------------------------------------

OUTPUT RULE:

Return ONLY Markdown content.
"""
#============================================================
# Agent EN SEO：SEO 元数据生成（Llama3 强力约束版）
# ============================================================
def agent_en_seo(title, module):
    return f"""You are a Senior SEO Specialist. Generate full metadata for the article "{title}".

--------------------------------------------------
STRICT CONTENT RULES:
1. NO EMPTY FIELDS: All arrays MUST contain at least 3-5 high-quality items.
2. RELEVANCE: Keywords must be derived directly from "{title}".
3. DO NOT use generic "feng shui guide" text. Focus strictly on the specific space or situation.
4. metaDescription: Must be a compelling click-bait style summary (100-120 chars).

--------------------------------------------------
JSON STRUCTURE:
{{
  "metaTitle": "SEO title with primary keyword (max 60 chars)",
  "metaDescription": "Compelling summary for {title}",
  "primaryKeyword": "feng shui meaning of {title}",
  "secondaryKeywords": [
    "feng shui layout meaning",
    "home energy flow analysis",
    "feng shui house interpretation",
    "feng shui environment balance"
  ],
  "longTailKeywords": [
    "What does {title} mean in feng shui?",
    "How does this space affect energy flow?",
    "feng shui meaning of home layout and energy",
    "how to improve feng shui in this situation"
  ],
  "semanticKeywords": [
    "feng shui energy",
    "qi flow",
    "yin yang balance",
    "five elements feng shui",
    "spatial harmony"
  ],
  "keywords": [
    "Feng Shui",
    "Home Energy",
    "Qi Flow",
    "{title}"
  ],
  "summary": "2-3 sentences explaining how this space or environment affects energy, balance, and personal state.",
  "featuredSnippetAnswer": "A clear 40-50 word answer explaining the feng shui meaning and its impact on daily life and energy flow.",
  "ctaText": "Discover your space with ZanPath AI",
  "faq": [
    {{ "question": "What does {title} mean in feng shui?", "answer": "Detailed explanation of spatial meaning and energy flow." }},
    {{ "question": "Does this layout affect my energy or life?", "answer": "Explain influence on emotions, stability, and daily experience." }},
    {{ "question": "How can I improve this feng shui situation?", "answer": "Provide simple and practical adjustment suggestions." }}
  ]
}}

--------------------------------------------------
OUTPUT RULE:
Return ONLY valid JSON. No Markdown markers. No preamble.
"""

# =========================
# Agent3 图片关键词（优化：更具视觉感）
# =========================
def agent3(title):
    return f"""Generate 10 visual, concrete image search keywords for stock photo sites.

Article title: {title}

RULES:
- OUTPUT ONLY the keywords.
- NO introductory text, NO conversational fillers.
- NO numbering.
- MUST be visually describable (real-world spaces, rooms, objects).
- Focus on home, interior, layout, environment.
- Avoid abstract words like destiny, metaphysics.
- English only.
- One keyword per line.

STYLE HINTS:
- modern living room layout
- natural light home interior
- minimalist bedroom design
- indoor plants sunlight space
- calm home environment balance

Example:
bright living room sunlight window
minimalist bedroom soft lighting
indoor plants home corner
modern apartment open space
wood furniture natural interior
"""

# =========================
# Agent6 英文 -> 西班牙语（增强术语准确性）
# =========================

def agent6(title, article):
    return f"""Translate the English article into Spanish.

STRICT RULES:
1. Native Spanish (informal 'tú'): Use tu/tus instead of su/sus.
2. KEEP structure (#, ##, -) EXACTLY the same.
3. DO NOT add, remove, or duplicate any headings.
4. DO NOT output labels like "[TITLE]" or "[CONTENT]". 
5. DO NOT repeat the title at the top of the article body.
6. NO literal English translations (natural flow).

CRITICAL TERMINOLOGY:
- "Feng Shui" → "feng shui"
- "energy flow" → "flujo de energía"
- "Qi" → "energía vital"
- "balance" → "equilibrio"
- "Five Elements" → "los cinco elementos"
- "space" → "espacio"
- "layout" → "distribución"

---
TARGET TITLE (Translate this as the only H1): {title}
---
ARTICLE TO TRANSLATE:
{article}
"""

# =========================
# Agent7 SEO -> 西班牙语（保持 JSON 完整性）
# =========================
def agent7(seo):
    return f"""Translate the following SEO JSON into Spanish.

STRICT RULES:
1. Translate ONLY the values (text), NOT the keys.
2. Keep the JSON structure 100% identical.
3. Ensure 'metaTitle' and 'metaDescription' remain within SEO length limits in Spanish.
4. Output valid JSON ONLY. No explanation. DO NOT include Markdown code blocks (```json) or any preamble.

TERMINOLOGY:
- Feng Shui → feng shui
- Qi Flow → flujo de energía
- Home Energy → energía del hogar

JSON:
{seo}
"""

# =========================
# 最终评分（严格模式）
# =========================
def score_final(article, seo):
    return f"""You are an AI Content Auditor. Rate this article and its SEO data.

CRITERIA:
1. RELEVANCE (40%): Does the SEO data match the Article content?
2. DEPTH (30%): Is the article detailed (800+ words) or just surface-level?
3. STRUCTURE (20%): Proper use of H1, H2, and lists.
4. GRAMMAR (10%): Professional English.

SCORING:
- 90-100: Exceptional, ready for Pillar Page.
- 80-89: Good, standard blog post.
- <70: Reject and Rewrite.

OUTPUT JSON:
{{
  "score": 0,
  "quality": "high/medium/low",
  "reason": "Be specific about why you gave this score"
}}

Article: {article[:2000]}... (Content truncated for scoring)
SEO: {seo}
"""