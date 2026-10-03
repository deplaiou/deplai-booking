<script setup lang="ts">
/**
 * Root component: sets the document language, the hreflang links for the two
 * language versions, and the sharing defaults that do not change per page.
 */
const { locale } = useI18n()
const config = useRuntimeConfig()
const head = useLocaleHead({ dir: true, lang: true, seo: true })

useHead({
  // `data-mode` picks the accent in main.css: amber for the demo, Deplai green for real use.
  htmlAttrs: { lang: head.value.htmlAttrs?.lang ?? locale.value, 'data-mode': config.public.demoMode ? 'demo' : 'live' },
  link: head.value.link ?? [],
  meta: head.value.meta ?? [],
})

useSeoMeta({ ogSiteName: 'Deplai' })
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
