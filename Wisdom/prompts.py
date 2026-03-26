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

 CRITICAL ANTI-DUPLICATION RULES (VERY IMPORTANT):

1. The title "# {title}" must appear ONLY ONCE at the very top.
2. NEVER repeat the title again anywhere in the article.
3. DO NOT restate or paraphrase the full title in the introduction.
4. DO NOT start with phrases like:
   - "What does it mean to dream about..."
   - "This dream means..."
   - "Dreaming about X is..."
5. The introduction must feel natural, NOT like explaining the title.
6. DO NOT duplicate paragraphs or rephrase the same opening twice.
7. DO NOT reuse the same sentence structure across sections.

--------------------------------------------------

STRICT OUTPUT RULES:

1. Output MUST be pure Markdown
2. NO HTML
3. NO JSON
4. NO code blocks
5. NO links
6. NO images
7. NO metadata
8. NO FAQ
9. NO disclaimers
10. Avoid repetition completely
11. Avoid generic explanations
12. Each section must provide NEW information

--------------------------------------------------

ARTICLE STRUCTURE:

# {title}

Write a NATURAL introduction.

 Start with a feeling, scenario, or psychological observation  
 DO NOT define the dream immediately  
 DO NOT restate the title  
 Make it immersive and human  

Example style (DO NOT copy):
"A sudden moment of panic in a dream can feel incredibly real..."

--------------------------------------------------

## What Does This Dream Mean?

 Give a direct but concise interpretation  
 Avoid repeating the introduction  
 Focus on symbolic meaning  

--------------------------------------------------

## Symbolism in Traditional Chinese Culture

Explain using:

- Zhougong dream interpretation tradition
- Cultural symbolism (fortune, warning, transformation)
- Yin-Yang balance if relevant

 Avoid superstition tone  
 Keep it cultural and symbolic  

--------------------------------------------------

## Psychological Interpretation

Explain from modern perspective:

- Emotions (fear, anxiety, insecurity, desire)
- Subconscious signals
- Real-life triggers (stress, relationships, change)

 Make it relatable  
 Avoid repeating earlier explanations  

--------------------------------------------------

## Common Variations of This Dream

List 3–5 variations.

Format:
- Dreaming of X → Meaning
- Dreaming of Y → Meaning

 Each variation MUST be unique  
 Avoid repeating same explanation  

--------------------------------------------------

## Insights

Write 3–5 bullet points.

Each MUST:
- Be a full sentence
- At least 12 words
- Provide practical psychological or symbolic insight
- NOT be repetitive

--------------------------------------------------

## Conclusion

 Summarize naturally  
 Focus on reflection and awareness  
 DO NOT repeat earlier sentences  

--------------------------------------------------

CONTENT GUIDELINES:

- 800–1300 words
- Clear, human tone
- Short paragraphs
- Avoid fortune-telling or guarantees
- Focus on interpretation, NOT prediction
- Avoid redundancy across sections

--------------------------------------------------

FINAL CHECK BEFORE OUTPUT:

- Title appears ONLY once 
- No repeated intro sentences 
- No "What does it mean to dream..." opening 
- No duplicated paragraphs 

--------------------------------------------------

OUTPUT RULE:

Return ONLY Markdown content.
"""

#============================================================
# Agent EN SEO：SEO 元数据生成（Llama3 强力约束版）
# ============================================================
def agent_en_seo(title, module):
    clean_subject = title.lower()\
        .replace("what does it mean to dream about", "")\
        .replace("dreaming about", "")\
        .replace("why do i dream about", "")\
        .strip("? ")

    return f"""You are a Senior SEO Specialist focusing on Dream Interpretation content.

Article Title: "{title}"
Core Subject: "{clean_subject}"

--------------------------------------------------
STRICT CONTENT RULES:

1. NO EMPTY FIELDS
2. Keywords MUST match real user search intent
3. metaDescription MUST be 120–140 chars
4. IMPORTANT: Do NOT include SEO phrases like "SEO optimized" anywhere

--------------------------------------------------

{{
  "metaTitle": "Dream Meaning of {clean_subject.capitalize()} (Complete Interpretation Guide)",
  "metaDescription": "Discover the meaning of {clean_subject} dreams. Explore symbolism, psychology, and hidden messages behind your dreams.",
  "primaryKeyword": "dream about {clean_subject} meaning",
  "secondaryKeywords": [
    "what does it mean to dream about {clean_subject}",
    "{clean_subject} dream interpretation",
    "dream meaning {clean_subject}"
  ],
  "longTailKeywords": [
    "why do I dream about {clean_subject}",
    "spiritual meaning of {clean_subject} in dreams",
    "psychological meaning of dreaming about {clean_subject}"
  ],
  "semanticKeywords": [
    "dream symbolism",
    "subconscious mind",
    "dream analysis"
  ],
  "keywords": ["dream meaning", "dream interpretation", "{clean_subject}"],
  "summary": "This article explains {clean_subject} dream meanings using symbolism and psychology.",
  "featuredSnippetAnswer": "Dreaming about {clean_subject} reflects subconscious emotions and symbolic meanings connected to real-life situations.",
  "ctaText": "Analyze your dream with ZanPath AI",
  "faq": [
    {{
      "question": "What does it mean to dream about {clean_subject}?",
      "answer": "It reflects subconscious emotions, symbolic meanings, or life situations."
    }},
    {{
      "question": "Is dreaming about {clean_subject} good or bad?",
      "answer": "It depends on context and emotional tone."
    }},
    {{
      "question": "Why do I keep dreaming about {clean_subject}?",
      "answer": "Recurring dreams often indicate unresolved emotions or stress."
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
1. Translate TITLE separately
2. DO NOT include the title inside CONTENT
3. DO NOT repeat the introduction paragraph
4. DO NOT duplicate any paragraph
5. CONTENT must start directly from the introduction
6. NEVER include phrases like:
   - "Interpretación optimizada para SEO"
   - "SEO"
7. Keep structure (#, ##, -)

CRITICAL TERMINOLOGY RULES:
- "Chinese Metaphysics" → "metafísica china"
-"Dream Interpretation" → "Interpretación de los sueños"
-"Subconscious" → "Subconsciente"
-"Symbolism" → "Simbolismo"
- NEVER use "metabolítica"

--------------------------------------------------
OUTPUT FORMAT:

[TITLE]
(Only the translated Spanish title here)

[CONTENT]
(Start directly with the translated body text/introduction. NO title, NO repetition or # header here.)
--------------------------------------------------
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
5. Pay attention to Spanish gender agreement, e.g., 'análisis' is masculine (use 'nuestro análisis', not 'nuestra').
6. CRITICAL LENGTH RULE: 
   - The Spanish 'metaDescription' MUST be between 140 and 155 characters.
   - If the translation exceeds 155, do NOT just cut it; instead, REWRITE it to be shorter while keeping the meaning intact.
   - NEVER leave trailing dots or incomplete words at the end.
7. Ensure consistency: If you correct a gender agreement in 'metaDescription', apply the exact same correction to 'structuredData' fields.

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