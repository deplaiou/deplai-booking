<script setup lang="ts">
/**
 * Booking page: pick a slot, fill in details, get a confirmation.
 * All of the flow's state lives in `useBooking`; this file is the markup.
 */
const { t, locale } = useI18n()
const config = useRuntimeConfig()

const {
  days, pending, slotsFailed,
  selectedSlot, selectedWeekday, confirmation,
  submitPending, errorMessage, invalidFields,
  select, clearSelection, submit, startAgain,
} = await useBooking()

useSeoMeta({
  title: () => t('meta_title'),
  description: () => t('meta_description'),
  ogTitle: () => t('meta_title'),
  ogDescription: () => t('meta_description'),
  ogType: 'website',
})

/**
 * Structured data describing what this page offers, so search engines and AI
 * crawlers can state plainly what it is without parsing the layout.
 */
const siteUrl = String(config.public.siteUrl).replace(/\/$/, '')
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: computed(() => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: t('meta_title'),
      description: t('meta_description'),
      inLanguage: locale.value === 'en' ? 'en-GB' : 'et-EE',
      url: locale.value === 'en' ? `${siteUrl}/en` : `${siteUrl}/`,
      isPartOf: { '@type': 'WebSite', name: 'Deplai booking demo', url: siteUrl },
      about: {
        '@type': 'Organization',
        name: 'Deplai',
        url: 'https://deplai.eu',
        email: 'hello@deplai.eu',
        description: t('meta_description'),
      },
      potentialAction: {
        '@type': 'ReserveAction',
        name: t('hero_title'),
        target: { '@type': 'EntryPoint', urlTemplate: locale.value === 'en' ? `${siteUrl}/en` : `${siteUrl}/` },
        result: { '@type': 'Reservation', name: t('hero_title') },
      },
    })),
  }],
})

const HERO_NOTES = ['hero_note_free', 'hero_note_time', 'hero_note_tz'] as const
</script>

<template>
  <div>
    <BookingSuccess
      v-if="confirmation"
      :booking="confirmation"
      :weekday="selectedWeekday"
      @again="startAgain"
    />

    <template v-else>
      <h1>{{ t('hero_title') }}</h1>
      <p class="lead">{{ t('hero_lead') }}</p>
      <div class="notes">
        <span v-for="key in HERO_NOTES" :key="key">
          <svg class="tick" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>{{ t(key) }}
        </span>
      </div>

      <div class="step-head">
        <b class="num">1</b>
        <h2>{{ t('step_time') }}</h2>
      </div>

      <div v-if="selectedSlot" class="selected">
        <div>
          <div class="selected-label">{{ t('selected_time') }}</div>
          <div class="selected-value">{{ selectedWeekday }}, {{ selectedSlot.date }} {{ selectedSlot.time }}</div>
        </div>
        <button class="btn btn-ghost btn-small" type="button" @click="clearSelection">{{ t('change_time') }}</button>
      </div>

      <SlotPicker
        v-else
        :days="days"
        :pending="pending"
        :failed="slotsFailed"
        :selected="null"
        @select="select"
      />

      <template v-if="selectedSlot">
        <div class="step-head">
          <b class="num">2</b>
          <h2>{{ t('step_details') }}</h2>
        </div>
        <BookingForm
          :pending="submitPending"
          :error-message="errorMessage"
          :invalid-fields="invalidFields"
          @submit="submit"
        />
      </template>
      <p v-else-if="errorMessage" class="status-line error">{{ errorMessage }}</p>
    </template>
  </div>
</template>
