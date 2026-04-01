# =========================
# Agent EN：英文文章（DeepSeek）
# =========================

def agent_en_article(title, module):
    return f"""You are a master of traditional face reading (physiognomy) and human facial analysis, blending classical Eastern theories with modern psychology and behavioral insights.

Your expertise includes:
- Face reading principles (physiognomy)
- Interpretation of facial features and structure
- Symbolic meaning of facial zones (forehead, eyes, nose, mouth, chin)
- Balance and harmony of facial proportions
- Personality and behavioral tendencies from facial analysis

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

Explain the face reading concept in simple terms:

- What this facial feature or structure represents
- How it reflects personality, tendencies, or life patterns
- Real-life examples of different facial appearances

## Traditional Face Reading Perspective

Explain from classical physiognomy principles:

- Meaning of specific facial areas (forehead, eyes, nose, mouth, chin)
- Balance and proportion in facial structure
- Symbolism of shapes, lines, and expressions
- Interpretation of facial harmony and imbalance

## Modern Interpretation

Explain how modern people understand it:

- Psychological impressions of facial features
- How facial appearance influences perception and behavior
- Social and emotional interpretation of expressions
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
# Agent EN SEO：SEO 元数据生成
# ============================================================
def agent_en_seo(title, module):
    return f"""You are a Senior SEO Specialist. Generate full metadata for the article "{title}".

--------------------------------------------------
STRICT CONTENT RULES:
1. NO EMPTY FIELDS: All arrays MUST contain at least 3-5 high-quality items.
2. RELEVANCE: Keywords must be derived directly from "{title}".
3. DO NOT use generic "face reading guide" text. Focus strictly on the specific facial feature or trait.
4. metaDescription: Must be a compelling click-bait style summary (100-120 chars).

--------------------------------------------------
JSON STRUCTURE:
{{
  "metaTitle": "SEO title with primary keyword (max 60 chars)",
  "metaDescription": "Compelling summary for {title}",
  "primaryKeyword": "face reading meaning of {title}",
  "secondaryKeywords": [
    "facial feature meaning analysis",
    "physiognomy face interpretation",
    "face reading personality traits",
    "facial structure symbolism"
  ],
  "longTailKeywords": [
    "What does {title} mean in face reading?",
    "How do facial features reflect personality?",
    "face reading meaning of facial structure and traits",
    "how to interpret this facial feature"
  ],
  "semanticKeywords": [
    "face reading",
    "physiognomy",
    "facial analysis",
    "facial proportions",
    "personality traits"
  ],
  "keywords": [
    "Face Reading",
    "Physiognomy",
    "Facial Analysis",
    "{title}"
  ],
  "summary": "2-3 sentences explaining how this facial feature reflects personality, tendencies, and behavioral patterns.",
  "featuredSnippetAnswer": "A clear 40-50 word answer explaining the face reading meaning and how this facial feature relates to personality and perception.",
  "ctaText": "Discover your face with ZanPath AI",
  "faq": [
    {{ "question": "What does {title} mean in face reading?", "answer": "Detailed explanation of the facial feature and its personality meaning." }},
    {{ "question": "Does this facial feature reflect personality traits?", "answer": "Explain how appearance influences perception, behavior, and tendencies." }},
    {{ "question": "How can I better understand this facial feature?", "answer": "Provide simple and practical interpretation insights." }}
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

--------------------------------------------------
CORE GOAL:
Avoid ugly or random human faces.
Focus on aesthetic, abstract, or partial facial visuals.

--------------------------------------------------
RULES:

- OUTPUT ONLY keywords (one per line)
- NO numbering
- NO explanations
- English only

--------------------------------------------------
STRICT VISUAL STRATEGY:

1. DO NOT generate:
- full human face close-up
- portrait photography
- selfie, group, crowd
- random people

2. PRIORITIZE these 3 styles:

(A) Partial Face Details:
- eyes close-up
- lips detail
- nose side profile
- facial skin texture

(B) Abstract / Artistic Face:
- face silhouette shadow
- abstract human face light
- blurred face light effect
- shadow face minimal

(C) Minimal / AI Style:
- line art face
- minimal face drawing
- geometric face design
- artistic face outline

--------------------------------------------------
STYLE REQUIREMENTS:

- clean
- minimal
- aesthetic
- soft lighting
- neutral tones
- no chaos, no clutter

--------------------------------------------------
GOOD EXAMPLES (STYLE REFERENCE):

eye close up soft lighting
lips detail natural light
side profile nose shadow
face silhouette soft light
abstract human face shadow
minimal line art face
geometric face design
artistic face outline
blurred face light effect
skin texture macro detail
soft shadow face contour
minimal portrait silhouette

--------------------------------------------------
IMPORTANT:

Keywords MUST be visually searchable on:
- Unsplash
- Pexels
- Pixabay

--------------------------------------------------
OUTPUT:
Only the keywords. One per line.
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
- "Face Reading" → "lectura facial"
- "Physiognomy" → "fisionomía"
- "facial feature" → "rasgo facial"
- "face" → "rostro"
- "facial structure" → "estructura facial"
- "personality traits" → "rasgos de personalidad"

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
- Face Reading → lectura facial
- Physiognomy → fisionomía
- Facial Analysis → análisis facial

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