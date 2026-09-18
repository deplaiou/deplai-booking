<script setup lang="ts">
/**
 * Lists the available meeting slots grouped by day and emits the one the visitor picks.
 * Taken slots stay visible but disabled, so the calendar looks alive rather than empty.
 */
import type { Slot, SlotDay } from '#shared/types/booking'

const props = defineProps<{
  days: SlotDay[]
  pending: boolean
  failed: boolean
  selected: string | null
}>()

const emit = defineEmits<{ select: [slot: Slot] }>()

const { t } = useI18n()
const hasSlots = computed(() => props.days.some(day => day.slots.length > 0))

/** Day label like "22.09" — short enough for mobile, unambiguous for Estonians. */
function shortDate(dateIso: string): string {
  const [, month, day] = dateIso.split('-')
  return `${day}.${month}`
}
</script>

<template>
  <div>
    <p v-if="pending" class="status-line">{{ t('loading_slots') }}</p>
    <p v-else-if="failed" class="status-line error">{{ t('slots_error') }}</p>
    <p v-else-if="!hasSlots" class="status-line">{{ t('no_slots') }}</p>

    <div v-for="day in days" v-else :key="day.date" class="day">
      <div class="day-head">
        <span class="day-weekday">{{ day.weekday }}</span>
        <span class="day-date">{{ shortDate(day.date) }}</span>
      </div>
      <div class="slot-grid">
        <button
          v-for="slot in day.slots"
          :key="slot.startsAt"
          type="button"
          class="slot"
          :disabled="!slot.available"
          :aria-pressed="slot.startsAt === selected"
          :title="slot.available ? undefined : t('slot_taken_label')"
          @click="emit('select', slot)"
        >
          {{ slot.time }}
        </button>
      </div>
    </div>
  </div>
</template>
