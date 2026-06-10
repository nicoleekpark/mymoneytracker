# MyMoneyTracker Architecture Overview

> Comprehensive technical documentation of the MyMoneyTracker codebase architecture

---

## 1. High-Level Architecture

MyMoneyTracker is a cross-platform personal finance application built on **Clean Architecture** principles with explicit layer separation:

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│         Expo Router Screens + Feature Components         │
│        (Thin orchestrators, minimal business logic)      │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                  FEATURES LAYER                          │
│  Feature-specific components, hooks, and business logic  │
│     (dashboard, transactions, price-tracker, etc.)       │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                   DOMAIN LAYER (Pure)                    │
│         Business logic, types, repository interfaces     │
│  ✓ NO external dependencies (NO infrastructure imports)  │
│  ✓ NO side effects beyond pure computation               │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│              INFRASTRUCTURE LAYER                        │
│   Repositories, Mappers, Database, DataSource            │
│       (SQLite implementation, schema migrations)         │
└─────────────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│           CROSS-CUTTING CONCERNS                         │
│ Zustand stores, Theme/Colors, Config, Shared utilities   │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Pattern

```
User Interaction (Screen)
    ↓
Feature Hook (useMonthlySummary)
    ↓
Domain Use-Case (getMonthlySummaryDollar)
    ↓
Repository Interface (TransactionRepository)
    ↓
Repository Implementation (SqliteTransactionRepository)
    ↓
DataSource Abstraction (DataSource)
    ↓
SQLite via expo-sqlite
    ↓
Mapper (transactionToRow / rowToTransaction)
    ↓
Domain Model ← UI Display
```

---

## 2. Directory Structure

### `/src/app` - Expo Router Screens
- **File-based routing** following Expo Router conventions
- Thin orchestrators that compose features
- Layout trees: `(tabs)/`, `(modal)/`, root `_layout.tsx`

### `/src/features` - Feature Modules
- **dashboard/** - Monthly/yearly/all-time views, insights, accounts, assets
- **transactions/** - Transaction list, add/edit operations
- **price-tracker/** - Price tracking and item cost history
- **notifications/** - Notification UI and triggers

### `/src/core/domain` - Pure Business Logic
**CRITICAL**: Domain NEVER imports from infrastructure

- **transaction/** - Types, repository interface, model, schemas
- **account/** - Account management
- **category/** - Category hierarchy
- **asset/** - Asset tracking
- **price-tracker/** - Price point tracking
- **notification/** - Notification logic
- **draft/** - Draft transaction types and interfaces
- **tag/** - Tag types and schemas
- **common/** - UUID, money utilities

### `/src/core/services` - Application Services
Business logic that orchestrates domain + infrastructure:

- **transaction/** - CRUD, aggregations, insights, projections
- **account/** - Account queries
- **asset/** - Asset summaries, goals
- **category/** - Category resolution
- **notification/** - Notification generation
- **price-tracker/** - Price tracking operations

### `/src/infrastructure` - Database and I/O
- **db/** - DataSource, migrations, SQLite wrapper
- **repositories/** - SQLite implementations
- **mappers/** - Row ↔ Domain conversions

### `/src/shared` - Cross-Feature Code
- **components/** - Reusable UI primitives
- **hooks/** - Shared React hooks
- **layout/** - Screen wrappers
- **format/** - Formatting utilities

### `/src/shared/store` - Zustand State
- One store per concern (drafts, notifications, theme, settings, etc.)
- Persistent stores sync with repositories
- Ephemeral stores for UI state only

### `/src/shared/theme` - Design System
- Semantic color tokens
- Typography, spacing, radius tokens
- Pre-composed view styles in `tokens/viewStyles.ts`

---

## 3. Design Patterns

### Repository Pattern
```typescript
// Domain defines interface
export interface TransactionRepository {
  insert(tx: Transaction): void
  list(limit?: number): Transaction[]
}

// Infrastructure implements
export class SqliteTransactionRepository implements TransactionRepository {
  insert(tx: Transaction): void {
    const row = transactionToRow(tx)
    this.dataSource.exec(INSERT_SQL, [...])
  }
}
```

### Mapper Pattern
```typescript
// DB → Domain
export function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    money: { amount: centsToDollars(row.amount_cents), currency: row.currency },
    occurredAt: new Date(row.occurred_at),
  }
}
```

### Zustand Store Pattern
```typescript
export const useDraftsStore = create<DraftsState>((set, get) => ({
  drafts: [],
  addDraft: (draft) => {
    draftRepository.insert(draft)
    set(state => ({ drafts: [draft, ...state.drafts] }))
  }
}))
```

### Color System Pattern
```typescript
// Parent creates colors
const colors: StandardViewColors = { text, textSecondary, ... }

// Pass to children
<MonthlyBody colors={colors} />
```

---

## 4. Data Layer

### Key Tables
- **transactions** - Income, expense, transfer records (amount in cents)
- **accounts** - Asset/liability accounts
- **categories** - Hierarchical category tree
- **tags** / **transaction_tags** - Flexible labels
- **transaction_drafts** - In-progress transactions
- **notifications** - Budget alerts, reminders

### Precision
- All monetary amounts stored as **INTEGER cents**
- Mappers convert cents ↔ dollars at domain boundary

### Migration System
- Time-stamped IDs (YYYYMMDDhhmmss)
- Idempotent runner with `schema_migrations` tracking
- Transactional execution

---

## 5. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Clean Architecture** | Testable domain, swappable infrastructure |
| **SQLite over AsyncStorage** | Complex queries, indexed lookups, ACID |
| **Zustand over Redux** | Minimal boilerplate, no provider nesting |
| **StyleSheet + Design Tokens** | Zero dependencies, native performance, type-safe |
| **Cents storage** | Avoid floating-point errors in financial data |

---

## 6. Technical Debt

### Accepted Trade-offs
1. **Domain imports Infrastructure** - Use-cases import repository singletons directly
   - Decision: Accepted as pragmatic for this codebase size
   - Rationale: Strict DI adds boilerplate without significant testability benefit
   - If needed later: Inject repositories as parameters to use-cases

### Low Priority
2. **No Query Builder** - SQL strings duplicated
3. **Inconsistent Exception Handling** - Mixed strategies
4. **No Input Validation Layer** - Trust form inputs
5. **No Caching** - Every render triggers DB queries
6. **Inconsistent Barrel File Exports** - Some use `export *`, others use explicit exports
   - Recommendation: Standardize on explicit exports for better API control

---

## 7. Architecture Strengths

1. Clear separation of concerns
2. Repository pattern for testability
3. Type-safe mappers
4. Feature modularity
5. Design system rigor
6. Scalable SQLite data layer
7. Cross-platform support

---

## 8. Request Flow Example

```
DashboardScreen
  ↓
useMonthlySummary(month) hook
  ↓
getMonthlySummaryDollar(month) use-case
  ↓
transactionRepository.getExpenseTotalForMonth()
  ↓
SqliteTransactionRepository → DataSource → SQLite
  ↓
Mapper: centsToDollars()
  ↓
{ expenseTotalDollar: 2500.50 } → UI
```

---

## 9. File Naming Conventions

| Pattern | Location | Example | Purpose |
|---------|----------|---------|---------|
| `*.types.ts` | `core/domain/` | `transaction.types.ts` | Type definitions |
| `*.model.ts` | `core/domain/` | `transaction.model.ts` | Factories, validation |
| `*.schema.ts` | `core/domain/` | `transaction.schema.ts` | Zod runtime validation |
| `*.repository.ts` | `core/domain/` | `transaction.repository.ts` | Interface (domain) |
| `*.service.ts` | `core/services/` | `account.service.ts` | Service functions |
| `*.aggregations.ts` | `core/services/` | `transaction.aggregations.ts` | Aggregation queries |
| `*.mapper.ts` | `infrastructure/` | `transaction.mapper.ts` | Row ↔ domain |
| `Sqlite*.ts` | `infrastructure/` | `SqliteTransactionRepository.ts` | Repository impl |
| `use*.ts` | `features/` | `useMonthlySummary.ts` | React hooks |
| `*.store.ts` | `shared/store/` | `drafts.store.ts` | Zustand stores |
| `*.styles.ts` | `features/*/shared/` | `DashboardScreen.styles.ts` | Style factories |

---

## 10. Test Structure

```
__tests__/
├── unit/
│   ├── model/        # Domain model logic tests
│   ├── services/     # Service layer tests
│   ├── store/        # Zustand store tests
│   ├── schema/       # Zod schema validation tests
│   ├── mapper/       # Row ↔ Domain conversion tests
│   ├── hooks/        # React hook tests
│   └── components/   # Component tests
├── integration/
│   ├── setup/        # Test database setup
│   └── repository/   # Repository integration tests
e2e/
└── maestro/          # Mobile E2E tests
    └── flows/        # Maestro YAML flows
```

**Current coverage:** 553 tests across 36 suites (~78% coverage)
