import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate", // Service Worker 检测到新版本后自动更新，无需用户手动刷新
            injectRegister: "auto", // 自动向 index.html 注入 Service Worker 注册代码
            devOptions: { // 开发环境下也启用 PWA 功能（默认只在生产环境启用）
                enabled: true
            },
            minify: true, // 开启代码压缩
            workbox: { // Workbox 配置（Service Worker 行为）
                mode: "development", // Workbox 运行在开发模式，输出更详细的日志
                navigateFallback: "index.html", // 导航请求（HTML 页面）未命中缓存时回退到 index.html，对 SPA 路由至关重要
                cleanupOutdatedCaches: true, // 自动清理过期的缓存
                clientsClaim: true, // SW 激活后立即控制所有页面
                skipWaiting: true, // 新 SW 安装后跳过等待，立即激活
                // 要预缓存的文件匹配模式
                // 在构建时（Build Time）打包进 Service Worker 代码里，安装即缓存
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                globIgnores: ["**\/node_modules\/**\/*"], // 忽略的文件
                runtimeCaching: []
            },
            manifest: { // 应用清单
                name: "Azone",
                short_name: "Azone",
                description: "Photo/File Management System",
                theme_color: "#111111",
                background_color: "#f7f7fb",
                display: "standalone", // 应用在独立窗口中运行，不显示浏览器 UI
                start_url: "/",
                icons: [
                    {
                        src: "/pwa.svg",
                        sizes: "any",
                        type: "image/svg+xml"
                    },
                    {
                        src: "/pwa.svg",
                        sizes: "any",
                        type: "image/svg+xml",
                        purpose: "any maskable"
                    }
                ]
            }
        })
    ]
});
