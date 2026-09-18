<script setup lang="ts">
/**
 * Root component: sets the document language, the hreflang links for the two
 * language versions, and the sharing defaults that do not change per page.
 */
const { locale } = useI18n()
const head = useLocaleHead({ dir: true, lang: true, seo: true })

useHead({
  htmlAttrs: { lang: head.value.htmlAttrs?.lang ?? locale.value },
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
