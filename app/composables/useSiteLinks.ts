/**
 * Deplai's contact address and main-site links, read from runtime config
 * (NUXT_PUBLIC_CONTACT_EMAIL, NUXT_PUBLIC_MAIN_SITE_URL) so no component writes
 * an address of its own.
 */
export function useSiteLinks() {
  const { t, locale } = useI18n()
  const { public: publicConfig } = useRuntimeConfig()

  const email = String(publicConfig.contactEmail)
  const mainSite = String(publicConfig.mainSiteUrl).replace(/\/$/, '')

  return {
    email,
    mainSite,
    /** "deplai.eu": the main site as people write it. */
    mainSiteHost: new URL(mainSite).host,
    /** The main site in the visitor's language. */
    mainSiteLocalized: computed(() => (locale.value === 'en' ? `${mainSite}/en` : mainSite)),
    mailHref: computed(() => `mailto:${email}?subject=${encodeURIComponent(t('mail_subject'))}`),
  }
}
