export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/i18n'],
  // Fonts are self-hosted from npm, the same family as deplai.eu: no third-party request.
  css: ['@fontsource-variable/geist', '@fontsource-variable/geist-mono', '~/assets/css/main.css'],

  // Server-side rendering so the page is readable by search engines and AI crawlers.
  ssr: true,

  // Runtime config values are overridden in production by NUXT_-prefixed environment
  // variables (NUXT_DATABASE_PATH, NUXT_ADMIN_KEY, ...). The values below are only
  // defaults used during development.
  runtimeConfig: {
    databasePath: './data/booking.db',
    // Only development gets a default key; a production build without NUXT_ADMIN_KEY
    // keeps /admin closed rather than open to "change-me".
    adminKey: process.env.NODE_ENV === 'production' ? '' : 'change-me',
    resetEnabled: true,
    public: {
      siteUrl: 'https://demo.deplai.app',
      // Deplai's own site and inbox, linked from the header, footer, copy and llms.txt.
      mainSiteUrl: 'https://deplai.eu',
      contactEmail: 'hello@deplai.eu',
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

  // Same response headers as deplai.eu. HSTS comes from Traefik/Coolify.
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
      },
    },
  },

  nitro: {
    // Nightly cleanup of demo data (UTC).
    experimental: { tasks: true },
    scheduledTasks: { '0 3 * * *': ['demo:reset'] },
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#F6F7F9', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#0D131E', media: '(prefers-color-scheme: dark)' },
      ],
    },
  },
})
