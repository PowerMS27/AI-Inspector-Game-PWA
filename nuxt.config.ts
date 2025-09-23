export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      huggingfaceApiKey1: process.env.NUXT_HUGGINGFACE_API_KEY_1,
      huggingfaceApiKey2: process.env.NUXT_HUGGINGFACE_API_KEY_2,
    },
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@vite-pwa/nuxt",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
  ],
  fonts: {
    families: [
      {
        name: "PixelPurl",
        src: "/fonts/PixelPurl.ttf",
      },
    ],
  },
  tailwindcss: {
    exposeConfig: true,
    viewer: true,
  },
  app: {
    head: {
      link: [
        {
          rel: "manifest",
          href: "/manifest.webmanifest",
        },
      ],
    },
  },
  pwa: {
    strategies: "generateSW",
    registerType: "autoUpdate",
    manifest: {
      name: "Robot Inspector",
      short_name: "RoboCheck",
      description: "AI-powered robot interview simulator",
      theme_color: "#0ea5e9",
      background_color: "#ffffff",
      display: "standalone", // important for PWA
      start_url: "/",
      icons: [
        {
          src: "/icons/robot-icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icons/robot-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      id: "/",
      scope: "/",
    },
    injectRegister: "auto",
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      // runtimeCaching for dynamic routes
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === "document",
          handler: "NetworkFirst", // use cache only when offline
          options: {
            cacheName: "pages-cache",
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
          },
        },
      ],
      navigateFallback: "/",
      navigateFallbackDenylist: [/\/api\//],
    },
    devOptions: {
      enabled: false,
    },
  },
});
