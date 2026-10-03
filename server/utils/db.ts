/**
 * MySQL/MariaDB storage for the booking demo.
 *
 * Bookings are never deleted: the nightly reset archives them (`archived_at`), so the
 * slot frees up while the row stays for the owner. The connection pool is created
 * lazily on first use and the table on first query, so a fresh database needs no setup.
 */
import mysql from 'mysql2/promise'
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise'

/** Row shape as the rest of the server sees it; times are UTC ISO strings. */
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
  archived_at: string | null
}

/** Thrown by `insertBooking` when another live booking already holds the slot. */
export class SlotTakenError extends Error {
  constructor() {
    super('slot_taken')
  }
}

/** Unique key that holds a slot for live bookings only; matched in duplicate-key errors. */
const ACTIVE_SLOT_KEY = 'uq_bookings_active_slot'

/*
 * Double booking is prevented by the database, not by application logic.
 * `active_starts_at` equals `starts_at` while the booking is live and NULL once it is
 * archived; UNIQUE ignores NULLs, so any number of archived rows may share a time,
 * but only one live booking can hold it.
 */
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS bookings (
    id               INT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
    reference        VARCHAR(16)   NOT NULL,
    starts_at        DATETIME(3)   NOT NULL,
    name             VARCHAR(120)  NOT NULL,
    email            VARCHAR(254)  NOT NULL,
    topic            VARCHAR(32)   NOT NULL,
    notes            TEXT          NULL,
    language         CHAR(2)       NOT NULL DEFAULT 'et',
    created_at       DATETIME(3)   NOT NULL,
    client_ip        VARCHAR(45)   NULL,
    archived_at      DATETIME(3)   NULL,
    active_starts_at DATETIME(3)   AS (IF(archived_at IS NULL, starts_at, NULL)) STORED,
    UNIQUE KEY uq_bookings_reference (reference),
    UNIQUE KEY ${ACTIVE_SLOT_KEY} (active_starts_at),
    KEY idx_bookings_starts_at (starts_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`

let pool: Pool | null = null
let schemaReady: Promise<void> | null = null

/**
 * Return the shared pool, creating the `bookings` table on first call.
 *
 * @param url Connection URL, e.g. mysql://user:password@host:3306/database
 */
export async function useDatabase(url: string): Promise<Pool> {
  if (!url) {
    throw new Error('NUXT_DATABASE_URL is not set')
  }
  // Dates are written and read as UTC, whatever the server's own time zone is.
  pool ??= mysql.createPool({ uri: url, timezone: 'Z', connectionLimit: 5 })
  schemaReady ??= pool.query(SCHEMA).then(() => undefined, (error: unknown) => {
    schemaReady = null // retry on the next request instead of failing forever
    throw error
  })
  await schemaReady
  return pool
}

/** MySQL returns DATETIME as Date; the app passes times around as ISO strings. */
function toIso(value: Date): string
function toIso(value: Date | null): string | null
function toIso(value: Date | null): string | null {
  return value === null ? null : value.toISOString()
}

type StoredRow = RowDataPacket & Omit<BookingRow, 'starts_at' | 'created_at' | 'archived_at'> & {
  starts_at: Date
  created_at: Date
  archived_at: Date | null
}

function fromStored(row: StoredRow): BookingRow {
  return {
    id: row.id,
    reference: row.reference,
    starts_at: toIso(row.starts_at),
    name: row.name,
    email: row.email,
    topic: row.topic,
    notes: row.notes,
    language: row.language,
    created_at: toIso(row.created_at),
    client_ip: row.client_ip,
    archived_at: toIso(row.archived_at),
  }
}

/** Return the ISO start times of live bookings within a range. */
export async function findTakenSlots(db: Pool, fromIso: string, toIso: string): Promise<string[]> {
  const [rows] = await db.query<Array<RowDataPacket & { starts_at: Date }>>(
    'SELECT starts_at FROM bookings WHERE archived_at IS NULL AND starts_at >= ? AND starts_at < ?',
    [new Date(fromIso), new Date(toIso)],
  )
  return rows.map(row => row.starts_at.toISOString())
}

/**
 * Insert a booking.
 *
 * @throws SlotTakenError when a live booking took the slot in the meantime.
 */
export async function insertBooking(db: Pool, booking: Omit<BookingRow, 'id' | 'archived_at'>): Promise<number> {
  try {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO bookings (reference, starts_at, name, email, topic, notes, language, created_at, client_ip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        booking.reference,
        new Date(booking.starts_at),
        booking.name,
        booking.email,
        booking.topic,
        booking.notes,
        booking.language,
        new Date(booking.created_at),
        booking.client_ip,
      ],
    )
    return result.insertId
  } catch (error) {
    const { code, message } = error as { code?: string; message?: string }
    if (code === 'ER_DUP_ENTRY' && message?.includes(ACTIVE_SLOT_KEY)) {
      throw new SlotTakenError()
    }
    throw error
  }
}

/**
 * Return bookings for the owner: live ones first in meeting order, then (when asked)
 * archived ones, newest meeting first.
 */
export async function listBookings(db: Pool, { includeArchived = false, limit = 200 } = {}): Promise<BookingRow[]> {
  const [rows] = await db.query<StoredRow[]>(
    `SELECT * FROM bookings
     ${includeArchived ? '' : 'WHERE archived_at IS NULL'}
     ORDER BY archived_at IS NOT NULL,
              CASE WHEN archived_at IS NULL THEN starts_at END ASC,
              starts_at DESC
     LIMIT ?`,
    [limit],
  )
  return rows.map(fromStored)
}

/** Archive every live booking, freeing its slot. Used by the nightly demo reset. */
export async function archiveActiveBookings(db: Pool): Promise<number> {
  const [result] = await db.execute<ResultSetHeader>(
    'UPDATE bookings SET archived_at = ? WHERE archived_at IS NULL',
    [new Date()],
  )
  return result.affectedRows
}
