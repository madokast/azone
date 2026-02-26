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
      includeAssets: ["pwa.svg"],
      minify: true,
      workbox: {
        mode: "development",
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          // S3 ListObjectsV2: never cache
          {
            urlPattern: ({ url, request }) =>
              request.method === "GET" &&
              url.searchParams.get("list-type") === "2",
            handler: "NetworkOnly"
          },
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
          },
          // Cache "resource-like" URLs: last path segment contains \w.\w
          {
            urlPattern: ({ url, request }) => {
              if (request.method !== "GET") return false;
              if (url.searchParams.get("list-type") === "2") return false;
              if (url.pathname.startsWith("/src/")) return false;
              const lastSegment = url.pathname.split("/").pop() || "";
              return /\w\.\w/.test(lastSegment);
            },
            handler: "CacheFirst",
            options: {
              cacheName: "storage-objects",
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: { statuses: [0, 200] }
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
