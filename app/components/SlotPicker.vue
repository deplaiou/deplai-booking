<script setup lang="ts">
/**
 * Day strip plus the times of the chosen day. Emits the slot the visitor picks.
 *
 * One day at a time instead of ten stacked day cards: the visitor scans dates first,
 * then times, and the times never push the form far below the fold. Taken slots stay
 * visible but disabled, so the calendar looks alive rather than empty.
 */
import type { Slot, SlotDay } from '#shared/types/booking'

const props = defineProps<{
  days: SlotDay[]
  pending: boolean
  failed: boolean
}>()

const emit = defineEmits<{ select: [slot: Slot] }>()

const { t, locale } = useI18n()
const { email } = useSiteLinks()

const hasFree = (day: SlotDay): boolean => day.slots.some(slot => slot.available)
const hasSlots = computed(() => props.days.some(hasFree))

/** The chosen day; falls back to the first day with a free slot when unset or fully booked. */
const chosenDate = ref<string | null>(null)
const activeDay = computed<SlotDay | undefined>(() =>
  props.days.find(day => day.date === chosenDate.value && hasFree(day)) ?? props.days.find(hasFree),
)

/** Day label like "22.09": short enough for mobile, unambiguous for Estonians. */
function shortDate(dateIso: string): string {
  const [, month, day] = dateIso.split('-')
  return `${day}.${month}`
}

/**
 * Conventional short weekday for the strip: "E", "T", "K" in Estonian, "Mon", "Tue" in English.
 * Noon UTC keeps the calendar date the same in Tallinn whatever the offset.
 */
function shortWeekday(dateIso: string): string {
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'et-EE', { weekday: 'short', timeZone: 'UTC' })
    .format(new Date(`${dateIso}T12:00:00Z`))
}
</script>

<template>
  <div>
    <div v-if="pending" class="skeleton" aria-busy="true" :aria-label="t('loading_slots')">
      <div class="bar" />
      <div class="grid"><span v-for="i in 10" :key="i" /></div>
    </div>
    <p v-else-if="failed" class="status-line error">{{ t('slots_error') }}</p>
    <p v-else-if="!hasSlots" class="status-line">{{ t('no_slots', { email }) }}</p>

    <template v-else>
      <div class="days" role="group" :aria-label="t('step_time')">
        <button
          v-for="day in days"
          :key="day.date"
          type="button"
          class="day-btn"
          :disabled="!hasFree(day)"
          :aria-pressed="day.date === activeDay?.date"
          :aria-label="`${day.weekday} ${shortDate(day.date)}`"
          :title="hasFree(day) ? undefined : t('day_full')"
          @click="chosenDate = day.date"
        >
          <span class="wd" aria-hidden="true">{{ shortWeekday(day.date) }}</span>
          <span class="dt" aria-hidden="true">{{ shortDate(day.date) }}</span>
        </button>
      </div>

      <template v-if="activeDay">
        <p class="day-title">{{ activeDay.weekday }}, {{ shortDate(activeDay.date) }}</p>
        <div class="slot-grid">
          <button
            v-for="slot in activeDay.slots"
            :key="slot.startsAt"
            type="button"
            class="slot"
            :disabled="!slot.available"
            :title="slot.available ? undefined : t('slot_taken_label')"
            @click="emit('select', slot)"
          >
            {{ slot.time }}
          </button>
        </div>
      </template>
    </template>
  </div>
</template>
