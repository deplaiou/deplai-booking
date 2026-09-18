/**
 * GET /api/admin/bookings?key=...
 *
 * Owner view of all bookings. Protected by a shared secret passed as a query
 * parameter — enough for a demo, and the page it powers is not linked anywhere.
 */
import { describeSlot } from '../../utils/slots'
import { listBookings, useDatabase } from '../../utils/db'
import { isBookingTopic, toLocale } from '#shared/types/booking'
import type { AdminBooking } from '#shared/types/booking'
import type { BookingRow } from '../../utils/db'

const HTTP_UNAUTHORIZED = 401

/** Map a stored row to the API shape, narrowing the columns SQLite keeps as plain text. */
function toAdminBooking(row: BookingRow): AdminBooking {
  const { date, time } = describeSlot(row.starts_at)
  return {
    id: row.id,
    reference: row.reference,
    startsAt: row.starts_at,
    date,
    time,
    name: row.name,
    email: row.email,
    // A row written by an older version could hold a topic the form no longer offers.
    topic: isBookingTopic(row.topic) ? row.topic : 'other',
    notes: row.notes,
    language: toLocale(row.language),
    createdAt: row.created_at,
  }
}

export default defineEventHandler((event): { bookings: AdminBooking[] } => {
  const config = useRuntimeConfig(event)
  const key = String(getQuery(event).key ?? '')

  if (!config.adminKey || key !== config.adminKey) {
    throw createError({ statusCode: HTTP_UNAUTHORIZED, statusMessage: 'unauthorized' })
  }

  const db = useDatabase(config.databasePath)
  return { bookings: listBookings(db).map(toAdminBooking) }
})
