# Architecture Map

> Generated: 2026-06-14

---

## 1. High-Level Architecture

MyMoneyTracker follows **Clean Architecture** with explicit layer separation:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│              src/app/ (Expo Router Screens)                  │
│         Thin orchestrators, minimal business logic           │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    FEATURES LAYER                            │
│                   src/features/                              │
│    Feature-specific components, hooks, business logic        │
│    (dashboard, transactions, accounts, assets, etc.)         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  APPLICATION LAYER                           │
│               src/core/services/                             │
│    Business logic orchestrating domain + infrastructure      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    DOMAIN LAYER (Pure)                       │
│                src/core/domain/                              │
│      Types, models, repository interfaces, schemas           │
│          ✓ NO infrastructure imports                         │
│          ✓ NO side effects                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                         │
│                src/infrastructure/                           │
│     SQLite, repositories, mappers, migrations                │
└─────────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 CROSS-CUTTING CONCERNS                       │
│                    src/shared/                               │
│   Components, hooks, stores, theme, format, utils            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
src/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout (providers, fonts, theme)
│   ├── (tabs)/                   # Tab navigator
│   │   ├── _layout.tsx           # Tab bar configuration
│   │   ├── index.tsx             # Dashboard (default tab)
│   │   ├── transactions.tsx      # Transactions list
│   │   └── notifications.tsx     # Notifications
│   └── (modal)/                  # Modal routes
│       ├── add-transaction/      # Add transaction flow
│       ├── account-settings/     # Account management
│       └── asset-settings/       # Asset management
│
├── core/
│   ├── domain/                   # Pure business types (NO infra imports)
│   │   ├── account/              # Account types, model, repository interface
│   │   ├── asset/                # Asset tracking domain
│   │   ├── category/             # Category hierarchy
│   │   ├── transaction/          # Transaction domain
│   │   ├── draft/                # Draft transaction
│   │   ├── notification/         # Notification types
│   │   ├── price-tracker/        # Price tracking domain
│   │   ├── tag/                  # Tag types
│   │   └── common/               # UUID, money utilities
│   │
│   └── services/                 # Application services (orchestrates domain + infra)
│       ├── account/              # Account service
│       ├── asset/                # Asset service, summaries, goals
│       ├── category/             # Category resolution
│       ├── transaction/          # CRUD, aggregations, insights
│       ├── notification/         # Notification generation
│       └── price-tracker/        # Price tracking operations
│
├── features/                     # Feature modules
│   ├── dashboard/                # Dashboard feature
│   │   ├── DashboardScreen.tsx   # Main dashboard orchestrator
│   │   ├── monthly/              # Monthly view
│   │   ├── yearly/               # Yearly view
│   │   ├── all/                  # All-time view
│   │   ├── accounts/             # Accounts tab
│   │   ├── assets/               # Assets tab
│   │   ├── insights/             # Insights view
│   │   ├── shared/               # Shared dashboard components
│   │   ├── store/                # Dashboard-specific store
│   │   ├── types/                # Dashboard types
│   │   └── utils/                # Dashboard utilities
│   │
│   ├── transactions/             # Transactions feature
│   │   ├── add/                  # Add transaction screen + components
│   │   └── list/                 # Transaction list + components
│   │
│   ├── accounts/                 # Account management
│   │   ├── add/                  # Add account
│   │   ├── edit/                 # Edit account
│   │   ├── detail/               # Account detail
│   │   └── settings/             # Account settings
│   │
│   ├── assets/                   # Asset management
│   │   ├── add/                  # Add asset
│   │   ├── history/              # Asset history
│   │   └── settings/             # Asset settings
│   │
│   ├── notifications/            # Notifications screen
│   │
│   └── price-tracker/            # Price tracking feature
│       ├── components/           # Price tracker components
│       ├── hooks/                # Price tracker hooks
│       └── sheets/               # Bottom sheets
│
├── infrastructure/               # Database and I/O
│   ├── db/
│   │   ├── DataSource.ts         # SQLite wrapper
│   │   ├── migrations/           # Schema migrations (23+ files)
│   │   ├── queries/              # Query builders
│   │   └── seed/                 # Dev seed data
│   ├── repositories/             # SQLite implementations
│   │   ├── SqliteAccountRepository.ts
│   │   ├── SqliteTransactionRepository.ts
│   │   ├── SqliteAssetRepository.ts
│   │   └── ...
│   └── mappers/                  # Row ↔ Domain converters
│
└── shared/                       # Cross-feature code
    ├── components/               # Reusable UI components
    │   ├── AmountKeypadSheet.tsx
    │   ├── CategoryIcon.tsx
    │   ├── EmptyState.tsx
    │   ├── Header.tsx
    │   ├── InfoSheet.tsx
    │   ├── ModalSaveBar.tsx
    │   ├── SectionHeader.tsx
    │   ├── Toast.tsx
    │   ├── TrackingSince.tsx
    │   └── ...
    ├── config/                   # App configuration
    ├── format/                   # Formatting utilities (currency, date, category)
    ├── hooks/                    # Shared React hooks
    ├── layout/                   # Screen wrappers
    ├── providers/                # Context providers (Theme)
    ├── store/                    # Zustand stores
    │   ├── drafts.store.ts
    │   ├── notifications.store.ts
    │   ├── quickChips.store.ts
    │   ├── settings.store.ts
    │   ├── dataRefresh.store.ts
    │   └── index.ts
    ├── theme/                    # Design system
    │   ├── colors/               # Color palettes
    │   └── tokens/               # Design tokens
    └── utils/                    # Shared utilities
```

---

## 3. Entry Points

### App Entry
- **`src/app/_layout.tsx`** - Root layout
  - Initializes database
  - Loads fonts
  - Sets up theme provider
  - Configures splash screen

### Tab Navigation
- **`src/app/(tabs)/_layout.tsx`** - Tab bar configuration
  - Dashboard (index)
  - Transactions
  - Notifications

### Modal Routes
- **`src/app/(modal)/add-transaction/index.tsx`** - Add transaction
- **`src/app/(modal)/account-settings/`** - Account management
- **`src/app/(modal)/asset-settings/`** - Asset management

---

## 4. Data Flow

```
User Interaction (Screen)
    ↓
Feature Hook (e.g., useMonthlySummary)
    ↓
Service Function (e.g., getMonthlySummaryDollar)
    ↓
Repository Interface (TransactionRepository)
    ↓
Repository Implementation (SqliteTransactionRepository)
    ↓
DataSource (SQLite via expo-sqlite)
    ↓
Mapper (rowToTransaction / transactionToRow)
    ↓
Domain Model → UI Display
```

---

## 5. State Management

### Zustand Stores (`src/shared/store/`)

| Store | Purpose | Persistence |
|-------|---------|-------------|
| `drafts.store.ts` | Draft transactions | SQLite |
| `notifications.store.ts` | Notification state | SQLite |
| `quickChips.store.ts` | Quick chip preferences | SQLite |
| `settings.store.ts` | App settings (budget, theme) | SQLite |
| `dataRefresh.store.ts` | Cache invalidation signals | Memory |

### Dashboard Store (`src/features/dashboard/store/`)

| Store | Purpose |
|-------|---------|
| `dashboard.store.ts` | Dashboard mode, period, scope |

---

## 6. Design System Location

### Token Files (`src/shared/theme/tokens/`)

| File | Contents |
|------|----------|
| `spacing.ts` | Spacing scale (xs, sm, md, lg, xl, 2xl, 3xl) |
| `radius.ts` | Border radius values |
| `typography.ts` | Font sizes, weights, letter spacing |
| `shadow.ts` | Shadow presets (CARD_SHADOW) |
| `opacity.ts` | Opacity values (divider, tertiary, muted, secondary) |
| `animation.ts` | Animation durations |
| `viewStyles.ts` | Pre-composed view styles |
| `dashboard.ts` | Dashboard-specific tokens |
| `modal.ts` | Modal tokens (deprecated, use modal/) |
| `modal/` | **Modal design system** |
| `modal/constants.ts` | Modal dimensions, snaps |
| `modal/core.styles.ts` | Core modal styles |
| `modal/field.styles.ts` | Form field styles |
| `modal/detail.styles.ts` | Detail modal styles |
| `modal/selection.styles.ts` | Selection list styles |
| `modal/helpers.ts` | Helper functions |
| `modal/types.ts` | Modal color types |

### Color System (`src/shared/theme/colors/`)

| File | Contents |
|------|----------|
| `palette.ts` | Base color palette |
| `semantic.ts` | Semantic color mappings |

### Shared Components (`src/shared/components/`)

| Component | Purpose |
|-----------|---------|
| `AmountKeypadSheet` | Amount input keypad |
| `AppBar` | Top app bar |
| `BottomSheetContainer` | Bottom sheet wrapper |
| `CategoryIcon` | Category/subcategory icons |
| `CTAContainer` | CTA button container |
| `Divider` | Section divider |
| `EmptyState` | Empty state display |
| `FeatureErrorBoundary` | Error boundary |
| `Header` | Screen header |
| `InfoSheet` | Info bottom sheet |
| `ModalSaveBar` | Modal save button bar |
| `ScalePressable` | Animated pressable |
| `SectionHeader` | Section header with divider |
| `SettingsLink` | Settings navigation link |
| `Toast` | Toast notification |
| `TrackingSince` | "Tracking since" display |

---

## 7. Naming Conventions

### File Naming

| Layer | Pattern | Example |
|-------|---------|---------|
| Domain Types | `*.types.ts` | `transaction.types.ts` |
| Domain Models | `*.model.ts` | `transaction.model.ts` |
| Domain Schemas | `*.schema.ts` | `transaction.schema.ts` |
| Repository Interface | `*.repository.ts` | `transaction.repository.ts` |
| Service | `*.service.ts` | `account.service.ts` |
| Aggregations | `*.aggregations.ts` | `transaction.aggregations.ts` |
| Insights | `*.insights.ts` | `transaction.insights.ts` |
| Mapper | `*.mapper.ts` | `transaction.mapper.ts` |
| Repository Impl | `Sqlite*.ts` | `SqliteTransactionRepository.ts` |
| React Hook | `use*.ts` | `useMonthlySummary.ts` |
| Zustand Store | `*.store.ts` | `drafts.store.ts` |
| Style Factory | `*.styles.ts` | `DashboardScreen.styles.ts` |
| Screen | `*Screen.tsx` | `DashboardScreen.tsx` |
| Body Component | `*Body.tsx` | `MonthlyBody.tsx` |

### Component Naming

- PascalCase for components: `CategoryIcon`, `SectionHeader`
- camelCase for hooks: `useAccountsData`, `useMonthlySummary`
- camelCase for utilities: `formatCurrency`, `centsToDollars`

---

## 8. Key Patterns

### Repository Pattern
```typescript
// Domain defines interface (src/core/domain/transaction/transaction.repository.ts)
export interface TransactionRepository {
  insert(tx: Transaction): void
  list(limit?: number): Transaction[]
}

// Infrastructure implements (src/infrastructure/repositories/)
export class SqliteTransactionRepository implements TransactionRepository {
  insert(tx: Transaction): void { /* ... */ }
}
```

### Mapper Pattern
```typescript
// src/infrastructure/mappers/transaction.mapper.ts
export function rowToTransaction(row: TransactionRow): Transaction { /* ... */ }
export function transactionToRow(tx: Transaction): TransactionRow { /* ... */ }
```

### Color Passing Pattern
```typescript
// Parent creates colors
const colors: StandardViewColors = { text, textSecondary, ... }

// Pass to children
<MonthlyBody colors={colors} />
```

### Synchronous SQLite Pattern
```typescript
// Uses useMemo (not useEffect) because SQLite is synchronous
const data = useMemo(() => {
  return transactionRepository.listForMonth(month)
}, [month])
```

---

## 9. Large Files (Refactoring Candidates)

| File | Lines | Notes |
|------|-------|-------|
| `AssetsBody.tsx` | 1,017 | Complex balance sheet UI |
| `AllBody.tsx` | 911 | All-time view with multiple sections |
| `AccountsBody.tsx` | 681 | Account listing with grouping |
| `AddTransactionScreen.tsx` | ~900 | Transaction form with keypad |
| `CategorySelectionModal.tsx` | ~500 | Category picker modal |

These files may benefit from component extraction to improve maintainability.
