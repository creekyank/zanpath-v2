// i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

// 1. 定义路由规则
export const routing = defineRouting({
  // 🟢 移除了 'zh'，增加了 'es'
  locales: ['en', 'es'],
  // 預設語言保持為英語
  defaultLocale: 'en',
  // 如果訪問不存在的語言，是否自動跳轉到預設語言
  localePrefix: 'as-needed' 
});

// 2. 使用新版本的 createNavigation 导出组件
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);