import { MIGRATIONS } from '@/lib/db/migrations'
import { exec, queryAll, withTransaction } from '@/lib/db/sqlite'

function hasColumn(table: string, column: string): boolean {
  const rows = queryAll<{ name: string }>(`PRAGMA table_info(${table});`)
  return rows.some(r => r.name === column)
}


function ensureMigrationsTable() {
  // 테이블이 없으면 새로 만들기
  exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `)

  // if an older/legacy table exists, upgrade it safely
  if (!hasColumn('schema_migrations', 'name')) {
    exec(`ALTER TABLE schema_migrations ADD COLUMN name TEXT;`)
    exec(`UPDATE schema_migrations SET name = 'legacy' WHERE name IS NULL;`)
  }
  
  if (!hasColumn('schema_migrations', 'applied_at')) {
    exec(`ALTER TABLE schema_migrations ADD COLUMN applied_at TEXT;`)
    exec(
      `UPDATE schema_migrations SET applied_at = ? WHERE applied_at IS NULL;`,
      [new Date().toISOString()]
    )
  }
}

export function migrate(): void {
  ensureMigrationsTable()

  const applied = new Set(
    queryAll<{ id: number }>(`SELECT id FROM schema_migrations`).map(r => r.id)
  )

  // safety: ensure sorted
  const ordered = [...MIGRATIONS].sort((a, b) => a.id - b.id)

  for (const m of ordered) {
    if (applied.has(m.id)) continue

    withTransaction(() => {
      m.up()
      exec(
        `INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)`,
        [m.id, m.name, new Date().toISOString()]
      )
    })
  }
}
