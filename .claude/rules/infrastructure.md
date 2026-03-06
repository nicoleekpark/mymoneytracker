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
