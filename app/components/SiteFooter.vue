<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const year = new Date().getFullYear()
const mainSite = computed(() => (locale.value === 'en' ? 'https://deplai.eu/en' : 'https://deplai.eu'))
</script>

<template>
  <footer>
    <div class="wrap">
      <div class="foot-inner">
        <div class="foot-brand">
          <NuxtLink class="logo" :to="localePath('/')">deplai<span class="dot">.</span></NuxtLink>
          <p>{{ t('foot_tag') }}</p>
        </div>
        <ul class="foot-links">
          <li><a :href="mainSite" rel="noopener">{{ t('footer_back') }}</a></li>
          <li><a :href="`${mainSite}/terms`" rel="noopener">{{ t('foot_terms') }}</a></li>
          <li><a :href="`${mainSite}/privacy`" rel="noopener">{{ t('foot_privacy') }}</a></li>
          <li><a href="mailto:hello@deplai.eu">hello@deplai.eu</a></li>
        </ul>
      </div>
      <p class="foot-legal">© {{ year }} Deplai OÜ<template v-if="config.public.demoMode">. {{ t('footer_note') }}</template></p>
    </div>
  </footer>
</template>
