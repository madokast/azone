import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: {
        enabled: true
      },
      minify: true,
      workbox: {
        mode: "development",
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ["**\/*.{js,wasm,css,html,svg,webmanifest}"], // 要预缓存的文件匹配模式
        globIgnores: ["**\/node_modules\/**\/*"], // 忽略的文件
        runtimeCaching: [
          // Dev source files: prefer network, fallback to cache
          {
            urlPattern: ({ url, request }) =>
              request.method === "GET" && url.pathname.startsWith("/src/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "dev-src-network-first",
              networkTimeoutSeconds: 3,
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24
              }
            }
          }
        ]
      },
      manifest: {
        name: "React Hello World",
        short_name: "HelloPWA",
        description: "A simple React + TypeScript PWA",
        theme_color: "#111111",
        background_color: "#f7f7fb",
        display: "standalone",
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
