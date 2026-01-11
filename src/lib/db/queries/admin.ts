import { exec, queryAll, queryFirst } from '@/lib/db/sqlite'

type TableRow = { name: string }

function listUserTables(): string[] {
  const rows = queryAll<TableRow>(`
    SELECT name
    FROM sqlite_master
    WHERE type='table'
      AND name NOT LIKE 'sqlite_%'
  `)

  return rows.map(r => r.name)
}

function sqliteSequenceExists(): boolean {
  const row = queryFirst<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'`
  )
  return !!row
}

// keep schema, reset data only
export function resetDbDataOnly(opts?: { resetAutoIncrement?: boolean }): void {
  const resetAutoIncrement = opts?.resetAutoIncrement ?? false
  const tables = listUserTables()

  exec('PRAGMA foreign_keys=OFF')
  exec('BEGIN')

  try {
    for (const t of tables) {
      exec(`DELETE FROM "${t}"`)
    }

    if (resetAutoIncrement) {
      exec(`DELETE FROM sqlite_sequence`)
    }

    exec('COMMIT')
  } catch (e) {
    exec('ROLLBACK')
    throw e
  } finally {
    exec('PRAGMA foreign_keys=ON')
  }
}

// drop all tables - migration needs to happen
export function resetDbHardDropAllTables(): void {
  const tables = listUserTables()

  exec('PRAGMA foreign_keys=OFF')
  exec('BEGIN')

  try {
    for (const t of tables) {
      exec(`DROP TABLE IF EXISTS "${t}"`)
    }
    exec('COMMIT')
  } catch (e) {
    exec('ROLLBACK')
    throw e
  } finally {
    exec('PRAGMA foreign_keys=ON')
  }
}

export function seedDbMinimal(): void {
  // TODO: seed categories/accounts/transactions
  return
}

export function countRows(table: string): number {
  const row = queryFirst<{ n: number }>(`SELECT COUNT(*) as n FROM "${table}"`)
  return row?.n ?? 0
}

export function listTables(): string[] {
  return listUserTables()
}
