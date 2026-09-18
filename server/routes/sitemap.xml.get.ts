/**
 * GET /sitemap.xml
 *
 * Two public URLs, one per language, each pointing at the other with hreflang so
 * search engines index the right one per visitor. Generated rather than static so
 * the host name always follows NUXT_PUBLIC_SITE_URL.
 */
const PUBLIC_PATHS = ['/', '/en'] as const

export default defineEventHandler((event): string => {
  const { public: publicConfig } = useRuntimeConfig(event)
  const siteUrl = String(publicConfig.siteUrl).replace(/\/$/, '')
  const lastModified = new Date().toISOString().slice(0, 10)

  const urls = PUBLIC_PATHS.map((path) => {
    const alternates = PUBLIC_PATHS.map(
      other => `    <xhtml:link rel="alternate" hreflang="${other === '/en' ? 'en' : 'et'}" href="${siteUrl}${other}"/>`,
    ).join('\n')

    return `  <url>
    <loc>${siteUrl}${path}</loc>
${alternates}
    <lastmod>${lastModified}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`
  }).join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`
})
