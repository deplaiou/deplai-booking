import type { H3Event } from 'h3'

/**
 * Serves a text file from server/assets with {{siteUrl}}, {{mainSiteUrl}} and
 * {{contactEmail}} filled in from runtime config, so robots.txt and llms.txt follow
 * the environment instead of naming a host of their own.
 */
export async function serveTextTemplate(event: H3Event, name: string): Promise<string> {
  const template = await useStorage('assets:server').getItem<string>(name)
  if (template === null) {
    throw createError({ statusCode: 404 })
  }

  const { public: publicConfig } = useRuntimeConfig(event)
  const values: Record<string, string> = {
    siteUrl: String(publicConfig.siteUrl).replace(/\/$/, ''),
    mainSiteUrl: String(publicConfig.mainSiteUrl).replace(/\/$/, ''),
    contactEmail: String(publicConfig.contactEmail),
  }

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return String(template).replace(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match)
}
