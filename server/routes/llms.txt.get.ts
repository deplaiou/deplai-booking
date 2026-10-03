/**
 * GET /llms.txt — the plain-language summary for language models, from
 * server/assets/llms.txt with this deployment's addresses filled in.
 */
export default defineEventHandler(event => serveTextTemplate(event, 'llms.txt'))
