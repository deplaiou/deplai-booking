<script setup lang="ts">
/**
 * Confirmation shown after a successful booking, with an "add to calendar" file so
 * the visitor does not have to copy the time over by hand.
 */
import { MEETING_MINUTES } from '#shared/types/booking'
import type { BookingConfirmation } from '#shared/types/booking'

const props = defineProps<{ booking: BookingConfirmation; weekday: string }>()
defineEmits<{ again: [] }>()

const { t } = useI18n()
const config = useRuntimeConfig()
const mailHref = computed(() => `mailto:hello@deplai.eu?subject=${encodeURIComponent(t('mail_subject'))}`)

const MS_PER_MINUTE = 60 * 1000

/** "2026-10-06" → "06.10.2026", the way the date is written in Estonia. */
const displayDate = computed(() => props.booking.date.split('-').reverse().join('.'))

/** iCalendar UTC timestamp: 20261006T070000Z. */
function icsStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/**
 * A minimal RFC 5545 event as a data URL. Times are UTC, so every calendar shows the
 * meeting in its owner's own time zone. Built on the client: nothing to store or serve.
 */
const icsHref = computed(() => {
  const start = new Date(props.booking.startsAt)
  const end = new Date(start.getTime() + MEETING_MINUTES * MS_PER_MINUTE)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Deplai//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${props.booking.reference}@deplai.app`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${t('ics_title')}`,
    `DESCRIPTION:${t('success_reference')}: ${props.booking.reference}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`
})
</script>

<template>
  <div class="success" role="status">
    <h2>{{ t(config.public.demoMode ? 'success_title_demo' : 'success_title') }}</h2>
    <!-- Outside demo mode the owner really does follow up by email; inside it, nothing
         is sent and nothing is kept, so the note replaces the promise rather than
         contradicting it. -->
    <p v-if="!config.public.demoMode">{{ t('success_lead') }}</p>
    <dl>
      <dt>{{ t('success_when') }}</dt>
      <dd><span class="capitalize">{{ weekday }}</span>, {{ displayDate }} {{ booking.time }}</dd>
      <dt>{{ t('success_topic') }}</dt>
      <dd>{{ t(`topic_${booking.topic}`) }}</dd>
      <dt>{{ t('success_reference') }}</dt>
      <dd class="mono">{{ booking.reference }}</dd>
    </dl>

    <p v-if="config.public.demoMode" class="demo-note">{{ t('success_demo_note') }}</p>

    <div class="success-actions">
      <!-- A demo booking is not a meeting, so it gets no calendar file: the next step is email. -->
      <a v-if="config.public.demoMode" class="btn btn-accent btn-small" :href="mailHref">{{ t('contact_cta_short') }}</a>
      <a v-else class="btn btn-accent btn-small" :href="icsHref" :download="`deplai-${booking.reference}.ics`">{{ t('success_ics') }}</a>
      <button class="btn btn-ghost btn-small" type="button" @click="$emit('again')">
        {{ t('success_new') }}
      </button>
    </div>
  </div>
</template>
