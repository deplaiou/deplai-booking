/**
 * POST /api/bookings
 *
 * Creates a booking for one slot. Public, rate-limited per IP.
 * The unique index on `starts_at` is what actually prevents double booking:
 * two people submitting the same slot at the same moment cannot both win.
 */
import { describeSlot, isValidSlot } from '../utils/slots'
import { generateReference, validateBookingRequest } from '../utils/validation'
import { insertBooking, useDatabase } from '../utils/db'
import { isRateLimited } from '../utils/rate-limit'
import type { ApiErrorBody, BookingConfirmation } from '#shared/types/booking'

const HTTP_BAD_REQUEST = 400
const HTTP_CONFLICT = 409
const HTTP_TOO_MANY_REQUESTS = 429

/** Reject with a typed error body the client can translate. */
function fail(statusCode: number, body: ApiErrorBody): never {
  throw createError({ statusCode, data: body, statusMessage: body.code })
}

/** Best-effort client address, used only for rate limiting and abuse review. */
function clientAddress(event: Parameters<typeof getRequestHeader>[0]): string {
  return getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    ?? event.node.req.socket.remoteAddress
    ?? 'unknown'
}

export default defineEventHandler(async (event): Promise<BookingConfirmation> => {
  const config = useRuntimeConfig(event)
  const clientIp = clientAddress(event)

  if (isRateLimited(clientIp)) {
    fail(HTTP_TOO_MANY_REQUESTS, { code: 'rate_limited' })
  }

  const validation = validateBookingRequest(await readBody(event))
  if (!validation.valid) {
    fail(HTTP_BAD_REQUEST, { code: 'validation', fields: validation.invalidFields })
  }

  const booking = validation.value
  if (!isValidSlot(booking.startsAt)) {
    fail(HTTP_BAD_REQUEST, { code: 'slot_invalid' })
  }

  const reference = generateReference()
  const db = useDatabase(config.databasePath)

  try {
    insertBooking(db, {
      reference,
      starts_at: booking.startsAt,
      name: booking.name,
      email: booking.email,
      topic: booking.topic,
      notes: booking.notes ?? null,
      language: booking.language,
      created_at: new Date().toISOString(),
      client_ip: clientIp,
    })
  } catch (error) {
    // UNIQUE(starts_at) violation means somebody booked this slot a moment earlier.
    if (String((error as { code?: string }).code ?? '').includes('SQLITE_CONSTRAINT')) {
      fail(HTTP_CONFLICT, { code: 'slot_taken' })
    }
    throw error
  }

  const { date, time } = describeSlot(booking.startsAt)
  return {
    reference,
    startsAt: booking.startsAt,
    date,
    time,
    name: booking.name,
    email: booking.email,
    topic: booking.topic,
  }
})
