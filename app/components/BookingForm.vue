<script setup lang="ts">
/**
 * Details step: name, email, topic and optional notes for the selected slot.
 * Validation errors coming back from the API are mapped to the individual fields.
 */
import { BOOKING_TOPICS } from '#shared/types/booking'
import type { BookingDetails, BookingTopic } from '#shared/types/booking'

defineProps<{
  pending: boolean
  errorMessage: string | null
  invalidFields: string[]
}>()

const emit = defineEmits<{ submit: [details: BookingDetails] }>()

/** Same cap the server applies (server/utils/validation.ts), so nothing is cut off silently. */
const NOTES_MAX_LENGTH = 1000

const { t } = useI18n()
const demo = Boolean(useRuntimeConfig().public.demoMode)

const name = ref('')
const email = ref('')
const topic = ref<BookingTopic>('deploy')
const notes = ref('')

function onSubmit(event: Event): void {
  const form = event.target as HTMLFormElement
  if (!form.reportValidity()) return
  emit('submit', {
    name: name.value,
    email: email.value,
    topic: topic.value,
    notes: notes.value || undefined,
  })
}
</script>

<template>
  <form class="form-grid" novalidate @submit.prevent="onSubmit">
    <p v-if="demo" class="demo-note field full">{{ t('demo_form_note') }}</p>

    <div class="field">
      <label for="name">{{ t('form_name') }}</label>
      <input
        id="name" v-model="name" type="text" autocomplete="name" required
        :class="{ invalid: invalidFields.includes('name') }"
      >
    </div>

    <div class="field">
      <label for="email">{{ t('form_email') }}</label>
      <input
        id="email" v-model="email" type="email" autocomplete="email" required
        :class="{ invalid: invalidFields.includes('email') }"
      >
    </div>

    <fieldset class="field full">
      <legend class="field-label">{{ t('form_topic') }}</legend>
      <div class="radio-row">
        <template v-for="option in BOOKING_TOPICS" :key="option">
          <input :id="`topic-${option}`" v-model="topic" type="radio" name="topic" :value="option">
          <label :for="`topic-${option}`">{{ t(`topic_${option}`) }}</label>
        </template>
      </div>
    </fieldset>

    <div class="field full">
      <label for="notes">{{ t('form_notes') }}</label>
      <p id="notes-hint" class="field-hint">{{ t('form_notes_hint') }}</p>
      <textarea
        id="notes" v-model="notes" :maxlength="NOTES_MAX_LENGTH"
        :placeholder="t('form_notes_placeholder')" aria-describedby="notes-hint"
      ></textarea>
    </div>

    <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

    <div class="actions">
      <button class="btn btn-accent" type="submit" :disabled="pending">
        {{ pending ? t('form_sending') : t(demo ? 'form_submit_demo' : 'form_submit') }}
      </button>
      <p v-if="!demo">{{ t('form_privacy') }}</p>
    </div>
  </form>
</template>
