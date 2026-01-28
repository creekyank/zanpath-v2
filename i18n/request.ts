// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './navigation';

export default getRequestConfig(async ({ requestLocale }) => {
  // 獲取當前請求的語言
  let locale = await requestLocale;

  // 🟢 安全檢查：如果 locale 不在 ['en', 'es'] 中，強制設為預設值 'en'
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // 🟢 系統會根據 locale 去加載 messages/en.json 或 messages/es.json
    messages: (await import(`../messages/${locale}.json`)).default
  };
});