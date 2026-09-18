<script setup lang="ts">
/** Confirmation shown after a successful booking. */
import type { BookingConfirmation } from '#shared/types/booking'

defineProps<{ booking: BookingConfirmation; weekday: string }>()
defineEmits<{ again: [] }>()

const { t } = useI18n()
const config = useRuntimeConfig()
</script>

<template>
  <div class="success" role="status">
    <h2>{{ t('success_title') }}</h2>
    <!-- Outside demo mode the owner really does follow up by email; inside it, nothing
         is sent and nothing is kept, so the note replaces the promise rather than
         contradicting it. -->
    <p v-if="!config.public.demoMode">{{ t('success_lead') }}</p>
    <dl>
      <dt>{{ t('success_when') }}</dt>
      <dd class="capitalize">{{ weekday }}, {{ booking.date }} {{ booking.time }}</dd>
      <dt>{{ t('success_topic') }}</dt>
      <dd>{{ t(`topic_${booking.topic}`) }}</dd>
      <dt>{{ t('success_reference') }}</dt>
      <dd>{{ booking.reference }}</dd>
    </dl>

    <p v-if="config.public.demoMode" class="demo-note">
      <span aria-hidden="true">⚠</span>
      <span><b>{{ t('demo_pill') }}.</b> {{ t('success_demo_note') }}</span>
    </p>

    <button class="btn btn-ghost btn-small" type="button" @click="$emit('again')">
      {{ t('success_new') }}
    </button>
  </div>
</template>
