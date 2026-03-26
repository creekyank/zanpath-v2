# =========================
# Agent EN：英文文章（DeepSeek）
# =========================
def agent_en_article(title, module):
    return f"""You are an expert in dream interpretation combining:

- Traditional Chinese dream symbolism (Zhougong Dream Dictionary)
- Cultural symbolism
- Modern psychology (subconscious, emotions, stress)

Write a high-quality educational article.

Title: {title}
Module: dream

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
10 Do NOT repeat the title explanation mechanically
11 Avoid generic or vague interpretations

--------------------------------------------------

ARTICLE STRUCTURE:

# {title}

Write a natural introduction explaining why people have this dream and why it matters.

## What Does This Dream Mean?

Explain the most common interpretation clearly and directly.

## Symbolism in Traditional Chinese Culture

Explain meanings using:
- Zhougong dream interpretation tradition
- Cultural symbolism (fortune, warning, transformation)
- Yin-Yang balance if relevant

## Psychological Interpretation

Explain modern meaning:
- Emotions (fear, anxiety, desire)
- Subconscious signals
- Life situations (stress, relationships, change)

## Common Variations of This Dream

List 3–5 variations and explain differences.

Example format:
- Dreaming of X → meaning
- Dreaming of Y → meaning

## Insights

Write 3–5 bullet points.

Each MUST:
- Be a full sentence
- At least 12 words
- Give practical understanding (NOT prediction)

## Conclusion

Summarize the meaning and how to reflect on it in real life.

--------------------------------------------------

CONTENT GUIDELINES:

- 800–1300 words
- Clear and human tone
- Avoid fortune-telling or guarantees
- Focus on interpretation, not prediction
- Make it relatable (real-life feelings)

--------------------------------------------------

OUTPUT RULE:

Return ONLY Markdown content.
"""

#============================================================
# Agent EN SEO：SEO 元数据生成（Llama3 强力约束版）
# ============================================================
def agent_en_seo(title, module):
    return f"""You are a Senior SEO Specialist focusing on Dream Interpretation content.

Generate full metadata for:
"{title}"

--------------------------------------------------
STRICT CONTENT RULES:

1. NO EMPTY FIELDS
2. Keywords MUST match real user search intent (dream meaning queries)
3. Focus on "what does this dream mean" style queries
4. metaDescription MUST be highly clickable (140–160 chars)

--------------------------------------------------
KEYWORD STRATEGY:

- Use patterns like:
  - "dream meaning"
  - "what does it mean when you dream about X"
  - "dream interpretation X"
  - "is dreaming about X good or bad"

--------------------------------------------------
JSON STRUCTURE:

{{
  "metaTitle": "Dream meaning of {title} (SEO optimized)",
  "metaDescription": "What does it mean to dream about {title}? Discover the secret Zhougong symbolism and psychological analysis of {title} in our deep dive guide.",
  "primaryKeyword": "dream about {title} meaning",
  "secondaryKeywords": [
    "what does it mean to dream about {title} ",
    "{title} dream interpretation",
    "is dreaming about {title}  good or bad"
  ],
  "longTailKeywords": [
    "why do I dream about {title} ",
    "spiritual meaning of {title}  in dreams",
    "psychological meaning of dreaming about {title} "
  ],
  "semanticKeywords": [
    "dream symbolism",
    "subconscious mind",
    "dream analysis"
  ],
  "keywords": ["dream meaning", "dream interpretation", "{title}"],
  "summary": "This article explains the meaning of {title}  dreams using both traditional symbolism and modern psychology.",
  "featuredSnippetAnswer": "Dreaming about {title}  usually reflects emotional states, subconscious thoughts, or symbolic transformations depending on context.",
  "ctaText": "Analyze your dream with ZanPath AI",
  "faq": [
    {{
      "question": "What does it mean to dream about {title} ?",
      "answer": "It often reflects subconscious emotions, symbolic meanings, or life situations related to the dream context."
    }},
    {{
      "question": "Is dreaming about {title}  good or bad?",
      "answer": "It depends on the details of the dream, as symbols can have both positive and negative meanings."
    }},
    {{
      "question": "Why do I keep dreaming about {title} ?",
      "answer": "Recurring dreams usually indicate unresolved emotions or repeated patterns in your waking life."
    }}
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
     return f"""Generate 10 visual image keywords for dream-related content.

Article title: {title}

RULES:
- MUST be visually concrete
- Include mood / atmosphere
- NO abstract words (like destiny)
- English only
- One per line

STYLE:
- night, surreal, symbolic, emotional

Example:
foggy forest night
person sleeping moonlight
surreal floating objects
dark ocean dreamscape
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
-"Dream Interpretation" → "Interpretación de los sueños"
-"Subconscious" → "Subconsciente"
-"Symbolism" → "Simbolismo"
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