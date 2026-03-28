# Contributing Guide

> Guidelines for contributing to HoH Ledger.

---

## Development Setup

```bash
# Install dependencies
npm install

# Run with dev-client (required for SQLite)
npm run start:dev:ios

# If native modules changed, rebuild first
npm run ios:run && npm run start:dev:ios
```

See [dev-tools.md](../reference/dev-tools.md) for all available commands.

---

## Code Standards

### Architecture Rules

Follow **Clean Architecture** with 5 top-level folders:

| Folder | Purpose | Can Import From |
|--------|---------|-----------------|
| `app/` | Expo Router screens | features/, shared/ |
| `features/` | Feature-specific UI + hooks | core/, shared/ |
| `core/domain/` | Pure types, interfaces | Other domain files only |
| `core/services/` | Business logic orchestration | core/domain/, infrastructure/ |
| `infrastructure/` | SQLite, mappers, repositories | core/domain/ |
| `shared/` | Cross-feature components, hooks | core/, infrastructure/ (sparingly) |

**Critical**: `core/domain/` NEVER imports from `infrastructure/`.

### File Naming

| Layer | Pattern | Example |
|-------|---------|---------|
| Domain types | `*.types.ts` | `transaction.types.ts` |
| Domain models | `*.model.ts` | `account.model.ts` |
| Zod schemas | `*.schema.ts` | `asset.schema.ts` |
| Repository interface | `*.repository.ts` | `account.repository.ts` |
| Repository impl | `Sqlite*.ts` | `SqliteTransactionRepository.ts` |
| Mappers | `*.mapper.ts` | `asset.mapper.ts` |
| Services | `*.service.ts` | `transaction.service.ts` |

### Component Standards

Use Tamagui primitives:

```tsx
import { XStack, YStack, Text } from 'tamagui'

export function MyComponent() {
  return (
    <YStack gap="$3" padding="$4">
      <Text>Content</Text>
    </YStack>
  )
}
```

- Use `XStack`, `YStack` (not `View`)
- Use `Text` (not RN `Text`)
- Use Tamagui tokens (`$1`, `$2`, `$background`)
- Never hardcode colors or pixel values

### Design System

Follow [design-system.md](../reference/design-system.md) for:
- Color token rules (never use `textMuted`)
- Typography rules (tabular-nums for amounts)
- Pre-composed component styles

---

## Pull Request Workflow

### Before Creating a PR

1. **Run tests**
   ```bash
   npm test
   ```

2. **Check TypeScript**
   ```bash
   npx tsc --noEmit
   ```

3. **Test on device/simulator**
   ```bash
   npm run start:dev:ios
   ```

### PR Guidelines

1. **Keep PRs focused** - One feature or fix per PR
2. **Follow commit conventions** - Use clear, descriptive messages
3. **Update tests** - Add tests for new functionality
4. **Update docs** - If changing architecture or APIs

### Commit Message Format

```
<type>: <short description>

<optional body with more details>
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code restructuring
- `docs` - Documentation only
- `test` - Test additions/changes
- `chore` - Build, config changes

Examples:
```
feat: add monthly budget progress bar
fix: correct date formatting in transaction list
refactor: extract category service from repository
```

---

## Adding New Features

### 1. Domain Types First

Define types in `core/domain/`:

```typescript
// core/domain/feature/feature.types.ts
export type Feature = {
  id: UUID
  name: string
  createdAt: Date
}
```

### 2. Add Zod Schema

Add runtime validation in `core/domain/`:

```typescript
// core/domain/feature/feature.schema.ts
import { z } from 'zod'

export const FeatureSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  createdAt: z.date(),
})
```

### 3. Repository Interface

Define data access contract:

```typescript
// core/domain/feature/feature.repository.ts
export interface FeatureRepository {
  getById(id: UUID): Feature | null
  list(): Feature[]
  create(feature: Feature): void
}
```

### 4. Implement Repository

Create SQLite implementation:

```typescript
// infrastructure/repositories/SqliteFeatureRepository.ts
export class SqliteFeatureRepository implements FeatureRepository {
  // Implementation using expo-sqlite
}
```

### 5. Add Mapper

Convert between DB rows and domain models:

```typescript
// infrastructure/mappers/feature.mapper.ts
export class FeatureMapper {
  static toDomain(row: FeatureRow): Feature { ... }
  static toDatabase(model: Feature): FeatureRow { ... }
}
```

### 6. Create Service

Orchestrate domain + infrastructure:

```typescript
// core/services/feature/feature.service.ts
export function listFeatures(): Feature[] {
  return featureRepository.list()
}
```

### 7. Add Tests

See [testing.md](testing.md) for test patterns.

---

## Database Changes

### Adding a Migration

```bash
npm run db:migration:new add_feature_table
```

Edit the generated file in `src/infrastructure/db/migrations/`:

```typescript
export const migration_YYYYMMDDHHMMSS_add_feature_table = {
  id: YYYYMMDDHHMMSS,
  name: 'add_feature_table',
  up: () => {
    exec(`
      CREATE TABLE features (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `)
  }
}
```

Then regenerate the index:

```bash
npm run db:migration:regen
```

### Testing Migrations

Reset the database to test from scratch:

```bash
npm run db:reset  # Uninstalls app, clearing database
npm run start:dev:ios
```

---

## Code Review Checklist

When reviewing PRs, check:

- [ ] Follows layer architecture (no domain → infrastructure imports)
- [ ] Uses correct file naming conventions
- [ ] Includes tests for new functionality
- [ ] Uses design system tokens (no hardcoded colors)
- [ ] Uses `textSecondary` (never `textMuted`)
- [ ] Numeric amounts use `tabular-nums`
- [ ] No unnecessary abstractions

---

**Last Updated**: March 2026
