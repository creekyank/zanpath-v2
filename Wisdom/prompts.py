# =========================
# Agent EN：英文文章（DeepSeek）
# =========================
def agent_en_article(title, module):
    return f"""You are an expert in Chinese metaphysics.

Your expertise includes:
- Bazi (Four Pillars)
- Feng Shui
- Face Reading
- Chinese Naming
- Dream Interpretation

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

--------------------------------------------------

ARTICLE STRUCTURE:

# {title}

Write a clear introduction explaining the topic.

## Core Concept

Explain the concept with simple examples.

## Traditional Meaning

Explain from Chinese metaphysics perspective:

- Yin-Yang
- Five Elements
- Cultural background

## Modern Interpretation

Explain how modern people understand it:

- Psychological perspective
- Cultural symbolism
- Common interpretations

## Insights

- Insight
- Insight
- Insight

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
3. DO NOT use generic "Bazi guide" text. Focus strictly on the specific topic.
4. metaDescription: Must be a compelling click-bait style summary (140-160 chars).

--------------------------------------------------
JSON STRUCTURE:
{{
  "metaTitle": "SEO title with primary keyword (max 60 chars)",
  "metaDescription": "Compelling summary for {title}",
  "primaryKeyword": "The main focus keyword",
  "secondaryKeywords": ["Extracted keyword 1", "Extracted keyword 2", "Extracted keyword 3"],
  "longTailKeywords": ["Question about {title}?", "Specific phrase 2", "Specific phrase 3"],
  "semanticKeywords": ["Related concept 1", "Related concept 2", "Related concept 3"],
  "keywords": ["Bazi", "Metaphysics", "{title}"],
  "summary": "2-3 sentences summarizing the core value of the article",
  "featuredSnippetAnswer": "A direct 40-50 word answer to the question in the title",
  "ctaText": "Discover your destiny with ZanPath AI",
  "faq": [
    {{ "question": "Question specific to {title}?", "answer": "Detailed answer." }},
    {{ "question": "Another specific question?", "answer": "Detailed answer." }},
    {{ "question": "Why does {title} matter?", "answer": "Detailed answer." }}
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
    return f"""Generate 3 high-quality image search keywords for stock photo sites (Pexels/Unsplash).

Article title: {title}

RULES:
- Focus on concepts: Chinese culture, Zen, Nature, Elements, Meditation, Abstract textures.
- English only.
- One keyword/phrase per line.
- NO numbers, NO punctuation, NO explanation.

Example for 'Fire Element':
Chinese Zen fire aesthetic
Red abstract energy flow
Burning incense close up
"""

# =========================
# Agent6 英文 -> 西班牙语（增强术语准确性）
# =========================

def agent6(title, article):
    return f"""Translate the following English article and its TITLE into Spanish.

Context: Chinese Metaphysics.

STRICT RULES:
1. PROFESSIONAL Spanish (formal tone)
2. KEEP structure (#, ##, -)
3. TRANSLATE title correctly

CRITICAL TERMINOLOGY RULES:
- "Chinese Metaphysics" → "metafísica china"
- "Day Master" → "Maestro del Día"
- "chart" → "carta"
- NEVER use "metabolítica"

OUTPUT FORMAT:

[TITLE]
Spanish title

[CONTENT]
Spanish content

TITLE: {title}

ARTICLE:
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
4. Output valid JSON ONLY. No explanation.

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