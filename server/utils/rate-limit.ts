/**
 * In-memory sliding-window rate limiter.
 *
 * The demo runs as a single container, so an in-process map is enough; it resets
 * on restart, which is acceptable for abuse protection of a public demo.
 */
export const RATE_LIMIT_MAX = 5
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000

/** Drop keys whose window has expired once the map has grown past this. */
const PRUNE_THRESHOLD = 1000

const hits = new Map<string, number[]>()

/** Forget every key whose hits all fall outside the window, so the map cannot grow forever. */
function prune(now: number): void {
  for (const [key, times] of hits) {
    if (times.every(time => now - time >= RATE_LIMIT_WINDOW_MS)) hits.delete(key)
  }
}

/**
 * Record a hit and report whether the key exceeded its allowance.
 *
 * @param key Identifier to limit on, typically the client IP.
 */
export function isRateLimited(key: string): boolean {
  const now = Date.now()
  if (hits.size > PRUNE_THRESHOLD) prune(now)

  const recent = (hits.get(key) ?? []).filter(time => now - time < RATE_LIMIT_WINDOW_MS)
  recent.push(now)
  hits.set(key, recent)
  return recent.length > RATE_LIMIT_MAX
}
