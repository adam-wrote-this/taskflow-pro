// next.config.ts - TypeScript 版本
import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next"; // 引入 Next.js 配置类型

// 初始化 next-intl 插件（和 mjs 逻辑一致）
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * Next.js 配置对象（添加 TS 类型注解）
 * 保留你原有所有配置：ignoreBuildErrors、unoptimized 等
 */
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 解决跨域警告：添加 allowedDevOrigins
  allowedDevOrigins: ["http://172.27.32.1"],
};

// 导出包装后的配置（TS 用 export default 语法）
export default withNextIntl(nextConfig);
