/**
 * Slot generation and validation.
 *
 * Meetings are 30 minutes, on weekdays, during Estonian office hours. Times are
 * computed in Europe/Tallinn but stored and transported as UTC ISO strings, so
 * daylight saving time is handled by the platform's timezone database.
 */
import type { Locale, Slot, SlotDay } from '#shared/types/booking'

export const TIMEZONE = 'Europe/Tallinn'
/** Local start times offered on each working day. */
export const SLOT_TIMES = ['09:00', '09:30', '10:00', '10:30', '11:00', '13:00', '13:30', '14:00', '14:30', '15:00'] as const
/** How many working days ahead can be booked. */
export const WORKING_DAYS_AHEAD = 10
/** Earliest booking: this many hours from now, so nobody books a meeting in 5 minutes. */
export const MIN_LEAD_TIME_HOURS = 2

const MS_PER_HOUR = 60 * 60 * 1000

/** Format a Date in a given timezone using Intl, returning the parts we need. */
function partsInTimezone(date: Date, timeZone: string): Record<string, string> {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
  return Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, part.value]))
}

/** Return the local date string (YYYY-MM-DD) of a Date in the given timezone. */
export function localDate(date: Date, timeZone = TIMEZONE): string {
  const parts = partsInTimezone(date, timeZone)
  return `${parts.year}-${parts.month}-${parts.day}`
}

/** Return the local time string (HH:mm) of a Date in the given timezone. */
export function localTime(date: Date, timeZone = TIMEZONE): string {
  const parts = partsInTimezone(date, timeZone)
  return `${parts.hour}:${parts.minute}`
}

/**
 * Convert a local Tallinn date + time to the matching UTC instant.
 *
 * Works by guessing UTC, measuring how far the guess lands from the wanted local
 * time, and correcting — which is correct across DST boundaries.
 */
function localToUtc(dateIso: string, time: string, timeZone = TIMEZONE): Date {
  const [year = 0, month = 1, day = 1] = dateIso.split('-').map(Number)
  const [hour = 0, minute = 0] = time.split(':').map(Number)
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute))
  const parts = partsInTimezone(guess, timeZone)
  const guessedLocal = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour), Number(parts.minute),
  )
  const offset = guessedLocal - guess.getTime()
  return new Date(guess.getTime() - offset)
}

/** Weekday name in the requested language, e.g. "esmaspäev" / "Monday". */
function weekdayName(date: Date, language: Locale, timeZone = TIMEZONE): string {
  const locale = language === 'en' ? 'en-GB' : 'et-EE'
  return new Intl.DateTimeFormat(locale, { timeZone, weekday: 'long' }).format(date)
}

/** True for Saturday and Sunday in the given timezone. */
function isWeekend(date: Date, timeZone = TIMEZONE): boolean {
  const weekday = new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'short' }).format(date)
  return weekday === 'Sat' || weekday === 'Sun'
}

/**
 * Build the bookable slots for the coming working days.
 *
 * @param takenIso   ISO start times that are already booked.
 * @param language   Language for weekday names.
 * @param now        Current time; injectable for tests.
 * @returns Days with their slots, oldest first. Days without any free slot are omitted.
 */
export function buildSlotDays(takenIso: string[], language: Locale, now: Date = new Date()): SlotDay[] {
  const taken = new Set(takenIso)
  const earliest = new Date(now.getTime() + MIN_LEAD_TIME_HOURS * MS_PER_HOUR)
  const days: SlotDay[] = []

  const cursor = new Date(now)
  let workingDaysFound = 0

  while (workingDaysFound < WORKING_DAYS_AHEAD) {
    if (!isWeekend(cursor)) {
      const dateIso = localDate(cursor)
      const slots: Slot[] = SLOT_TIMES
        // Times that have passed, or are inside the lead time, are left out entirely;
        // the ones that remain are shown either as free or as already booked.
        .map(time => ({ time, start: localToUtc(dateIso, time) }))
        .filter(({ start }) => start > earliest)
        .map(({ time, start }) => ({
          startsAt: start.toISOString(),
          date: dateIso,
          time,
          available: !taken.has(start.toISOString()),
        }))

      if (slots.length > 0) {
        days.push({ date: dateIso, weekday: weekdayName(cursor, language), slots })
        workingDaysFound += 1
      }
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return days
}

/**
 * Check that an ISO string is one of the slots we actually offer.
 *
 * Prevents a caller from booking 03:00 on a Sunday by posting a handcrafted time.
 */
export function isValidSlot(startsAtIso: string, now: Date = new Date()): boolean {
  const date = new Date(startsAtIso)
  if (Number.isNaN(date.getTime())) return false
  if (date.toISOString() !== startsAtIso) return false

  const days = buildSlotDays([], 'et', now)
  return days.some(day => day.slots.some(slot => slot.startsAt === startsAtIso))
}

/** Human-readable date and time of a slot, for confirmations. */
export function describeSlot(startsAtIso: string): { date: string; time: string } {
  const date = new Date(startsAtIso)
  return { date: localDate(date), time: localTime(date) }
}
