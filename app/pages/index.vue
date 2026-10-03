<script setup lang="ts">
/**
 * Booking page: what the page is on the left, the flow on the right
 * (day and time, then details, then the confirmation).
 * All of the flow's state lives in `useBooking`; this file is the markup.
 *
 * In demo mode the copy says plainly that nothing booked here is real, and points
 * anyone who actually wants to talk to email instead.
 */
const { t, locale } = useI18n()
const config = useRuntimeConfig()
const { email, mainSite, mailHref } = useSiteLinks()
const demo = Boolean(config.public.demoMode)

/** Demo copy lives under `<key>_demo`; real-use copy under the plain key. */
const modeKey = (key: string): string => (demo ? `${key}_demo` : key)

const {
  days, pending, slotsFailed,
  selectedSlot, selectedWeekday, confirmation,
  submitPending, errorMessage, invalidFields,
  select, clearSelection, submit, startAgain,
} = await useBooking()

useSeoMeta({
  title: () => t(modeKey('meta_title')),
  description: () => t(modeKey('meta_description'), { email }),
  ogTitle: () => t(modeKey('meta_title')),
  ogDescription: () => t(modeKey('meta_description'), { email }),
  ogType: 'website',
})

/**
 * Structured data describing what this page offers, so search engines and AI
 * crawlers can state plainly what it is without parsing the layout. The demo offers
 * no reservation anyone could rely on, so it does not claim a ReserveAction.
 */
const siteUrl = String(config.public.siteUrl).replace(/\/$/, '')
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: computed(() => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: t(modeKey('meta_title')),
      description: t(modeKey('meta_description'), { email }),
      inLanguage: locale.value === 'en' ? 'en-GB' : 'et-EE',
      url: locale.value === 'en' ? `${siteUrl}/en` : `${siteUrl}/`,
      isPartOf: { '@type': 'WebSite', name: 'Deplai booking demo', url: siteUrl },
      about: {
        '@type': 'Organization',
        name: 'Deplai',
        url: mainSite,
        email,
        description: t('foot_tag'),
      },
      ...(demo ? {} : {
        potentialAction: {
          '@type': 'ReserveAction',
          name: t('hero_title'),
          target: { '@type': 'EntryPoint', urlTemplate: locale.value === 'en' ? `${siteUrl}/en` : `${siteUrl}/` },
          result: { '@type': 'Reservation', name: t('hero_title') },
        },
      }),
    })),
  }],
})

const FACTS = demo
  ? (['bookings', 'emails', 'built', 'hosting'] as const)
  : (['length', 'format', 'price', 'tz'] as const)
</script>

<template>
  <div class="booking">
    <section class="intro">
      <h1>{{ t(modeKey('hero_title')) }}</h1>
      <p class="lead">{{ t(modeKey('hero_lead')) }}</p>
      <dl class="facts">
        <template v-for="key in FACTS" :key="key">
          <dt>{{ t(`fact_${key}_label`) }}</dt>
          <dd>{{ t(`fact_${key}`) }}</dd>
        </template>
      </dl>
    </section>

    <!-- Its own grid item: beside the intro on desktop, below the booking panel on a phone,
         so the demo itself is the first thing a phone visitor reaches. -->
    <section v-if="demo" class="contact">
      <h2>{{ t('contact_h') }}</h2>
      <p>{{ t('contact_p') }}</p>
      <a class="btn btn-ghost" :href="mailHref">{{ t('contact_cta', { email }) }}</a>
    </section>

    <div class="panel">
      <BookingSuccess
        v-if="confirmation"
        :booking="confirmation"
        :weekday="selectedWeekday"
        @again="startAgain"
      />

      <template v-else>
        <section v-if="selectedSlot" class="panel-section selected">
          <div>
            <div class="selected-label">{{ t('selected_time') }}</div>
            <div class="selected-value">
              <span class="wd">{{ selectedWeekday }}</span>, {{ selectedSlot.date.split('-').reverse().join('.') }}
              <span class="time">{{ selectedSlot.time }}</span>
            </div>
          </div>
          <button class="btn btn-ghost btn-small" type="button" @click="clearSelection">{{ t('change_time') }}</button>
        </section>

        <section v-else class="panel-section">
          <h2>{{ t('step_time') }}</h2>
          <SlotPicker :days="days" :pending="pending" :failed="slotsFailed" @select="select" />
          <p v-if="errorMessage" class="status-line error" role="alert">{{ errorMessage }}</p>
        </section>

        <section v-if="selectedSlot" class="panel-section">
          <h2>{{ t('step_details') }}</h2>
          <BookingForm
            :pending="submitPending"
            :error-message="errorMessage"
            :invalid-fields="invalidFields"
            @submit="submit"
          />
        </section>
      </template>
    </div>
  </div>
</template>
