import * as SQLite from 'expo-sqlite'

const db = SQLite.openDatabaseSync('hoh_finance.db')

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
  const stmt = db.prepareSync(sql)
  try {
    const res = stmt.executeSync(args)
    const rows = res.getAllSync() as T[]
    return rows[0] ?? null
  } finally {
    stmt.finalizeSync()
  }
}

export type DatabaseListRow = {
  seq: number
  name: string
  file: string
}

export function getMainDbFilePath(): string | null {
  const rows = queryAll<DatabaseListRow>(`PRAGMA database_list;`)
  const main = rows.find(r => r.name === 'main')
  return main?.file ?? null
}
