/**
 * Scheduled task: wipe demo bookings every night at 03:00 UTC.
 *
 * Keeps the public demo clean and lets visitors book freely without filling the
 * calendar permanently. Disabled by setting RESET_ENABLED=false, which is what
 * you do when the same app is used for real meetings.
 */
import { deleteAllBookings, useDatabase } from '../../utils/db'

export default defineTask({
  meta: {
    name: 'demo:reset',
    description: 'Delete all demo bookings',
  },
  run() {
    const config = useRuntimeConfig()
    if (!config.resetEnabled) {
      return { result: 'skipped: RESET_ENABLED=false' }
    }
    const removed = deleteAllBookings(useDatabase(config.databasePath))
    console.info(JSON.stringify({ task: 'demo:reset', removed, at: new Date().toISOString() }))
    return { result: `deleted ${removed} bookings` }
  },
})
