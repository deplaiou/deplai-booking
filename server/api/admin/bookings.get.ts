/**
 * GET /api/admin/bookings?key=...&archived=1
 *
 * Owner view of the bookings; `archived=1` adds the ones the nightly reset archived. Protected by a shared secret passed as a query
 * parameter — enough for a demo, and the page it powers is not linked anywhere.
 */
import { describeSlot } from '../../utils/slots'
import { listBookings, useDatabase } from '../../utils/db'
import { isBookingTopic, toLocale } from '#shared/types/booking'
import type { AdminBooking } from '#shared/types/booking'
import type { BookingRow } from '../../utils/db'

const HTTP_UNAUTHORIZED = 401

/** Map a stored row to the API shape, narrowing the columns the database keeps as plain text. */
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
    archivedAt: row.archived_at,
  }
}

export default defineEventHandler(async (event): Promise<{ bookings: AdminBooking[] }> => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)
  const key = String(query.key ?? '')

  if (!config.adminKey || key !== config.adminKey) {
    throw createError({ statusCode: HTTP_UNAUTHORIZED, statusMessage: 'unauthorized' })
  }

  const db = await useDatabase(config.databaseUrl)
  const rows = await listBookings(db, { includeArchived: query.archived === '1' })
  return { bookings: rows.map(toAdminBooking) }
})
