# =========================
# Agent EN：英文文章（DeepSeek）
# =========================

def agent_en_article(title, module):
    return f"""You are an expert in Dream Interpretation and Chinese metaphysical symbolism.

Your expertise includes:
- Dream Interpretation
- Symbolism in Dreams
- Subconscious Mind Analysis
- Cultural Dream Meanings
- Psychological Dream Analysis

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

Explain the dream symbol or scenario with simple examples.

## Traditional Meaning

Explain from traditional and cultural perspectives:

- Yin-Yang balance in dreams
- Symbolism and Five Elements associations
- Cultural interpretations of dreams

## Modern Interpretation

Explain how modern people understand it:

- Psychological perspective
- Subconscious mind explanations
- Common interpretations in daily life

## Insights

Write 3–5 bullet points.

Each bullet MUST:
- Be a complete sentence
- Be at least 12 words
- Provide a concrete insight

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
3. DO NOT use generic "dream guide" text. Focus strictly on the specific dream topic.
4. metaDescription: Must be a compelling click-bait style summary (100-120 chars).

--------------------------------------------------
JSON STRUCTURE:
{{
  "metaTitle": "SEO title with primary keyword (max 60 chars)",
  "metaDescription": "Compelling summary for {title}",
  "primaryKeyword": "The main focus keyword",
  "secondaryKeywords": ["dream meaning keyword 1", "dream symbol keyword 2", "dream interpretation keyword 3"],
  "longTailKeywords": ["What does {title} mean in dreams?", "Why do I dream about this?", "Specific dream scenario meaning"],
  "semanticKeywords": ["dream symbolism", "subconscious mind", "psychological meaning"],
  "keywords": ["Dream Interpretation", "Dream Meaning", "{title}"],
  "summary": "2-3 sentences summarizing the core value of the article",
  "featuredSnippetAnswer": "A direct 40-50 word answer explaining the dream meaning clearly",
  "ctaText": "Explore your dreams with ZanPath AI",
  "faq": [
    {{ "question": "What does {title} mean in dreams?", "answer": "Detailed answer." }},
    {{ "question": "Is this dream common?", "answer": "Detailed answer." }},
    {{ "question": "Why do people experience {title}?", "answer": "Detailed answer." }}
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
- NO introductory text, NO conversational fillers (e.g., "Here are...").
- NO numbering (NO 1. 2. 3.).
- MUST be visually describable (real-world scenes or objects).
- Avoid abstract words like energy, metaphysics, destiny.
- Use nature, objects, or environments.
- English only.
- One keyword per line.

STYLE HINTS:
- surreal dream scene, night sky, fog, shadows, symbolic objects.

Example:
foggy forest path night
surreal floating objects dream
dark bedroom moonlight window
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
- "Dream Interpretation" → "interpretación de los sueños"
- "subconscious mind" → "subconsciente"
- "symbolism" → "simbolismo"
- Use "Claves para tu sueño" instead of "Percepciones" for the section title.

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