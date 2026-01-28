// next.config.ts
import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// 🟢 告诉插件你的配置文件在哪里
const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig: NextConfig = {
  /* 这里保留你原本的配置，比如 images, rewrites 等 */
};

export default withNextIntl(nextConfig);