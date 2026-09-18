<script setup lang="ts">
/**
 * Sticky header in the deplai.eu style, kept to the essentials: the wordmark,
 * a demo marker and the language dropdown. The marker lives here rather than
 * only in the banner because the header is what stays on screen when scrolling.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
</script>

<template>
  <nav class="site-head">
    <div class="wrap head-inner">
      <div class="brand">
        <NuxtLink class="logo" :to="localePath('/')">deplai<span class="dot">.</span></NuxtLink>
        <span v-if="config.public.demoMode" class="demo-pill">{{ t('demo_pill') }}</span>
      </div>
      <LangSwitcher />
    </div>
  </nav>
</template>
