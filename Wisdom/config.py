import os

MODELS = {
    # 1️⃣ 英文文章生成 (Agent EN) - 切换回 DeepSeek
    "agent_en_article": [
        ("deepseek", "deepseek-chat"), # 使用 DeepSeek 官方模型名
        ("gemini", "gemini-2.5-flash"),   # 备选方案，万一 DeepSeek 挂了会用 Groq
    ],

    # 2️⃣ 英文 SEO 生成 (Agent EN SEO) - 保持使用 Groq
    "agent_en_seo": [
       ("groq", "llama-3.1-8b-instant"),
    ],

    # 3️⃣ 图片关键词 (Agent 3) 
    "agent3": [
        ("groq", "llama-3.1-8b-instant"),
    ],

    # 4️⃣ 英文 -> 西语文章 (Agent 6)
    "agent6": [
        ("gemini", "gemini-2.5-flash"), 
        ("deepseek", "deepseek-chat"), 
    ],

    # 5️⃣ SEO -> 西语 (Agent 7)
    "agent7": [
        ("gemini", "gemini-2.5-flash"), 
        ("groq", "llama-3.1-8b-instant"),
    ],

    # 6️⃣ 最终评分 (Scorer Final)
    "scorer_final": [
        ("groq", "llama-3.3-70b-versatile"),
        ("groq", "llama-3.1-8b-instant"),
    ],

    # 其他兼容项
    "agent1": [("zai", "glm-4.7-flash")],
    "agent2": [("longcat", "LongCat-Flash-Lite")],
}

API_CONFIG = {
    # 新增 DeepSeek 配置
    "deepseek": {
        "base_url": "https://api.deepseek.com/v1", 
        "key": os.getenv("DEEPSEEK_API_KEY") 
    },
    "gemini": {
        "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/", 
        "key": "AIzaSyDZmh5YU0dI-vx4canfzA2m2eBCexrqJ3o" # 建议用 os.getenv("GEMINI_API_KEY")
    },
    "longcat": {
        "base_url": "https://api.longcat.chat/openai", # 注意！后面不要带 /v1
        "key": os.getenv("LONGCAT_API_KEY")
    },
    "zai": {
        "base_url": "https://open.bigmodel.cn/api/paas/v4", 
        "key": os.getenv("ZAI_API_KEY") 
    },
    "qwen": {
        "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1", 
        "key": os.getenv("QWEN_API_KEY") 
    },
    "groq": {
        "base_url": "https://api.groq.com/openai/v1", 
        "key": os.getenv("GROQ_API_KEY") 
    },
    "hunyuan": {
        "base_url": "https://api.hunyuan.cloud.tencent.com/v1", 
        "key": os.getenv("HUNYUAN_API_KEY") 
    },
}

SLEEP_BETWEEN_CALLS = (5, 12) 
LOOP_INTERVAL = 1800
MAX_REWRITE = 3