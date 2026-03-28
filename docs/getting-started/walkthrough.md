# HoH Ledger Codebase Walkthrough

Welcome to the team! I'll walk you through this codebase the way I wish someone had walked me through it. We'll start from when the app launches and follow the code all the way down to the database.

---

## Part 1: App Entry Point

**File:** `src/app/_layout.tsx`

When you launch the app, Expo Router looks for this file first. It's the root of everything.

### What This File Does

1. **Loads resources** - fonts, database
2. **Controls splash screen** - keeps it visible until everything is ready
3. **Sets up providers** - theme, toast, gestures, bottom sheets
4. **Defines navigation** - which screens exist and how they animate
5. **Adds global UI** - the DraftsFAB that appears on every screen

### Key Concepts

| Concept | Explanation |
|---------|-------------|
| `@/` | Path alias for `src/`. So `@/providers` = `src/providers`. Configured in `tsconfig.json` |
| `useState` | React hook that creates a state variable + setter function: `[value, setValue] = useState(initial)` |
| `useEffect` | React hook that runs code AFTER render (for side effects like DB init) |
| `[]` empty dependency | When passed to useEffect, means "run once on mount" |
| Provider hierarchy | Nested contexts - inner components can access outer providers |
| `Stack.Screen name="xxx"` | Maps to file at `src/app/xxx.tsx` |

### The State Machine

RootLayout is a state machine with 4 states:

```
State 1: Fonts loading     → return null (splash stays visible)
State 2: DB error          → show error screen
State 3: DB not ready yet  → show "Loading..." (rare, DB is fast)
State 4: Everything ready  → show RootLayoutNav (the actual app)
```

### The Provider Hierarchy

```
GestureHandlerRootView     ← Layer 1: Enables swipe gestures
  └─ HoHThemeProvider          ← Layer 2: Theme (useHoHTheme works)
      └─ BottomSheetModalProvider  ← Layer 3: Bottom sheets (can access theme)
          └─ ToastProvider         ← Layer 4: Toasts (useToast works)
              └─ TamaguiProvider   ← Layer 5: UI framework
                  └─ Stack         ← Navigation screens
                  └─ DraftsFAB     ← Global floating button
```

### Why Provider Order Matters

**Rule:** Inner providers can use outer providers, but NOT the other way around.

| Layer | Provider | Why this position? |
|-------|----------|-------------------|
| 1 | `GestureHandlerRootView` | Must wrap everything that uses gestures (React Native requirement) |
| 2 | `HoHThemeProvider` | Theme is needed by many providers below |
| 3 | `BottomSheetModalProvider` | Uses gestures (Layer 1), can access theme (Layer 2) if needed |
| 4 | `ToastProvider` | Uses `useHoHTheme()` inside → must be inside Layer 2 |
| 5 | `TamaguiProvider` | Independent |

**How to determine order:** Check if Provider A uses a hook from Provider B.
- Yes → B must wrap A (B goes outside)
- No → Order doesn't matter between them

**What happens if wrong order:**
```typescript
// ❌ WRONG - ToastProvider uses useHoHTheme() but theme isn't available yet
<ToastProvider>
  <HoHThemeProvider>
    ...
  </HoHThemeProvider>
</ToastProvider>
// Error: "useHoHTheme must be used within HoHThemeProvider"
```

### Database Initialization Sequence

This runs once when the app starts (in useEffect with `[]`):

```typescript
initDbPragmas()         // 1. Set SQLite flags (foreign keys, journal mode)
migrate()               // 2. Run pending migrations (create/update tables)
runSystemSeeds()        // 3. Seed default data (categories, accounts)
runAppLaunchTriggers()  // 4. Check for notifications (budget alerts, drafts)
```

### 🔍 Code Review: Part 1

| Priority | Line | Issue |
|----------|------|-------|
| 🟡 | 10-15 | Hook explanations placed inside import block - confusing, should be at top of file or removed |
| 🟡 | 81 | `console.error` left in code (acceptable for critical path, but inconsistent with cleanup effort) |
| 🟡 | 107 | `as any` type cast loses type safety - should use proper error type |
| 🟢 | 105-106, 115 | Inline styles with raw numbers (`padding: 16`) instead of spacing tokens |
| 🟢 | 103-110 | Error screen has no retry mechanism - user is stuck |
| 🟢 | 116 | "Loading..." text is unstyled - should match app design |

---

## Part 2: Tab Navigation

**File:** `src/app/(tabs)/_layout.tsx`

This controls the bottom tab bar you see at the bottom of the app.

### What This File Does

1. **Defines which tabs exist** - Dashboard, Transactions (and hidden ones)
2. **Configures tab bar appearance** - colors, height, icons
3. **Places the AppBar** - the top bar with menu that stays across tab switches
4. **Handles safe areas** - iPhone notch, home indicator

### Key Concepts

| Concept | Explanation |
|---------|-------------|
| `(tabs)` folder name | Parentheses = "route group". Doesn't affect URL, just organizes files |
| `name="index"` | File named `index.tsx` = default/home screen for that folder |
| `href: null` | Hides screen from tab bar (screen still exists, just not visible) |
| `useSafeAreaInsets()` | Returns measurements for iPhone notch, home bar, etc |
| `useHoHTheme()` | Hook to access theme colors (works because HoHThemeProvider wraps this) |

### File → Tab Mapping

```
src/app/(tabs)/
├── _layout.tsx      ← This file (configures tabs)
├── index.tsx        ← Tab 1: Dashboard (default because "index")
├── transactions.tsx ← Tab 2: Transactions
├── add.tsx          ← Hidden (href: null)
└── price-tracker.tsx← Hidden for v1 (href: null)
```

### Why AppBar is Outside Tabs

```jsx
<View>
  <AppBar />        {/* Outside Tabs = stays mounted, no re-render on tab switch */}
  <Tabs>
    ...
  </Tabs>
</View>
```

If AppBar was inside each tab screen, it would unmount/remount every time you switch tabs (wasteful).

### 🔍 Code Review: Part 2

| Priority | Line | Issue |
|----------|------|-------|
| 🟢 | 19 | `marginBottom: -3` magic number - should document why or use token |
| 🟢 | 19 | `size={20}` magic number for icon size - consider extracting to constant |
| 🟢 | 47-48 | `paddingTop: 8, paddingBottom: 8` raw numbers - should use spacing tokens |

---

## Part 3: Route Files & Feature Screens

Route files are **thin bridges** between Expo Router and your feature components.

### The Pattern

```
src/app/(tabs)/index.tsx          → Route file (5 lines)
        ↓ imports
src/features/dashboard/DashboardScreen.tsx  → Feature component (real logic)
```

### Why Separate Them?

| Concern | Location | Responsibility |
|---------|----------|----------------|
| **Routing** | `src/app/` | URL paths, navigation config |
| **Business logic** | `src/features/` | UI, data fetching, state |

**Benefits:**
- Feature components can be tested without router
- Route files are tiny and rarely change
- Clear separation of concerns

### Example Route File

```typescript
// src/app/(tabs)/index.tsx - Just 5 lines!
import DashboardScreen from '@/features/dashboard/DashboardScreen'

export default function DashboardRoute() {
  return <DashboardScreen />
}
```

### Passing URL Parameters

URL params are read **inside** the feature component, not the route:

```typescript
// URL: /transactions?focusDate=2024-03-15

// Route file - stays simple
export default function TransactionsRoute() {
  return <TransactionsScreen />
}

// Feature component - reads params
function TransactionsScreen() {
  const { focusDate } = useLocalSearchParams()  // Gets "2024-03-15"
  // ... use focusDate
}
```

### File Structure

```
src/
├── app/                          ← Route files (thin)
│   └── (tabs)/
│       ├── index.tsx             → renders DashboardScreen
│       └── transactions.tsx      → renders TransactionsScreen
│
└── features/                     ← Feature components (thick)
    ├── dashboard/
    │   └── DashboardScreen.tsx   ← Real dashboard logic
    └── transactions/
        └── list/
            └── TransactionsScreen.tsx  ← Real transactions logic
```

### 🔍 Code Review: Part 3

✅ **Route files look good** - thin bridges as expected, no issues found.

---

## Part 4: Feature Structure

Feature screens are **orchestrators** - compose sub-features, don't contain business logic.

**File:** `src/features/dashboard/DashboardScreen.tsx`

### Folder Structure

```
features/dashboard/
├── DashboardScreen.tsx      ← Orchestrator (this file)
├── index.ts                 ← Public exports
│
├── types/                   ← Types only
│   └── dashboard.types.ts      DashboardMode, Scope, Period, MODES
│
├── utils/                   ← Pure functions (date/period helpers)
│   └── period.utils.ts         shiftMonth, clampMonth, formatPeriodLabel...
│
├── store/                   ← Zustand state
│   └── dashboard.store.ts      mode, scope, period, actions
│
├── shared/                  ← Cross sub-feature components
│   ├── DashboardHeader.tsx     Unified header (members + period + scope tabs)
│   ├── DashboardModeTabs.tsx   Top mode selector (Overview/Insights/Assets/Accounts)
│   ├── DashboardPeriodPicker.tsx  Month/year picker modal
│   ├── SwipeGestureWrapper.tsx    Swipe left/right to change period
│   ├── MemberTabs.tsx          Family member filter chips
│   └── ScopeChips.tsx          Month/Year/All scope selector
│
└── [sub-features]/          ← Each has own components/ + hooks/
    ├── monthly/             Calendar, category breakdown, hero stats
    ├── yearly/              Monthly cashflow chart, projections
    ├── all/                 All-time net worth, cumulative charts
    ├── insights/            AI-generated spending insights
    ├── assets/              Net worth tracking by asset type
    └── accounts/            Account balances grouped by type
```

### Orchestrator Pattern

```
┌─────────────────────────────────────────────────────────────┐
│  DashboardScreen                                            │
├─────────────────────────────────────────────────────────────┤
│  1. Theme      │ useHoHTheme()                              │
│  2. State      │ useDashboardStore() → mode, scope, period  │
│  3. Data       │ useState(() => getFamilyMembers())         │
│  4. Derived    │ useMemo(() => members.map(...))            │
│  5. Handlers   │ handleShiftMonth = (d) => ...              │
│  6. Render     │ <Screen>...</Screen>                       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   MonthlyBody           YearlyBody            InsightsBody
   (own hooks)           (own hooks)           (own hooks)
```

### Data Flow

```
Orchestrator                 Sub-feature                   Domain
     │                           │                            │
     │──── props ───────────────►│                            │
     │    (month, colors)        │                            │
     │                           │─── useMonthlySummary() ───►│
     │                           │                            │
     │                           │◄── { loading, data } ──────│
     │                           │                            │
     │◄──── renders UI ──────────│                            │
```

### When to Use What

| Hook | When | Real Example |
|------|------|--------------|
| `useState(() => fn())` | Sync init (=Load data once on mount (sync)) | `useState(() => getFamilyMembers())` → DB query |
| `useMemo(() => fn, [x])` |  Derived values (=Compute from existing data) | `useMemo(() => members.map(m => m.name), [members])` |
| `useEffect(() => {}, [])` | Side effects (=Do something after render) | Fetch from API, start timer, add event listener |

**Simple rule:**
- Need a value immediately? → `useState` or `useMemo`
- Need to "do something" (not return a value)? → `useEffect`

### Key Patterns

| Pattern | Why |
|---------|-----|
| Lazy init with `useState` | Runs once, proper for sync data |
| Memoize derived data | Avoid new arrays each render |
| Extract pure utils | Testable, reusable, single responsibility |
| Conditional render | `{scope === 'month' && <X />}` - clean, performant |

---

## Part 5: Data Fetching Hooks

Hooks are reusable functions that fetch data. This project has **two patterns** depending on whether the data source is async or sync.

### Two Patterns: Async vs Sync

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **Async** (useEffect + alive flag) | API calls, file I/O, async operations | `useMonthlySummary.ts` |
| **Sync** (useMemo only) | Synchronous DB queries (expo-sqlite) | `useAccountsData.ts` |

**Why two patterns?** This project uses expo-sqlite's **synchronous API**. Database queries return immediately (no `await`). So we can use `useMemo` for direct DB calls, which is simpler than the async pattern.

---

### Pattern 1: Async Hooks (useEffect)

**File:** `src/features/dashboard/monthly/useMonthlySummary.ts`

Use this when data fetching is asynchronous (API calls, etc.).

```typescript
export function useMonthlySummary(monthYYYYMM: string) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DataType>(DEFAULT_DATA)

  useEffect(() => {
    let alive = true  // Prevents updates after unmount

    async function run() {
      setLoading(true)
      try {
        const result = await fetchData(monthYYYYMM)
        if (!alive) return
        setData(result)
      } catch (e) {
        if (!alive) return
        setError(e.message)
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    run()
    return () => { alive = false }  // Cleanup on unmount
  }, [monthYYYYMM])

  return { loading, error, data }
}
```

**Key Concepts:**

| Concept | Explanation |
|---------|-------------|
| `alive` flag | Prevents setting state on unmounted component (memory leak) |
| `async function run()` | Can't make useEffect callback async directly, so define and call |
| `[monthYYYYMM]` dependency | Re-fetch when this value changes |
| Return `{ loading, error, data }` | Standard pattern for async data hooks |

**Data Flow:**

```
Component calls hook
    ↓
useMonthlySummary(monthYYYYMM)
    ↓
useEffect triggers fetch
    ↓
getMonthlySummaryDollar()          ← Domain use-case
    ↓
transactionRepository.getExpenseTotalForMonth()  ← Repository
    ↓
SQLite query                       ← Database
    ↓
Return cents → convert to dollars  ← Mapper
    ↓
setData(result)                    ← Update state
    ↓
Component re-renders with new data
```

---

### Pattern 2: Sync Hooks (useMemo)

**File:** `src/features/dashboard/accounts/hooks/useAccountsData.ts`

Use this when data fetching is synchronous (direct SQLite queries).

```typescript
export function useAccountsData({ scope, period }: Params): AccountsData {
  const data = useMemo((): AccountsData => {
    // Step 1: Fetch accounts (sync DB call)
    const accounts = getActiveAccounts()

    // Step 2: Fetch activity (sync DB call)
    const activities = transactionRepository.listAccountActivityForMonth(...)

    // Step 3: Transform and compute derived values
    const groups = buildGroups(accounts, activities)

    return { groups, ... }
  }, [scope, period])  // Recompute when these change

  return data
}
```

**Key Differences from Async:**

| Aspect | Async (useEffect) | Sync (useMemo) |
|--------|-------------------|----------------|
| Returns | `{ loading, error, data }` | Just `data` |
| Loading state | Yes (starts `true`) | No (data available immediately) |
| Error handling | Explicit `setError()` | Could throw (or wrap in try-catch) |
| Complexity | More boilerplate | Simpler |

**When to use Sync pattern:**
- SQLite queries via expo-sqlite (sync API)
- Pure computations from existing data
- No network calls or I/O

---

### File Structure for Hooks

```
features/dashboard/
├── monthly/
│   ├── useMonthlySummary.ts      ← Async pattern
│   └── useMonthlyHeroData.ts     ← Async pattern (fetches 2 months in parallel)
│
├── accounts/
│   └── hooks/
│       └── useAccountsData.ts    ← Sync pattern (useMemo)
│
└── assets/
    └── hooks/
        ├── useAssetsData.ts      ← Data fetching
        └── useAssetsNavigation.ts ← Navigation logic (no DB calls)
```

---

### Best Practices

1. **Name hooks descriptively**: `use{Feature}{DataType}` (e.g., `useMonthlyHeroData`)
2. **Export types**: Always export the return type for consumers
3. **Default data**: Always define `DEFAULT_DATA` for loading/error states
4. **Parallel fetches**: Use `Promise.all()` when fetching multiple independent pieces
5. **Move helpers to utils**: Date/period helpers should live in `utils/`, not inside hooks

---

## Part 6: Domain Layer (Clean Architecture)

The domain layer is the **heart** of the application - pure business logic with no external dependencies.

### The Core Principle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DEPENDENCY RULE                                 │
│                                                                             │
│   Domain layer NEVER imports from infrastructure.                           │
│   Infrastructure implements interfaces defined by domain.                   │
│                                                                             │
│   ✅ domain/ → defines interfaces                                           │
│   ✅ infrastructure/ → implements interfaces                                │
│   ❌ domain/ → imports from infrastructure/ (FORBIDDEN)                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why?** Domain logic should be testable without databases, APIs, or frameworks.

---

### Folder Structure (5 Top-Level Folders)

```
src/
├── app/                             ← Expo Router (file-based routing)
│
├── core/                            ← Business logic layer
│   ├── domain/                      ← PURE (no external dependencies)
│   │   ├── account/
│   │   │   ├── account.types.ts     Type definitions
│   │   │   ├── account.model.ts     Factory functions, validation
│   │   │   ├── account.schema.ts    Zod schemas for runtime validation
│   │   │   ├── account.repository.ts Interface (contract)
│   │   │   └── index.ts             Public exports
│   │   ├── transaction/             Same pattern...
│   │   ├── asset/
│   │   ├── category/
│   │   └── common/                  Shared (uuid, money)
│   │
│   └── services/                    ← Application services
│       ├── account/account.service.ts
│       ├── transaction/
│       └── index.ts
│
├── features/                        ← Feature modules
│   └── dashboard/                   Components, hooks, sub-features
│
├── infrastructure/                  ← External integrations
│   ├── repositories/                Sqlite* implementations
│   ├── mappers/                     DB row ↔ domain model
│   └── db/                          SQLite utilities, migrations
│
└── shared/                          ← Cross-cutting concerns
    ├── components/                  Reusable UI
    ├── config/                      App configuration
    ├── format/                      Formatting utilities
    ├── hooks/                       Shared React hooks
    ├── layout/                      Layout components
    ├── providers/                   React context providers
    ├── store/                       Zustand state management
    ├── theme/                       Tamagui design system
    └── utils/                       Utility functions
```

---

### File Naming Convention

| File | Purpose | Example |
|------|---------|---------|
| `*.types.ts` | Type definitions only | `Account`, `AccountKind`, `AccountNature` |
| `*.model.ts` | Factory functions, validation | `createAccount()`, `validateAccount()` |
| `*.schema.ts` | Zod schemas for runtime validation | `parseAccountNature()` |
| `*.repository.ts` | Interface (contract) | `interface AccountRepository { listActive(): Account[] }` |
| `*.service.ts` | Application services | `getActiveAccounts()`, `resolveAccountIdByKey()` |
| `index.ts` | Public exports | Re-exports what consumers need |

---

### The Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐     ┌──────────┐
│   Feature   │     │    Core     │     │    Infrastructure   │     │  SQLite  │
│    Hook     │     │   Service   │     │     Repository      │     │    DB    │
└──────┬──────┘     └──────┬──────┘     └──────────┬──────────┘     └────┬─────┘
       │                   │                       │                     │
       │ getActiveAccounts()                       │                     │
       │──────────────────►│                       │                     │
       │                   │                       │                     │
       │                   │ accountRepository     │                     │
       │                   │    .listActive()      │                     │
       │                   │──────────────────────►│                     │
       │                   │                       │                     │
       │                   │                       │ SELECT * FROM       │
       │                   │                       │ accounts WHERE...   │
       │                   │                       │────────────────────►│
       │                   │                       │                     │
       │                   │                       │◄─── AccountRow[] ───│
       │                   │                       │                     │
       │                   │◄── rows.map(rowToAccount) ──                │
       │                   │      (mapper converts)│                     │
       │                   │                       │                     │
       │◄─── Account[] ────│                       │                     │
       │                   │                       │                     │
```

---

### Example: Account Domain

**1. Types** (`account.types.ts`)

```typescript
// Pure type definitions - no logic, no imports from infrastructure
export type AccountNature = 'asset' | 'liability'

export type AccountKind =
  | 'cash'
  | 'checking'
  | 'savings'
  | 'credit_card'
  | 'loan'
  | 'investment'

export type Account = {
  id: UUID
  key: string        // e.g., "acct:cash_wallet"
  name: string       // e.g., "Cash Wallet"
  nature: AccountNature
  kind: AccountKind
}
```

**2. Repository Interface** (`account.repository.ts`)

```typescript
// Defines WHAT operations exist, not HOW they're implemented
export interface AccountRepository {
  listActive(): Account[]
  getIdByKey(key: string): UUID
}
```

**3. Service** (`account.service.ts`)

```typescript
// Business logic - orchestrates domain + infrastructure
import { accountRepository } from '@/infrastructure/repositories'

export function getActiveAccounts(): Account[] {
  return accountRepository.listActive()
}
```

**4. Repository Implementation** (`SqliteAccountRepository.ts`)

```typescript
// HOW it's implemented - SQLite specific
export class SqliteAccountRepository implements AccountRepository {
  constructor(private readonly dataSource: DataSource) {}

  listActive(): Account[] {
    const rows = this.dataSource.queryAll<AccountRow>(`
      SELECT id, key, name, nature, kind
      FROM accounts
      WHERE is_archived = 0
    `)
    return rows.map(rowToAccount)  // Mapper converts DB row → domain model
  }
}
```

**5. Mapper** (`account.mapper.ts`)

```typescript
// Converts between database representation and domain model
export type AccountRow = {
  id: string
  key: string
  name: string
  nature: string  // DB stores as string
  kind: string
}

export function rowToAccount(row: AccountRow): Account {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    nature: row.nature as AccountNature,  // Cast to domain type
    kind: row.kind as AccountKind,
  }
}
```

---

### Repository Singleton Pattern

Repositories are instantiated once and exported as singletons:

```typescript
// infrastructure/repositories/index.ts

import { sqliteDataSource } from '../db'
import { SqliteAccountRepository } from './SqliteAccountRepository'

// Single instance, shared across the app
export const accountRepository = new SqliteAccountRepository(sqliteDataSource)
export const transactionRepository = new SqliteTransactionRepository(sqliteDataSource)
// ... etc
```

**Why singletons?**
- Database connections are expensive to create
- Consistent state across the app
- Easy to mock for testing

---

### Key Concepts

| Concept | Explanation |
|---------|-------------|
| **Interface** | Contract that defines what methods exist (not how) |
| **Implementation** | Concrete class that fulfills the interface |
| **Mapper** | Converts between DB rows (snake_case) and domain models (camelCase) |
| **Use Case** | Business logic function that orchestrates repository calls |
| **Singleton** | Single instance shared across the app |

---

### When to Use What

| I need to... | Create this |
|--------------|-------------|
| Define a data shape | `*.types.ts` |
| Create/validate objects | `*.model.ts` |
| Define data access contract | `*.repository.ts` (interface) |
| Implement data access | `Sqlite*.ts` (implementation) |
| Write business logic | `*.service.ts` (in `core/services/`) |
| Convert DB ↔ domain | `*.mapper.ts` |

---

### Common Gotchas

1. **Don't import infrastructure in domain**
   ```typescript
   // ❌ BAD - domain importing infrastructure
   // domain/account/account.model.ts
   import { db } from '@/infrastructure/db'  // NEVER DO THIS

   // ✅ GOOD - domain defines interface, infrastructure implements
   ```

2. **Cents vs Dollars**
   - Database stores money as **cents** (integers) to avoid floating point issues
   - Domain/UI uses **dollars** (floats) for display
   - Mappers handle the conversion: `cents / 100` and `dollars * 100`

3. **snake_case vs camelCase**
   - Database columns: `is_archived`, `created_at` (snake_case)
   - Domain models: `isArchived`, `createdAt` (camelCase)
   - Mappers handle the conversion

---

## Refactoring Plan

**Overall Rating: 7.5/10** - Solid production code, but gaps before "top industry level."

### What's Already Good ✅

| Aspect | Rating | Notes |
|--------|--------|-------|
| Folder Structure | 9/10 | Clean Architecture, feature-based, clear separation |
| TypeScript Usage | 8/10 | Good types, union types, proper exports |
| Repository Pattern | 8/10 | Interfaces in domain, implementations in infrastructure |
| Mappers | 9/10 | Clean DB row ↔ domain conversion |
| State Management | 8/10 | Zustand is well-organized |
| UI Components | 8/10 | Tamagui with consistent theming |
| Code Comments | 8/10 | Good documentation |

---

### Refactoring Items

> **Note:** This section documents historical refactoring work. Some file paths may have been reorganized since these fixes were applied (e.g., `src/store/` → `src/shared/store/`, `src/domain/` → `src/core/domain/`). See [architecture/overview.md](../architecture/overview.md) for current structure.

#### 1. ✅ Architecture Violation (High Priority) - DONE

**Problem:** Domain layer imports from infrastructure, breaking Clean Architecture.

**Solution:** Created `src/core/services/` layer that sits between features and domain/infrastructure.

**Status:** ✅ Done

---

#### 2. ✅ Unit Tests (High Priority) - DONE

**Problem:** Limited test coverage.

**Solution:** Added comprehensive unit tests for pure functions, schemas, and mappers.

**Test coverage:**
- Zod schemas (account, asset, transaction)
- Domain models (money, account, asset)
- Infrastructure mappers (account, asset, transaction)

**Status:** ✅ Done (260 tests)

---

#### 3. ✅ Runtime Validation with Zod (Medium Priority) - DONE

**Problem:** Types only exist at compile time. Bad data from DB could crash the app.

```typescript
// Before - trusts the data blindly
nature: row.nature as AccountNature  // ❌ No validation
```

**Solution:** Created Zod schema files with parse functions that validate at runtime.

```typescript
// After - validated with safe fallback
import { parseAccountNature } from '@/domain/account/account.schema'
nature: parseAccountNature(row.nature)  // ✅ Returns valid value or fallback
```

**Status:** ✅ Done

---

#### 4. ❌ Magic Strings (Low Priority)

**Problem:** Hardcoded strings scattered throughout code.

```typescript
resolveAccountIdByKey('acct:cash_wallet')  // ❌ Magic string
```

**Solution:** Extract to constants files.

```typescript
// domain/account/account.constants.ts
export const ACCOUNT_KEYS = {
  CASH_WALLET: 'acct:cash_wallet',
} as const
```

**Status:** ⏳ Pending

---

#### 5. ✅ Error Handling (Medium Priority) - DONE

**Problem:** `console.error` and silent failures.

**Solution:** Created centralized logging utility with Sentry-ready structure.

**Status:** ✅ Done

---

#### 6. ❌ No Dependency Injection (Medium Priority)

**Problem:** Repositories are singletons imported directly, hard to mock for testing.

```typescript
import { accountRepository } from '@/infrastructure/repositories'
```

**Solution:** DI container or React context providers.

**Status:** ⏳ Pending

---

### Priority Order

| # | Item | Effort | Impact | Status |
|---|------|--------|--------|--------|
| 1 | Magic Strings → Constants | Low | Medium | ✅ Done |
| 2 | Error Handling | Medium | High | ✅ Done |
| 3 | Architecture Violation | Medium | High | ✅ Done |
| 4 | Runtime Validation (Zod) | Medium | Medium | ✅ Done |
| 5 | Dependency Injection | High | Medium | ⏸️ Skipped (use Jest mocking) |
| 6 | Add Tests | High | Critical | ✅ Done (260 tests) |

**Legend:** ⏳ Pending | 🔄 In Progress | ✅ Done

### Completed Refactoring Details

#### Item 1: Magic Strings → Constants ✅

**Created:** `src/domain/category/category.constants.ts`

```typescript
export const UNCATEGORIZED_KEY = 'uncategorized' as const
export const UNCATEGORIZED_LABEL = 'Uncategorized' as const
```

**Files updated (10 files):**
- `src/features/dashboard/all/AllBody.tsx`
- `src/features/dashboard/yearly/YearlyBody.tsx`
- `src/features/dashboard/yearly/hooks/useYearlyData.ts`
- `src/features/dashboard/yearly/components/SparklineList.tsx`
- `src/features/dashboard/monthly/category/category.utils.ts`
- `src/features/dashboard/monthly/category/MonthlyCategorySection.tsx`
- `src/features/dashboard/monthly/category/MonthlyIncomeSection.tsx`
- `src/features/dashboard/monthly/category/useMonthlyCategorySpending.ts`
- `src/features/dashboard/monthly/category/useMonthlyIncomeByCategory.ts`
- `src/domain/category/index.ts` (export added)

---

#### Item 2: Error Handling ✅

**Created:** `src/shared/utils/logger.ts`

```typescript
export const logger = {
  debug(tag: string, message: string, context?: LogContext): void { ... },
  info(tag: string, message: string, context?: LogContext): void { ... },
  warn(tag: string, message: string, context?: LogContext): void { ... },
  error(tag: string, message: string, error?: unknown): void { ... },
}

// Convenience function for catch blocks
export function logError(tag: string, error: unknown): void { ... }
```

**Features:**
- Consistent logging format with tags
- `__DEV__` conditional output (no noise in production)
- Sentry-ready structure (easy to add `Sentry.captureException()` later)
- Type-safe context objects

**Files updated (12 files):**
- `src/store/suggestions.store.ts`
- `src/store/notifications.store.ts`
- `src/store/drafts.store.ts`
- `src/app/_layout.tsx`
- `src/features/notifications/notification.triggers.ts`
- `src/features/transactions/add/AddTransactionScreen.tsx`
- `src/features/dashboard/DashboardScreen.tsx`
- `src/features/dashboard/assets/hooks/useAssetsData.ts`
- `src/features/dashboard/assets/hooks/useAssetsNavigation.ts`
- `src/infrastructure/db/sqlite.ts`
- `src/shared/components/FeatureErrorBoundary.tsx`

---

#### Item 3: Architecture Violation → Services Layer ✅

**Created:** `src/core/services/` layer

```
src/core/services/
├── account/
│   ├── account.service.ts      ← Moved from domain/account/account.usecase.ts
│   └── index.ts
├── asset/
│   ├── asset.service.ts        ← Moved from domain/asset/asset.usecase.ts
│   └── index.ts
├── category/
│   ├── category.service.ts     ← Moved from domain/category/category.usecase.ts
│   └── index.ts
├── price-tracker/
│   ├── price-tracker.service.ts ← Moved from domain/price-tracker/price-tracker.usecase.ts
│   └── index.ts
├── transaction/
│   ├── transaction.crud.ts
│   ├── transaction.aggregations.ts
│   ├── transaction.insights.ts
│   ├── transaction.projections.ts
│   └── index.ts
└── index.ts
```

**Architecture After Refactoring:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  features/ ──────► core/services/ ──────► infrastructure/   │
│                         │                                   │
│                         ▼                                   │
│                   core/domain/                              │
│                   (pure types)                              │
│                                                             │
│  ✅ Domain is pure (no infrastructure imports)              │
│  ✅ Services orchestrate domain types + infrastructure      │
│  ✅ Features import from services or domain (types)         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Naming Convention: `*.usecase.ts` → `*.service.ts`**

| Before (Domain) | After (Application) |
|-----------------|---------------------|
| `account.usecase.ts` | `account.service.ts` |
| `asset.usecase.ts` | `asset.service.ts` |
| `category.usecase.ts` | `category.service.ts` |
| `price-tracker.usecase.ts` | `price-tracker.service.ts` |

Why the rename?
- **Use Case** - implies pure domain logic (Clean Architecture terminology)
- **Service** - implies orchestration of domain + infrastructure (more accurate for application layer)

The transaction module kept its original names (`transaction.crud.ts`, `transaction.aggregations.ts`, etc.) since they were already split into multiple descriptive files.

**File Naming Convention by Layer:**

| Layer | File Pattern | Purpose |
|-------|--------------|---------|
| `core/domain/` | `*.types.ts` | Type definitions |
| `core/domain/` | `*.model.ts` | Factory functions, validation, pure logic |
| `core/domain/` | `*.repository.ts` | Repository interfaces (contracts) |
| `core/domain/` | `*.constants.ts` | Constants, magic strings |
| `core/services/` | `*.service.ts` | Orchestrates domain + infrastructure |
| `infrastructure/` | `Sqlite*.ts` | Repository implementations |
| `infrastructure/` | `*.mapper.ts` | DB row ↔ domain model conversion |

**Files moved (8 use case files):**
- `domain/account/account.usecase.ts` → `core/services/account/account.service.ts`
- `domain/asset/asset.usecase.ts` → `core/services/asset/asset.service.ts`
- `domain/category/category.usecase.ts` → `core/services/category/category.service.ts`
- `domain/price-tracker/price-tracker.usecase.ts` → `core/services/price-tracker/price-tracker.service.ts`
- `domain/transaction/transaction.crud.ts` → `core/services/transaction/transaction.crud.ts`
- `domain/transaction/transaction.aggregations.ts` → `core/services/transaction/transaction.aggregations.ts`
- `domain/transaction/transaction.insights.ts` → `core/services/transaction/transaction.insights.ts`
- `domain/transaction/transaction.projections.ts` → `core/services/transaction/transaction.projections.ts`

**Imports updated (~30 files):**
All files that imported use case functions from `@/domain/*` now import from `@/core/services/*`.
Type imports remain in `@/core/domain/*`.

**Remaining:** `domain/notification/notification.triggers.ts` still imports from infrastructure (minor, can be moved later).

---

#### Item 4: Runtime Validation with Zod ✅

**Created:** Zod schema files for each domain entity

```
src/domain/
├── account/
│   └── account.schema.ts      ← NEW
├── asset/
│   └── asset.schema.ts        ← NEW
└── transaction/
    └── transaction.schema.ts  ← NEW
```

**Pattern:**

```typescript
// domain/account/account.schema.ts
import { z } from 'zod'

// 1. Define Zod schema for enum
export const AccountNatureSchema = z.enum(['asset', 'liability'])

// 2. Create parse function with safe fallback
export function parseAccountNature(value: unknown): z.infer<typeof AccountNatureSchema> {
  const result = AccountNatureSchema.safeParse(value)
  if (result.success) return result.data
  return 'asset' // Safe fallback
}
```

**Schemas created:**

| Domain | Schema | Parse Functions |
|--------|--------|-----------------|
| Account | `AccountNatureSchema`, `AccountKindSchema` | `parseAccountNature()`, `parseAccountKind()` |
| Asset | `AssetFieldSchema`, `AssetCategorySchema`, `FamilyMemberRoleSchema` | `parseAssetField()`, `parseAssetCategory()`, `parseFamilyMemberRole()` |
| Transaction | `TransactionTypeSchema`, `MoneySchema` | `parseTransactionType()` |

**Mappers updated:**

```typescript
// Before (unsafe type assertion)
export function rowToAccount(row: AccountRow): Account {
  return {
    nature: row.nature as AccountNature,  // ❌ Trusts data blindly
  }
}

// After (validated with fallback)
import { parseAccountNature } from '@/domain/account/account.schema'

export function rowToAccount(row: AccountRow): Account {
  return {
    nature: parseAccountNature(row.nature),  // ✅ Validated, safe fallback
  }
}
```

**Files updated:**
- `src/infrastructure/mappers/account.mapper.ts` → uses `parseAccountNature()`, `parseAccountKind()`
- `src/infrastructure/mappers/asset.mapper.ts` → uses `parseAssetField()`, `parseAssetCategory()`, `parseFamilyMemberRole()`
- `src/infrastructure/mappers/transaction.mapper.ts` → uses `parseTransactionType()`

**Cleanup:**
- Removed redundant `normalize*()` functions from `account.model.ts` and `asset.model.ts`
- Updated domain index files to export Zod schemas instead of normalize functions

**Benefits:**
- Runtime validation at system boundaries (DB → domain)
- Type-safe parse functions with proper TypeScript inference
- Safe fallbacks prevent crashes from bad data
- Single source of truth for valid enum values

---

#### Item 5: Dependency Injection ⏸️ Skipped

**Decision:** Use Jest module mocking instead of formal DI.

**Rationale:**
- Jest mocking is the de facto standard for JS/TS testing
- No runtime overhead or initialization required
- Works with existing direct imports (no refactoring)
- Formal DI is more common in Java/C#/.NET ecosystems

**How to mock repositories in tests:**
```typescript
jest.mock('@/infrastructure/repositories', () => ({
  accountRepository: {
    listActive: jest.fn().mockReturnValue([...])
  }
}))
```

---

#### Item 6: Unit Tests ✅

**Test Structure:**

```
__tests__/
├── unit/
│   ├── format.currency.test.ts    ← Formatting (12 tests)
│   ├── format.date.test.ts        ← Formatting (9 tests)
│   ├── transaction.utils.test.ts  ← Domain utils (12 tests)
│   │
│   ├── schema/                    ← Zod schemas
│   │   ├── account.schema.test.ts     (17 tests)
│   │   ├── asset.schema.test.ts       (18 tests)
│   │   ├── category.schema.test.ts    (9 tests)
│   │   ├── notification.schema.test.ts (21 tests)
│   │   ├── price-tracker.schema.test.ts (14 tests)
│   │   ├── tag.schema.test.ts         (7 tests)
│   │   └── transaction.schema.test.ts (10 tests)
│   │
│   ├── model/                     ← Domain models
│   │   ├── money.test.ts              (14 tests)
│   │   ├── account.model.test.ts      (14 tests)
│   │   └── asset.model.test.ts        (25 tests)
│   │
│   ├── mapper/                    ← Infrastructure mappers
│   │   ├── account.mapper.test.ts     (4 tests)
│   │   ├── asset.mapper.test.ts       (9 tests)
│   │   └── transaction.mapper.test.ts (11 tests)
│   │
│   └── services/                  ← Application services
│       ├── account.service.test.ts         (4 tests)
│       ├── asset.service.test.ts           (12 tests)
│       ├── notification.service.test.ts    (9 tests)
│       ├── transaction.aggregations.test.ts (11 tests)
│       ├── transaction.insights.test.ts    (9 tests)
│       └── transaction.projections.test.ts (5 tests)
│
└── setup.ts                       ← Jest setup file
```

**Coverage by Layer:**

| Layer | Files Tested | Tests |
|-------|--------------|-------|
| Shared (format) | 2 | 21 |
| Domain (utils) | 1 | 12 |
| Domain (schemas) | 7 | 62 |
| Domain (models) | 3 | 53 |
| Infrastructure (mappers) | 3 | 24 |
| Application (services) | 6 | 50 |
| **Total** | **22** | **222** |

**Run tests:**
```bash
npm test
```

---
