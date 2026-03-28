# ADR-0002: Clean Architecture Adoption with Repository Pattern

**Date**: 2026-01-24
**Status**: ✅ Accepted and Implemented
**Deciders**: Development Team
**Related**: See [architecture/overview.md](../overview.md) for current architecture

---

## Context

As the codebase grew organically from initial prototyping to feature-complete v1, we accumulated technical debt in code organization:

### Problems Identified

1. **Ambiguous Code Placement**:
   - Multiple component directories: `ui/components/`, `components/`, feature-specific components
   - No clear rule for where to put shared code
   - Repository implementations mixed with domain types
   - Database code scattered across `lib/db/` and domain folders

2. **Tight Coupling**:
   - Domain code directly imported SQLite utilities
   - UI components directly called database queries
   - Difficult to test business logic without database
   - Hard to swap data sources (e.g., add cloud sync later)

3. **Maintainability Issues**:
   - New developers couldn't find code easily
   - Refactoring required updating many import paths
   - No architectural guidelines for PRs

### The Decision Moment

After implementing the dashboard feature, we realized:
- Adding Year/All-time views would duplicate database logic
- Testing complex queries required full database setup
- Future v2 features (cloud sync, family sharing) would be architectural nightmares

**We needed a clear architecture before building more features.**

---

## Decision

Adopt **Clean Architecture** principles with explicit layer separation:

```
┌─────────────────────────────────────────────┐
│         Presentation Layer                  │
│  (app/, features/, shared/)                 │
│  → React components, hooks, UI logic        │
├─────────────────────────────────────────────┤
│          Domain Layer                       │
│  (domain/)                                  │
│  → Pure business logic, interfaces          │
│  → NO external dependencies                 │
├─────────────────────────────────────────────┤
│       Infrastructure Layer                  │
│  (infrastructure/)                          │
│  → Repository implementations               │
│  → Database access, mappers                 │
└─────────────────────────────────────────────┘
```

### Core Architectural Rules

#### Rule 1: Feature-First Organization
**If code is used by only one feature → `features/xyz/`**

Example:
```
✅ features/dashboard/hooks/useDashboardMonthlyData.ts
❌ shared/hooks/useDashboardMonthlyData.ts
```

#### Rule 2: Shared Code Consolidation
**If code is used by multiple features → `shared/`**

Consolidate:
- `ui/components/` + `components/` → `shared/components/`
- `ui/layout/` → `shared/layout/`
- `ui/format/` → `shared/format/`
- `hooks/` → `shared/hooks/`
- `lib/platform/` → `shared/utils/`

#### Rule 3: Pure Domain Layer
**Pure business logic with no React or I/O → `domain/`**

Domain layer contains **only**:
- `*.types.ts`: Type definitions
- `*.model.ts`: Domain models and factories
- `*.repository.ts`: Repository interfaces (NOT implementations)
- `*.usecase.ts`: Business logic operations

**Critical**: Domain NEVER imports from `infrastructure/`. Only defines interfaces.

#### Rule 4: Infrastructure for I/O
**External integrations (DB, API, file system) → `infrastructure/`**

Structure:
```
infrastructure/
├── db/                    # SQLite core utilities
│   ├── sqlite.ts
│   ├── migrate.ts
│   └── migrations/
├── repositories/          # Repository implementations
│   ├── SqliteAccountRepository.ts
│   ├── SqliteCategoryRepository.ts
│   └── SqliteTransactionRepository.ts
└── mappers/              # Data transformation
    ├── account.mapper.ts
    └── transaction.mapper.ts
```

### Repository Pattern Implementation

**Before (Coupled)**:
```typescript
// domain/account/account.repo.ts
import { db } from '@/lib/db'

export function getActiveAccounts(): Account[] {
  // Direct database access in domain layer ❌
  return db.queryAll(`SELECT * FROM accounts WHERE is_archived = 0`)
}
```

**After (Decoupled)**:
```typescript
// domain/account/account.repository.ts (Interface)
export interface AccountRepository {
  listActive(): Account[]
  getIdByKey(key: string): UUID
}

// infrastructure/repositories/SqliteAccountRepository.ts (Implementation)
export class SqliteAccountRepository implements AccountRepository {
  listActive(): Account[] {
    const rows = db.queryAll(/* SQL */)
    return rows.map(AccountMapper.toDomain)
  }

  getIdByKey(key: string): UUID {
    const row = db.queryFirst(/* SQL */)
    return row.id
  }
}

// infrastructure/repositories/index.ts (Singleton export)
export const accountRepository = new SqliteAccountRepository()
```

**Benefits**:
- Domain defines **what** data access is needed (interface)
- Infrastructure defines **how** to access data (implementation)
- Easy to mock for tests: `const mockRepo: AccountRepository = { ... }`
- Future-proof: Swap SQLite for Postgres without touching domain

### Data Mapper Pattern

Separate database representation from domain models:

```typescript
// infrastructure/mappers/transaction.mapper.ts
export class TransactionMapper {
  static toDomain(row: TransactionRow): Transaction {
    return {
      id: row.id,
      amount: row.amount_cents,  // DB stores cents, domain uses cents
      occurredAt: new Date(row.occurred_at),  // DB stores ISO string
      // ... more transformations
    }
  }

  static toDatabase(transaction: Transaction): TransactionRow {
    return {
      id: transaction.id,
      amount_cents: transaction.amount,
      occurred_at: transaction.occurredAt.toISOString(),
      // ... reverse transformation
    }
  }
}
```

**Benefits**:
- Type coercion in one place (date strings → Date objects)
- Null safety handling centralized
- Domain models stay clean of database concerns

---

## Alternatives Considered

### Alternative 1: Keep Flat Structure

**Pros**:
- No immediate refactoring work
- Familiar to current team

**Cons**:
- Technical debt compounds
- v2 features (cloud sync, multi-user) would be very hard
- New developers confused about code placement

**Verdict**: ❌ Short-term gain, long-term pain

---

### Alternative 2: Full DDD with Aggregates

**Example**:
```
domain/
├── aggregates/
│   ├── Transaction/
│   │   ├── Transaction.ts       # Aggregate root
│   │   ├── TransactionService.ts
│   │   └── TransactionRepository.ts
│   └── Account/
└── value-objects/
```

**Pros**:
- Very clean domain modeling
- Enforces business invariants

**Cons**:
- Overkill for small app (87 files currently)
- Steep learning curve
- Slower development velocity

**Verdict**: ❌ Over-engineered for v1 scope

---

### Alternative 3: Hexagonal Architecture (Ports & Adapters)

**Example**:
```
src/
├── application/    # Use cases
├── domain/         # Pure domain
├── adapters/
│   ├── driving/    # UI/HTTP
│   └── driven/     # DB/External APIs
└── ports/          # Interfaces
```

**Pros**:
- Extremely testable
- Very clear boundaries

**Cons**:
- More directories = more navigation
- Naming is confusing ("ports" vs. "adapters")

**Verdict**: ❌ Conceptually similar to our decision, but more complex naming

---

## Consequences

### Positive

✅ **Clear Code Placement Rules**:
- No more "where do I put this component?" questions
- PR reviews can enforce rules

✅ **Testability**:
- Domain logic can be tested without database
- Repository interfaces easy to mock
- Future: Add Jest, test use cases in isolation

✅ **Future-Proof for v2**:
- Cloud sync: Create `CloudTransactionRepository` alongside `SqliteTransactionRepository`
- Multi-user: Repository interface doesn't change, implementation adds user filtering
- Easy to add caching layer without touching domain

✅ **Onboarding**:
- New developers understand structure in < 1 hour
- Documented in CLAUDE.md

### Negative

⚠️ **One-Time Refactoring Cost**:
- 87 files modified
- All import paths updated
- Took 1 full day
- Required careful testing

⚠️ **More Boilerplate**:
- Each entity needs: interface + implementation + mapper
- Repository pattern adds ~3 files per entity vs. 1 file before

⚠️ **Learning Curve**:
- Team needs to understand Clean Architecture principles
- Requires discipline to not shortcut (e.g., importing infrastructure in domain)

### Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Developers bypass architecture | Add ESLint rule: domain can't import infrastructure |
| Boilerplate slows development | Create templates/snippets for new entities |
| Over-abstraction paralysis | Document "when to abstract" guidelines |

---

## Implementation Details

### Migration Checklist (Completed)

- [x] Create `infrastructure/` directory structure
- [x] Move `lib/db/` → `infrastructure/db/`
- [x] Consolidate `ui/` + `components/` → `shared/`
- [x] Extract repository interfaces to `domain/*/*.repository.ts`
- [x] Create repository implementations in `infrastructure/repositories/`
- [x] Create data mappers in `infrastructure/mappers/`
- [x] Update all imports (used find-and-replace + manual verification)
- [x] Update `CLAUDE.md` with new architecture rules
- [x] Test all features: Dashboard, Transactions, Add Transaction
- [x] Verify builds: iOS, Android, Web

### Verification

**Build Verification**:
```bash
# TypeScript compilation
npx tsc --noEmit  # ✅ No errors

# Expo build
npx expo export --platform ios  # ✅ Success

# Run on simulator
npm run start:dev:ios  # ✅ App runs without errors
```

**Functional Testing**:
- ✅ Dashboard loads monthly data correctly
- ✅ Transactions list displays all transactions
- ✅ Add transaction modal saves successfully
- ✅ Period navigation works
- ✅ Category breakdown renders

**No regressions detected.**

---

## Metrics

### Code Organization Improvement

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Component directories** | 3 | 1 | -67% confusion |
| **DB access files** | 12 (scattered) | 12 (centralized) | 100% in `infrastructure/db/` |
| **Repository files** | 3 (mixed) | 9 (separated) | 3 interfaces + 3 implementations + 3 mappers |
| **Import path length** | Avg 45 chars | Avg 42 chars | Slightly shorter |

### Developer Experience

**Anecdotal Feedback** (internal team):
- "I now know exactly where to put new code" ✅
- "Repository pattern makes testing easier" ✅
- "More files to create per entity, but worth it" ⚠️

---

## Future Considerations

### Immediate (v1)

1. **Add ESLint Rule**:
   ```javascript
   // .eslintrc.js
   rules: {
     'no-restricted-imports': ['error', {
       patterns: [{
         group: ['**/infrastructure/*'],
         message: 'Domain layer cannot import from infrastructure'
       }]
     }]
   }
   ```

2. **Create Entity Templates**:
   ```bash
   # Script to scaffold new entity
   npm run create-entity Account
   # Creates:
   # - domain/account/account.types.ts
   # - domain/account/account.repository.ts
   # - domain/account/account.usecase.ts
   # - infrastructure/repositories/SqliteAccountRepository.ts
   # - infrastructure/mappers/account.mapper.ts
   ```

### v2 Readiness

This architecture directly enables v2 features:

**Cloud Sync**:
```typescript
// infrastructure/repositories/HybridTransactionRepository.ts
export class HybridTransactionRepository implements TransactionRepository {
  constructor(
    private local: SqliteTransactionRepository,
    private cloud: CloudTransactionRepository
  ) {}

  async create(tx: Transaction) {
    await this.local.create(tx)  // Always write local first
    await this.cloud.sync(tx)     // Then sync to cloud
  }
}
```

**Caching**:
```typescript
// infrastructure/repositories/CachedTransactionRepository.ts
export class CachedTransactionRepository implements TransactionRepository {
  constructor(
    private inner: TransactionRepository,
    private cache: Cache
  ) {}

  listByMonth(month: string) {
    const cached = this.cache.get(month)
    if (cached) return cached

    const result = this.inner.listByMonth(month)
    this.cache.set(month, result)
    return result
  }
}
```

**Multi-Tenancy (Families)**:
```typescript
// infrastructure/repositories/MultiTenantTransactionRepository.ts
export class MultiTenantTransactionRepository implements TransactionRepository {
  constructor(
    private inner: TransactionRepository,
    private userContext: UserContext
  ) {}

  listByMonth(month: string) {
    // Automatically filter by current user's family
    return this.inner.listByMonth(month)
      .filter(tx => tx.familyId === this.userContext.familyId)
  }
}
```

---

## Related Decisions

- **ADR-0001**: Repository Documentation Strategy (how we document architecture)
- **ADR-0003**: Sync & Offline Strategy (future, when we add cloud sync)

---

## References

- **Clean Architecture** by Robert C. Martin
- **Domain-Driven Design** by Eric Evans
- **Implementation PR**: TBD (commit: 3dd6ad2)
- **Detailed Migration Doc**: `/src/docs/legacy_doc/v1/2026-01-24_folder-structure-consolidation.md`

---

## Conclusion

This architectural refactoring was **high-value, low-risk**:
- Zero user-facing changes (pure internal refactor)
- Significant maintainability improvement
- Sets foundation for v2 features
- One day of work, months of future benefits

**Status**: ✅ Fully implemented and verified

**Recommendation**: All new features must follow this architecture. Any deviations require ADR discussion.
