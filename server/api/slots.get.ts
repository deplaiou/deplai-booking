/**
 * GET /api/slots?lang=et
 *
 * Returns the bookable slots for the coming working days, marking the ones that
 * are already taken. Public, no authentication.
 */
import { buildSlotDays, TIMEZONE, WORKING_DAYS_AHEAD } from '../utils/slots'
import { findTakenSlots, useDatabase } from '../utils/db'
import { toLocale } from '#shared/types/booking'
import type { SlotsResponse } from '#shared/types/booking'

const MS_PER_DAY = 24 * 60 * 60 * 1000
/** Calendar days wide enough to cover WORKING_DAYS_AHEAD working days plus weekends. */
const LOOKAHEAD_DAYS = 21

export default defineEventHandler((event): SlotsResponse => {
  const config = useRuntimeConfig(event)
  const language = toLocale(getQuery(event).lang)

  const now = new Date()
  const until = new Date(now.getTime() + LOOKAHEAD_DAYS * MS_PER_DAY)

  const db = useDatabase(config.databasePath)
  const taken = findTakenSlots(db, now.toISOString(), until.toISOString())

  return {
    days: buildSlotDays(taken, language, now).slice(0, WORKING_DAYS_AHEAD),
    timezone: TIMEZONE,
  }
})
