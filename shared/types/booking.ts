/**
 * Shared types for the booking demo.
 * Used by both the Nitro server routes and the Vue components.
 */

/** The two languages the app is published in. */
export const LOCALES = ['et', 'en'] as const
export type Locale = (typeof LOCALES)[number]

/** Meeting topics offered in the form. Labels come from i18n (`topic_*`). */
export const BOOKING_TOPICS = ['deploy', 'quote', 'migration', 'other'] as const
export type BookingTopic = (typeof BOOKING_TOPICS)[number]

/** A bookable 30-minute meeting slot. */
export interface Slot {
  /** ISO 8601 UTC start time, e.g. "2026-09-22T09:00:00.000Z". */
  startsAt: string
  /** Local date in Europe/Tallinn, e.g. "2026-09-22". Used for grouping in the UI. */
  date: string
  /** Local time in Europe/Tallinn, e.g. "09:00". */
  time: string
  /** False when somebody has already booked this slot. */
  available: boolean
}

/** Slots grouped by day, as returned by GET /api/slots. */
export interface SlotDay {
  date: string
  /** Weekday name in the requested language, e.g. "esmaspäev". */
  weekday: string
  slots: Slot[]
}

export interface SlotsResponse {
  days: SlotDay[]
  /** IANA timezone the times are displayed in. */
  timezone: string
}

/** The details a visitor fills in, once validated. */
export interface BookingDetails {
  name: string
  email: string
  topic: BookingTopic
  notes?: string
}

/** Payload of POST /api/bookings. */
export interface BookingRequest extends BookingDetails {
  startsAt: string
  language: Locale
}

/** A stored booking as shown to the visitor after booking. */
export interface BookingConfirmation {
  reference: string
  startsAt: string
  date: string
  time: string
  name: string
  email: string
  topic: BookingTopic
}

/** A booking row in the owner view. */
export interface AdminBooking extends BookingConfirmation {
  id: number
  notes: string | null
  language: Locale
  createdAt: string
}

/** Error codes the API can return, so the UI can show a translated message. */
export type BookingErrorCode =
  | 'validation'
  | 'slot_taken'
  | 'slot_invalid'
  | 'rate_limited'
  | 'server_error'

export interface ApiErrorBody {
  code: BookingErrorCode
  fields?: string[]
}

/** True when the value is one of the topics the form offers. */
export function isBookingTopic(value: unknown): value is BookingTopic {
  return typeof value === 'string' && (BOOKING_TOPICS as readonly string[]).includes(value)
}

/** Narrow anything to a supported locale, falling back to Estonian. */
export function toLocale(value: unknown): Locale {
  return value === 'en' ? 'en' : 'et'
}
