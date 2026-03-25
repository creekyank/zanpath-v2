
export function getCategory(article: any, module: string) {

  const text = (
    article.title + " " +
    article.primaryKeyword + " " +
    (article.keywords || []).join(" ")
  ).toLowerCase();

  const rules: Record<string, Record<string, string[]>> = {

    "life-path": {
      wealth: ["wealth", "money", "finance"],
      love: ["love", "relationship", "marriage"],
      career: ["career", "job", "work", "business"],
      health: ["health", "body", "energy"],
    },

    dream: {
      love: ["love", "relationship"],
      warning: ["warning", "fear", "danger"],
      spiritual: ["spiritual", "soul"],
    },

    naming: {
      luck: ["luck", "fortune"],
      personality: ["personality", "character"],
    },

    space: {
      wealth: ["wealth", "money"],
      home: ["home", "house"],
    },

    visual: {
      personality: ["personality"],
      career: ["career"],
    }

  };

  const moduleRules = rules[module] || {};

  for (const [category, keywords] of Object.entries(moduleRules)) {
    if (keywords.some(k => text.includes(k))) {
      return category;
    }
  }

  return "general";
}
