export function getCategory(article: any, module: string) {
  // 合并所有可能包含关键词的文本字段
  const text = (
    (article.title || "") + " " +
    (article.primaryKeyword || "") + " " +
    (article.keywords || []).join(" ") + " " +
    (article.description || "")
  ).toLowerCase();

  const rules: Record<string, Record<string, string[]>> = {
    "life-path": {
      wealth: ["wealth", "money", "finance", "riqueza", "dinero", "finanzas", "prosperidad"],
      love: ["love", "relationship", "marriage", "amor", "relación", "matrimonio", "pareja"],
      career: ["career", "job", "work", "business", "carrera", "trabajo", "negocio", "empleo"],
      health: ["health", "body", "energy", "salud", "cuerpo", "energía", "bienestar"],
    },
    dream: {
      love: ["love", "relationship", "amor", "relación", "pareja"],
      warning: ["warning", "fear", "danger", "advertencia", "miedo", "peligro", "pesadilla"],
      spiritual: ["spiritual", "soul", "espiritual", "alma", "intuición", "intuition"],
    },
    naming: {
      luck: ["luck", "fortune", "suerte", "fortuna"],
      personality: ["personality", "character", "personalidad", "carácter"],
    },
    space: {
      wealth: ["wealth", "money", "riqueza", "dinero", "feng shui"],
      home: ["home", "house", "hogar", "casa", "habitación"],
    },
    visual: {
      personality: ["personality", "personalidad", "cara", "face"],
      career: ["career", "carrera", "éxito", "success"],
    }
  };

  const moduleRules = rules[module] || {};

  // 遍历规则进行匹配
  for (const [category, keywords] of Object.entries(moduleRules)) {
    if (keywords.some(k => text.includes(k))) {
      return category;
    }
  }

  return "all"; 
}