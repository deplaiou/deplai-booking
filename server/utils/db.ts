/**
 * SQLite storage for the booking demo.
 *
 * One small file on a persistent volume — no separate database server. The
 * connection is opened lazily on first use and reused for the process lifetime.
 */
import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

let connection: Database.Database | null = null

/** Row shape as stored in the `bookings` table. */
export interface BookingRow {
  id: number
  reference: string
  starts_at: string
  name: string
  email: string
  topic: string
  notes: string | null
  language: string
  created_at: string
  client_ip: string | null
}

/**
 * Return the shared database connection, creating the file and schema on first call.
 *
 * @param path Absolute or relative path to the SQLite file.
 */
export function useDatabase(path: string): Database.Database {
  if (connection) return connection

  mkdirSync(dirname(path), { recursive: true })
  connection = new Database(path)

  // WAL keeps reads fast while a booking is being written.
  connection.pragma('journal_mode = WAL')

  connection.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      reference  TEXT    NOT NULL UNIQUE,
      starts_at  TEXT    NOT NULL UNIQUE,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL,
      topic      TEXT    NOT NULL,
      notes      TEXT,
      language   TEXT    NOT NULL DEFAULT 'et',
      created_at TEXT    NOT NULL,
      client_ip  TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_bookings_starts_at ON bookings (starts_at);
  `)

  return connection
}

/** Return the ISO start times of all slots that are already taken within a range. */
export function findTakenSlots(db: Database.Database, fromIso: string, toIso: string): string[] {
  const rows = db
    .prepare('SELECT starts_at FROM bookings WHERE starts_at >= ? AND starts_at < ?')
    .all(fromIso, toIso) as Array<{ starts_at: string }>
  return rows.map(row => row.starts_at)
}

/**
 * Insert a booking.
 *
 * @throws Error with code 'SQLITE_CONSTRAINT_UNIQUE' when the slot was taken in the meantime.
 */
export function insertBooking(db: Database.Database, booking: Omit<BookingRow, 'id'>): number {
  const result = db
    .prepare(
      `INSERT INTO bookings (reference, starts_at, name, email, topic, notes, language, created_at, client_ip)
       VALUES (@reference, @starts_at, @name, @email, @topic, @notes, @language, @created_at, @client_ip)`,
    )
    .run(booking)
  return Number(result.lastInsertRowid)
}

/** Return bookings ordered by meeting time — the order the owner wants to see. */
export function listBookings(db: Database.Database, limit = 200): BookingRow[] {
  return db.prepare('SELECT * FROM bookings ORDER BY starts_at ASC LIMIT ?').all(limit) as BookingRow[]
}

/** Delete every booking. Used by the nightly demo reset. */
export function deleteAllBookings(db: Database.Database): number {
  return db.prepare('DELETE FROM bookings').run().changes
}
