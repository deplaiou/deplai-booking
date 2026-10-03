/**
 * Scheduled task: archive demo bookings every night at 03:00 UTC.
 *
 * Frees every slot so visitors can book freely without filling the calendar
 * permanently. Rows are archived, not deleted: the owner still sees them in /admin. Disabled by setting RESET_ENABLED=false, which is what
 * you do when the same app is used for real meetings.
 */
import { archiveActiveBookings, useDatabase } from '../../utils/db'

export default defineTask({
  meta: {
    name: 'demo:reset',
    description: 'Archive all live demo bookings',
  },
  async run() {
    const config = useRuntimeConfig()
    if (!config.resetEnabled) {
      return { result: 'skipped: RESET_ENABLED=false' }
    }
    const archived = await archiveActiveBookings(await useDatabase(config.databaseUrl))
    console.info(JSON.stringify({ task: 'demo:reset', archived, at: new Date().toISOString() }))
    return { result: `archived ${archived} bookings` }
  },
})
