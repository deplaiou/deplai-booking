/**
 * The booking flow as one piece of state: which slots exist, which one is
 * selected, what the server said, and the confirmation once it succeeds.
 *
 * Keeping it here rather than in the page means the page is only markup, and the
 * flow can be exercised on its own.
 */
import type {
  ApiErrorBody,
  BookingConfirmation,
  BookingDetails,
  BookingErrorCode,
  Slot,
  SlotsResponse,
} from '#shared/types/booking'

export async function useBooking() {
  const { t, locale } = useI18n()

  const { data, pending, error: slotsError, refresh } = await useFetch<SlotsResponse>('/api/slots', {
    query: { lang: locale },
  })

  const selectedSlot = ref<Slot | null>(null)
  const confirmation = ref<BookingConfirmation | null>(null)
  const submitPending = ref(false)
  const errorMessage = ref<string | null>(null)
  const invalidFields = ref<string[]>([])

  const days = computed(() => data.value?.days ?? [])

  /** Weekday label of the selected (or just booked) slot, taken from the loaded day list. */
  const selectedWeekday = computed(() => {
    const date = confirmation.value?.date ?? selectedSlot.value?.date
    return days.value.find(day => day.date === date)?.weekday ?? ''
  })

  function select(slot: Slot): void {
    selectedSlot.value = slot
    errorMessage.value = null
  }

  function clearSelection(): void {
    selectedSlot.value = null
  }

  function startAgain(): void {
    confirmation.value = null
    selectedSlot.value = null
  }

  /** Read the typed error body the API sends, falling back to a generic failure. */
  function readErrorBody(requestError: unknown): { code: BookingErrorCode; fields?: string[] } {
    const body = (requestError as { data?: ApiErrorBody }).data
    return { code: body?.code ?? 'server_error', fields: body?.fields }
  }

  async function submit(details: BookingDetails): Promise<void> {
    if (!selectedSlot.value) return

    submitPending.value = true
    errorMessage.value = null
    invalidFields.value = []

    try {
      confirmation.value = await $fetch<BookingConfirmation>('/api/bookings', {
        method: 'POST',
        body: { ...details, startsAt: selectedSlot.value.startsAt, language: locale.value },
      })
      await refresh()
    } catch (requestError: unknown) {
      const { code, fields } = readErrorBody(requestError)
      errorMessage.value = t(`error_${code}`)
      invalidFields.value = fields ?? []
      // The slot is gone: send the visitor back to the calendar with fresh data.
      if (code === 'slot_taken' || code === 'slot_invalid') {
        selectedSlot.value = null
        await refresh()
      }
    } finally {
      submitPending.value = false
    }
  }

  return {
    days,
    pending,
    slotsFailed: computed(() => Boolean(slotsError.value)),
    selectedSlot,
    selectedWeekday,
    confirmation,
    submitPending,
    errorMessage,
    invalidFields,
    select,
    clearSelection,
    submit,
    startAgain,
  }
}
