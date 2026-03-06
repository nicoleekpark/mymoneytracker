---
globs: ["src/domain/**/*.ts"]
---

# Domain Layer Rules

**CRITICAL**: Domain is pure. Never import from:
- `infrastructure/`
- `expo-sqlite`
- Any I/O or external service

Allowed imports:
- Other `domain/` files
- Standard library (Date, Math, etc.)
- `uuid` for ID generation

File conventions:
- `*.types.ts` - Type definitions only
- `*.model.ts` - Domain models, factories, validation
- `*.repository.ts` - Interface definitions (NOT implementations)
- `*.usecase.ts` - Business logic operations

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
