// 项目根目录/next-intl.config.ts
import type { IntlConfig } from "next-intl";

const config = {
  // 路由相关配置（4.8.3 核心，必须嵌套在 routing 下）
  routing: {
    locales: ["en", "zh"], // 支持的语言列表（必填）
    defaultLocale: "zh", // 默认语言（必填，需在 locales 中）
    prefix: "as-needed", // URL 前缀规则：as-needed/always/never
    detectLocale: false, // 关闭自动检测浏览器语言（避免冲突）
  },
  // 消息文件配置（可选，默认读取 ./messages 目录）
  messages: {
    defaultLocale: "zh",
    fallback: "en", // 消息缺失时回退到英文
  },
};

export default config;
