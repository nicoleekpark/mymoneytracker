---
globs: ["src/core/services/**/*.ts"]
---

# Application Services Layer Rules

The services layer orchestrates domain types + infrastructure repositories.

## Allowed Imports

- `@/core/domain/*` - Types, models, interfaces
- `@/infrastructure/*` - Repository implementations
- `@/shared/config/*` - App configuration
- `@/shared/utils/*` - Shared utilities (logger, uuid)

## File Conventions

- `*.service.ts` - Service functions that orchestrate business logic
- `index.ts` - Public exports for the module

## Structure

```
core/services/
├── account/
│   ├── account.service.ts    # Service functions
│   └── index.ts              # Public exports
├── asset/
├── category/
├── transaction/
├── price-tracker/
└── index.ts                  # Re-exports all modules
```

## Example Service

```tsx
// core/services/account/account.service.ts
import type { Account } from '@/core/domain/account'
import { accountRepository } from '@/infrastructure/repositories'

export function getActiveAccounts(): Account[] {
  return accountRepository.listActive()
}
```

## Import Pattern

Features should import:
- **Functions** from `@/core/services/*`
- **Types** from `@/core/domain/*`

```tsx
// In a feature file
import { getActiveAccounts } from '@/core/services/account'  // Function
import type { Account } from '@/core/domain/account'         // Type
```
