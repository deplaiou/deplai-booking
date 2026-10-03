<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const { email, mainSiteHost, mainSiteLocalized: mainSite } = useSiteLinks()
const year = new Date().getFullYear()
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
          <li><a :href="mainSite" rel="noopener">{{ mainSiteHost }}</a></li>
          <li><a :href="`${mainSite}/terms`" rel="noopener">{{ t('foot_terms') }}</a></li>
          <li><a :href="`${mainSite}/privacy`" rel="noopener">{{ t('foot_privacy') }}</a></li>
          <li><a :href="`mailto:${email}`">{{ email }}</a></li>
        </ul>
      </div>
      <p class="foot-legal">© {{ year }} Deplai OÜ<template v-if="config.public.demoMode">. {{ t('footer_note') }}</template></p>
    </div>
  </footer>
</template>
