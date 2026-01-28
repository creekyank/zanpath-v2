// config/languages.ts

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "zh", name: "Chinese (简体中文)" },
  { code: "ja", name: "Japanese (日本語)" },
  { code: "ko", name: "Korean (한국어)" },
  { code: "fr", name: "French (Français)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "es", name: "Spanish (Español)" },
  { code: "it", name: "Italian (Italiano)" },
  { code: "id", name: "Indonesian (Bahasa Indonesia)" }, // 补齐了印尼语
];

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]["code"];