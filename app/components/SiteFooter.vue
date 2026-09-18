<script setup lang="ts">
const { t, locale } = useI18n()
const year = new Date().getFullYear()
const mainSite = computed(() => (locale.value === 'en' ? 'https://deplai.eu/en' : 'https://deplai.eu'))
</script>

<template>
  <footer>
    <div class="wrap foot-inner">
      <div>
        <b style="color:var(--ink)">deplai<span style="color:var(--accent)">.</span></b><br>
        <span>{{ t('foot_tag') }}</span>
      </div>
      <div>
        <a :href="mainSite" rel="noopener">{{ t('footer_back') }}</a> &nbsp;·&nbsp;
        <a :href="`${mainSite}/terms`" rel="noopener">{{ t('foot_terms') }}</a> &nbsp;·&nbsp;
        <a :href="`${mainSite}/privacy`" rel="noopener">{{ t('foot_privacy') }}</a> &nbsp;·&nbsp;
        <a href="mailto:hello@deplai.eu">hello@deplai.eu</a><br>
        © {{ year }} Deplai OÜ · {{ t('footer_note') }}
      </div>
    </div>
  </footer>
</template>
