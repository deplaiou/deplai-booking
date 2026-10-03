/**
 * GET /robots.txt — from server/assets/robots.txt, with the sitemap on this site's host.
 */
export default defineEventHandler(event => serveTextTemplate(event, 'robots.txt'))
