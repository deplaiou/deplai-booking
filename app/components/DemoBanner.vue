<script setup lang="ts">
/**
 * Banner shown at the top of every page while the app runs in demo mode.
 * Explains that bookings are real but wiped nightly, and links back to deplai.eu.
 */
const { t, locale } = useI18n()
const config = useRuntimeConfig()

const mainSite = computed(() => (locale.value === 'en' ? 'https://deplai.eu/en' : 'https://deplai.eu'))
</script>

<template>
  <div v-if="config.public.demoMode">
    <div class="demo-tape" aria-hidden="true" />
    <div class="demo-banner">
      <div class="wrap demo-inner">
        <span class="demo-badge">{{ t('demo_badge') }}</span>
        <span class="demo-text">{{ t('demo_text') }}</span>
        <a class="demo-link" :href="mainSite" rel="noopener">{{ t('demo_built_with') }} →</a>
      </div>
    </div>
  </div>
</template>
