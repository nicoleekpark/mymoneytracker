import { exec, queryAll } from '@/lib/db/sqlite';

type Migration = { id: number; up: () => void }

const migrations: Migration[] = [
  {
    id: 1,
    up: () => {
      exec(`PRAGMA journal_mode = WAL;`)
      exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id INTEGER PRIMARY KEY NOT NULL
        );
      `)
    },
  },
  {
    id: 2,
    up: () => {
      exec(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY NOT NULL,
          occurred_at TEXT NOT NULL,
          type TEXT NOT NULL,
          amount REAL NOT NULL,
          currency TEXT NOT NULL,
          memo TEXT
        );
      `)

      exec(`
        CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at
        ON transactions(occurred_at);
      `)
    },
  },
]

export function migrate() {
  exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY NOT NULL
    );
  `)

  const applied = new Set(
    queryAll<{ id: number }>(`SELECT id FROM schema_migrations`).map((r) => r.id)
  )

  for (const m of migrations) {
    if (!applied.has(m.id)) {
      m.up()
      exec(`INSERT INTO schema_migrations (id) VALUES (?)`, [m.id])
    }
  }
}
