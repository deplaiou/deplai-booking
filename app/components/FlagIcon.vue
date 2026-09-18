<script setup lang="ts">
/** Small inline SVG flag. Only the two supported locales for now. */
defineProps<{ code: 'et' | 'en' }>()
</script>

<template>
  <svg class="flag" viewBox="0 0 20 14" aria-hidden="true">
    <template v-if="code === 'et'">
      <rect width="20" height="14" fill="#0072CE"/><rect y="4.67" width="20" height="4.67" fill="#000"/><rect y="9.33" width="20" height="4.67" fill="#fff"/>
    </template>
    <template v-else>
      <rect width="20" height="14" fill="#012169"/><path d="M0 0l20 14M20 0L0 14" stroke="#fff" stroke-width="2.8"/><path d="M0 0l20 14M20 0L0 14" stroke="#C8102E" stroke-width="1.2"/><path d="M10 0v14M0 7h20" stroke="#fff" stroke-width="4.6"/><path d="M10 0v14M0 7h20" stroke="#C8102E" stroke-width="2.6"/>
    </template>
  </svg>
</template>
