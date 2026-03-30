---
globs: ["src/infrastructure/**/*.ts"]
---

# Infrastructure Layer Rules

## Repositories

Name: `Sqlite{Entity}Repository.ts`

Implement domain interfaces:
```tsx
import { AccountRepository, Account } from '@/domain/account'
import { AccountMapper } from '../mappers/account.mapper'
import { queryAll } from '../db/sqlite'

export class SqliteAccountRepository implements AccountRepository {
  listActive(): Account[] {
    const rows = queryAll<AccountRow>(`SELECT * FROM accounts WHERE is_archived = 0`)
    return rows.map(AccountMapper.toDomain)
  }
}
```

Export singleton from `repositories/index.ts`.

## Error Handling Conventions

Repository methods follow these patterns for not-found cases:

| Method Pattern | Return Type | When Not Found | Rationale |
|----------------|-------------|----------------|-----------|
| `getById(id)` | `T \| null` | Return `null` | Caller may legitimately check for non-existent IDs |
| `getByKey(key)` | `T` | Throw `Error` | Keys are expected to exist; missing = programming error |
| `find*(...)` | `T \| null` | Return `null` | Search may not find results |
| `list*(...)` | `T[]` | Return `[]` | Empty list is valid result |

**Examples:**
```tsx
// Returns null - ID might not exist
getById(id: UUID): Account | null {
  const row = this.dataSource.queryFirst<AccountRow>(`SELECT * FROM accounts WHERE id = ?`, [id])
  return row ? rowToAccount(row) : null
}

// Throws - key must exist (e.g., from config)
getByKey(key: string): Account {
  const row = this.dataSource.queryFirst<AccountRow>(`SELECT * FROM accounts WHERE key = ?`, [key])
  if (!row) throw new Error(`Account not found for key=${key}`)
  return rowToAccount(row)
}
```

**Logging:** Use `logger.warn()` for recoverable issues (e.g., invalid JSON), `logger.error()` for unexpected failures.

## Mappers

Name: `{entity}.mapper.ts`

Two methods:
- `toDomain(row)` - DB row → domain model
- `toDatabase(model)` - domain model → DB row

Handle all type coercion here (dates, nulls, cents).

## Migrations

After creating: `npm run db:migration:regen`

Migration structure:
```tsx
export const migration_20260106121718_init = {
  id: 20260106121718,
  name: 'init',
  up: () => {
    exec(`CREATE TABLE ...`)
  }
}
```
