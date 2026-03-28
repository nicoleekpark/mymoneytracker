---
globs: ["src/core/domain/**/*.ts"]
---

# Domain Layer Rules

**CRITICAL**: Domain is pure. Never import from:
- `infrastructure/`
- `core/services/`
- `expo-sqlite`
- Any I/O or external service

Allowed imports:
- Other `core/domain/` files
- Standard library (Date, Math, etc.)
- `uuid` for ID generation
- `zod` for schema definitions

File conventions:
- `*.types.ts` - Type definitions only
- `*.model.ts` - Domain models, factories, validation
- `*.schema.ts` - Zod schemas for runtime validation
- `*.repository.ts` - Interface definitions (NOT implementations)
- `*.constants.ts` - Constants and magic strings

**Note:** Services (business logic that calls repositories) live in `core/services/`, not `core/domain/`.

Repository interfaces define WHAT, not HOW:
```tsx
// Good - interface only
export interface AccountRepository {
  listActive(): Account[]
  getById(id: UUID): Account | null
}

// Bad - implementation details
import { db } from '@/infrastructure/db'  // NEVER
```
