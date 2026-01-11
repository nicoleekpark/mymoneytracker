import * as SQLite from 'expo-sqlite'
import { getDbName } from './config'

export const db = SQLite.openDatabaseSync(getDbName())

export function initDbPragmas() {
  exec(`PRAGMA foreign_keys = ON;`)
  exec(`PRAGMA journal_mode = WAL;`)
  exec(`PRAGMA synchronous = NORMAL;`)
  exec(`PRAGMA busy_timeout = 5000;`)
}

export function exec(sql: string, args: any[] = []) {
  const stmt = db.prepareSync(sql)
  try {
    return stmt.executeSync(args)
  } finally {
    stmt.finalizeSync()
  }
}

export function queryAll<T>(sql: string, args: any[] = []): T[] {
  const stmt = db.prepareSync(sql)
  try {
    const res = stmt.executeSync(args)
    const rows = res.getAllSync() as T[]
    return rows
  } finally {
    stmt.finalizeSync()
  }
}

export function queryFirst<T>(sql: string, args: any[] = []): T | null {
  const rows = queryAll<T>(sql, args)
  return rows[0] ?? null
}

export function withTransaction<T>(fn: () => T): T {
  exec('BEGIN;')
  try {
    const out = fn()
    exec('COMMIT;')
    return out
  } catch (e) {
    exec('ROLLBACK;')
    throw e
  }
}

export function execMany(sql: string) {
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)

  for (const s of statements) {
    exec(s + ';')
  }
}

export type DatabaseListRow = {
  seq: number
  name: string
  file: string
}

export function getMainDbFilePath(): string | null {
  const rows = queryAll<DatabaseListRow>(`PRAGMA database_list;`)
  return rows.find(r => r.name === 'main')?.file ?? null
}
