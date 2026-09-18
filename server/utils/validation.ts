/**
 * Input validation for booking requests.
 *
 * Kept dependency-free: the rules are simple and explicit, and the UI shows a
 * translated message per invalid field. Validation is also the only place a raw
 * request body is narrowed to the typed `BookingRequest` the rest of the server
 * works with.
 */
import { randomInt } from 'node:crypto'
import { isBookingTopic, toLocale } from '#shared/types/booking'
import type { BookingRequest } from '#shared/types/booking'

export const NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 120
export const EMAIL_MAX_LENGTH = 254
export const NOTES_MAX_LENGTH = 1000

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/

/** Field names the UI can highlight; they match the form input ids. */
export type BookingField = 'startsAt' | 'name' | 'email' | 'topic'

export type ValidationResult =
  | { valid: true; value: BookingRequest }
  | { valid: false; invalidFields: BookingField[] }

/**
 * Validate and normalise a raw booking payload.
 *
 * @param raw Untrusted request body.
 * @returns Either the trimmed, typed value or the list of fields that failed.
 */
export function validateBookingRequest(raw: unknown): ValidationResult {
  const body = (raw ?? {}) as Record<string, unknown>
  const text = (key: string, max: number): string => String(body[key] ?? '').trim().slice(0, max)

  const startsAt = String(body.startsAt ?? '').trim()
  const name = text('name', NAME_MAX_LENGTH)
  const email = text('email', EMAIL_MAX_LENGTH).toLowerCase()
  const topic = body.topic
  const notes = text('notes', NOTES_MAX_LENGTH)

  const invalidFields: BookingField[] = []
  if (!startsAt) invalidFields.push('startsAt')
  if (name.length < NAME_MIN_LENGTH) invalidFields.push('name')
  if (!EMAIL_PATTERN.test(email)) invalidFields.push('email')
  if (!isBookingTopic(topic)) invalidFields.push('topic')

  if (invalidFields.length > 0 || !isBookingTopic(topic)) {
    return { valid: false, invalidFields }
  }

  return {
    valid: true,
    value: { startsAt, name, email, topic, notes: notes || undefined, language: toLocale(body.language) },
  }
}

/**
 * Generate a short human-friendly booking reference, e.g. "DP-7QK4M2".
 *
 * Uses the crypto RNG: a reference is shown to the visitor as proof of their
 * booking, so it should not be guessable from another one.
 */
export function generateReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no look-alike characters
  const characters = Array.from({ length: 6 }, () => alphabet.charAt(randomInt(alphabet.length)))
  return `DP-${characters.join('')}`
}
