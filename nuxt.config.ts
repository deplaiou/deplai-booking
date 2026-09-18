export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/i18n'],
  css: ['~/assets/css/main.css'],

  // Server-side rendering so the page is readable by search engines and AI crawlers.
  ssr: true,

  // Runtime config values are overridden in production by NUXT_-prefixed environment
  // variables (NUXT_DATABASE_PATH, NUXT_ADMIN_KEY, ...). The values below are only
  // defaults used during development.
  runtimeConfig: {
    databasePath: './data/booking.db',
    adminKey: 'change-me',
    resetEnabled: true,
    public: {
      siteUrl: 'https://demo.deplai.app',
      // Shown in the demo banner; set NUXT_PUBLIC_DEMO_MODE=false for real use.
      demoMode: true,
    },
  },

  i18n: {
    defaultLocale: 'et',
    strategy: 'prefix_except_default', // "/" = Estonian, "/en" = English
    locales: [
      { code: 'et', language: 'et-EE', name: 'Eesti', file: 'et.json' },
      { code: 'en', language: 'en-GB', name: 'English', file: 'en.json' },
    ],
    detectBrowserLanguage: false,
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://demo.deplai.app', // used for hreflang links
  },

  nitro: {
    // Nightly cleanup of demo data (UTC).
    experimental: { tasks: true },
    scheduledTasks: { '0 3 * * *': ['demo:reset'] },
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&display=swap' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#1C2B45' },
      ],
    },
  },
})
