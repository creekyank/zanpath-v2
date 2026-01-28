import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18n/navigation';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  // 确保 locale 合法
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});