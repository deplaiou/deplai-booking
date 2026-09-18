<script setup lang="ts">
/**
 * Language dropdown (flag + code), same component as on deplai.eu.
 * Closes on outside click and Escape; each language keeps its own URL (/ vs /en).
 */
type LocaleCode = 'et' | 'en'
interface LocaleItem { code: LocaleCode; name: string }

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const items = computed(() => locales.value as LocaleItem[])

function onDocumentClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}
onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="root" class="lang-dd" :class="{ open }">
    <button type="button" class="lang-btn" aria-haspopup="listbox" :aria-expanded="open" @click="open = !open">
      <FlagIcon :code="locale as LocaleCode" />
      <span>{{ locale.toUpperCase() }}</span>
      <svg class="chev-s" width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="lang-menu" role="listbox" aria-label="Language">
      <NuxtLink
        v-for="item in items"
        :key="item.code"
        :to="switchLocalePath(item.code)"
        role="option"
        :aria-current="item.code === locale"
        @click="open = false"
      >
        <FlagIcon :code="item.code" />
        {{ item.name }}
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.lang-menu a{display:flex;align-items:center;gap:10px;width:100%;font-size:.9rem;font-weight:500;color:var(--ink);text-decoration:none;border-radius:7px;padding:9px 10px}
.lang-menu a:hover{background:var(--bg)}
.lang-menu a[aria-current="true"]{background:var(--accent-soft);font-weight:700}
</style>
