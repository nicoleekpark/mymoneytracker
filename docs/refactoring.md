# Refactoring Tracker

> Codebase improvements for clean code, scalability, maintainability, readability, and performance.

*Started: March 2026*

**Related**: [Performance Tracking](./performance-tracking.md) - Actual timing measurements

---

## Status Overview

| Phase | Description | Status | Progress |
|-------|-------------|--------|----------|
| 1 | Critical Performance Fixes | **Complete** | 3/3 |
| 2 | Extract Shared Components | Not Started | 0/3 |
| 3 | Split Large Files | Not Started | 0/3 |
| 4 | Type Safety Improvements | Not Started | 0/4 |
| 5 | Code Consolidation | Not Started | 0/4 |
| 6 | Error Handling & Resilience | Not Started | 0/3 |
| 7 | Performance Optimizations | Not Started | 0/3 |

---

## Phase 1: Critical Performance Fixes

### 1.1 Fix N+1 Tag Queries

**Status**: [x] Complete

**File**: `src/infrastructure/repositories/SqliteTransactionRepository.ts`

**Lines**: 156-173, 175-194, 196-227, 349-368

**Current Code**:
```typescript
return rows.map((r) => {
  const tags = this.getTagsForTransaction(r.id)  // Separate query per transaction!
  return rowToTransaction(r, ...)
})
```

**Problem**:
- `list()` method executes 1 + N queries (1 main query + 1 query per transaction for tags)
- With 200 transactions, this means 201 database queries
- Causes noticeable lag when loading transaction lists
- Gets worse as user accumulates more transactions

**Why Refactor**:
- **Performance**: 10-50x faster transaction list loading
- **Scalability**: App remains responsive with 10,000+ transactions
- **User Experience**: Eliminates loading delays on Dashboard and Transactions screens

**Solution**:
```sql
SELECT t.*, GROUP_CONCAT(tags.name, ',') as tag_names
FROM transactions t
LEFT JOIN transaction_tags tt ON t.id = tt.transaction_id
LEFT JOIN tags ON tt.tag_id = tags.id
WHERE ...
GROUP BY t.id
```

**Affected Methods**:
- `list()` (line 156)
- `listForDate()` (line 175)
- `listInDateRange()` (line 196)
- `listTransfersForMonth()` (line 349)

---

### 1.2 Add Missing Database Index

**Status**: [x] Complete (already existed in migration 20260131100100)

**File**: New migration in `src/infrastructure/db/migrations/`

**Problem**:
- `transaction_tags` table has no index on `transaction_id`
- Every tag lookup requires full table scan
- Combined with N+1 issue, causes exponential slowdown

**Current Schema** (from `20260106121718_init.ts`):
```sql
CREATE TABLE transaction_tags (
  transaction_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (transaction_id, tag_id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
)
-- No index on transaction_id for lookups!
```

**Why Refactor**:
- **Performance**: Index enables O(log n) lookups instead of O(n) scans
- **Scalability**: Critical for apps with many transactions and tags
- **Best Practice**: Foreign key columns should always be indexed

**Solution**:
```sql
CREATE INDEX idx_transaction_tags_transaction_id ON transaction_tags(transaction_id);
```

---

### 1.3 Batch Load Categories

**Status**: [x] Complete

**File**: `src/infrastructure/repositories/SqliteTransactionRepository.ts`

**Lines**: 170-171, 191-192, 220-221, 365-366

**Current Code**:
```typescript
return rowToTransaction(r, (id) => this.categoryRepo.resolveCategoryRefFromDbId(id), tags)
// Called for EVERY row, even if same category_id
```

**Problem**:
- If 50 transactions share category "Food > Groceries", we query that category 50 times
- `CategoryRepository.resolveCategoryRefFromDbId()` is not cached
- Redundant database queries for identical data

**Why Refactor**:
- **Performance**: Reduces category queries from N to ~10-20 unique categories
- **Efficiency**: O(1) Map lookup vs O(n) repeated queries
- **Clean Code**: Separates data fetching from data transformation

**Solution**:
```typescript
// Batch load all categories for the transaction set
const categoryIds = [...new Set(rows.map(r => r.category_id).filter(Boolean))]
const categoryMap = this.categoryRepo.batchResolve(categoryIds)

return rows.map((r) => rowToTransaction(r, categoryMap.get(r.category_id), tags))
```

---

## Phase 2: Extract Shared Components

### 2.1 Extract SectionHeader Component

**Status**: [ ] Not Started

**Files with Duplicate Code**:
1. `src/features/dashboard/all/AllBody.tsx` (lines 92-119)
2. `src/features/dashboard/yearly/YearlyBody.tsx`
3. `src/features/dashboard/insights/InsightsBody.tsx` (lines 25-57)
4. `src/features/dashboard/accounts/AccountsBody.tsx`
5. `src/features/dashboard/assets/AssetsBody.tsx`
6. `src/features/dashboard/monthly/MonthlyBody.tsx` (lines 34-61)
7. `src/features/dashboard/monthly/category/MonthlyCategorySection.tsx`
8. `src/features/dashboard/monthly/category/MonthlyIncomeSection.tsx`
9. `src/features/dashboard/yearly/components/CategoryBreakdownList.tsx`

**Current Duplicate Code** (repeated 9 times):
```tsx
function SectionHeader({ title, rightText, rightColor, colors }: {
  title: string
  rightText?: string
  rightColor?: string
  colors: Colors
}) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <View style={{ height: 1, backgroundColor: colors.border, marginBottom: spacing.lg, opacity: 0.5 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text }}>
          {title}
        </Text>
        {rightText && (
          <Text style={{ marginLeft: 'auto', ... }}>{rightText}</Text>
        )}
      </View>
    </View>
  )
}
```

**Why Refactor**:
- **DRY Principle**: ~500 lines of duplicate code across 9 files
- **Maintainability**: Style change requires updating 9 files
- **Consistency**: Risk of visual inconsistency when files diverge
- **Discoverability**: New developers don't know which version to copy

**Solution**:
- Create `src/shared/components/SectionHeader.tsx`
- Export from `src/shared/components/index.ts`
- Replace all 9 occurrences with import

---

### 2.2 Create useThemeColors Hook

**Status**: [ ] Not Started

**Files Affected**:
- `src/features/dashboard/DashboardScreen.tsx` (lines 163-173)
- All Body components that receive colors prop

**Current Code** (in DashboardScreen):
```tsx
<InsightsBody
  colors={{
    text: theme.semantic.text,
    textSecondary: theme.semantic.textSecondary,
    border: theme.semantic.border,
    surface: theme.semantic.surface,
    surfaceAlt: theme.semantic.surfaceAlt,
    primary: theme.semantic.primary,
    success: theme.semantic.success,
    danger: theme.semantic.danger,
    warning: theme.semantic.warning
  }}
/>
```

**Problems**:
- Colors object recreated on every render (not memoized)
- Same object passed to 6+ Body components
- Props drilling through multiple component layers
- Type definitions scattered (`AllColors`, `InsightsColors`, `CalendarColors`)

**Why Refactor**:
- **Performance**: Prevents unnecessary re-renders from new object references
- **Clean Code**: Single source of truth for color objects
- **Type Safety**: Unified color type instead of 6+ variants
- **Developer Experience**: Components can access colors directly

**Solution**:
```typescript
// src/shared/hooks/useThemeColors.ts
export function useThemeColors(): StandardViewColors {
  const theme = useHoHTheme()
  return useMemo(() => ({
    text: theme.semantic.text,
    textSecondary: theme.semantic.textSecondary,
    // ...
  }), [theme])
}
```

---

### 2.3 Move Formatting Functions to Shared

**Status**: [ ] Not Started

**Files with Embedded Formatters**:
- `src/features/dashboard/all/AllBody.tsx` (lines 44-85)
- `src/features/dashboard/insights/InsightsBody.tsx`

**Current Code** (duplicated in components):
```typescript
function formatMonthYear(monthStr: string): string { ... }
function formatTrackingSince(date: Date | null): string { ... }
function formatCompactAmount(amount: number): string { ... }
function getCategoryMeta(ref?: CategoryBreakdown['categoryRef']): { ... } { ... }
function getSubcategoryMeta(parentKey: string, subKey: string): { ... } | null { ... }
```

**Why Refactor**:
- **Testability**: Functions in components are hard to unit test
- **Reusability**: Same formatting needed across features
- **Separation of Concerns**: Components should render, not transform data
- **Discoverability**: Centralized utilities are easier to find

**Solution**:
- Move to `src/shared/format/date.ts` and `src/shared/format/category.ts`
- Export from `src/shared/format/index.ts`

---

## Phase 3: Split Large Files

### 3.1 Split AddTransactionScreen

**Status**: [ ] Not Started

**File**: `src/features/transactions/add/AddTransactionScreen.tsx`

**Current Size**: 1515 lines

**Line Breakdown**:
- Lines 1-80: Imports (80 lines)
- Lines 80-150: State initialization, draft loading (70 lines)
- Lines 149-200: Category/account chip preparation (50 lines)
- Lines 232-287: Transaction editing logic (55 lines)
- Lines 334-464: Validation & save logic (130 lines)
- Lines 604-664: Receipt handling (60 lines)
- Lines 690-750: Chip selection handlers (60 lines)
- Lines 752-1222: JSX render (470 lines!)
- Lines 1224-1515: Stylesheet (291 lines)

**Problems**:
- Single component handles 10+ concerns
- 470 lines of JSX is unreadable
- 6 modal components rendered inline
- Hard to test individual pieces
- Changes risk breaking unrelated functionality

**Why Refactor**:
- **Readability**: Files > 300 lines are hard to navigate
- **Testability**: Small focused components can be unit tested
- **Maintainability**: Changes are isolated to relevant files
- **Code Review**: Smaller files are easier to review

**Proposed Split**:
```
src/features/transactions/add/
├── AddTransactionScreen.tsx      (~200 lines - orchestration)
├── components/
│   ├── TransactionForm.tsx       (~300 lines - form fields)
│   ├── TransactionFormModals.tsx (~150 lines - all modals)
│   ├── TransactionFormHeader.tsx (~50 lines - type toggle, close)
│   └── TransactionFormActions.tsx (~50 lines - save button)
├── hooks/
│   ├── useTransactionForm.ts     (~200 lines - form state)
│   ├── useTransactionValidation.ts (~80 lines - validation)
│   └── useReceiptHandler.ts      (~60 lines - image picker)
└── AddTransactionScreen.styles.ts (~150 lines - extracted styles)
```

---

### 3.2 Split SqliteTransactionRepository

**Status**: [ ] Not Started

**File**: `src/infrastructure/repositories/SqliteTransactionRepository.ts`

**Current Size**: 944 lines, 40+ methods

**Method Categories**:
- CRUD: add, update, remove, restore, getById (5 methods)
- List queries: list, listForDate, listInDateRange, etc. (8 methods)
- Monthly aggregations: listMonthlyExpenseByCategory, etc. (6 methods)
- Yearly aggregations: listYearlyExpenseByCategory, etc. (4 methods)
- All-time aggregations: listAllTimeExpenseByCategory, etc. (4 methods)
- Account activity: listAccountActivityForMonth/Year/AllTime (3 methods)
- Projections: getMonthlyProjection, getYearlyProjection (2 methods)
- Tags: getTagsForTransaction, syncTags (2 methods)
- Helpers: internal query builders (6+ methods)

**Problems**:
- 944 lines violates Single Responsibility Principle
- Near-identical aggregation methods (category totals repeated 6 times)
- Hard to find specific functionality
- Changes to one method risk affecting others

**Why Refactor**:
- **Single Responsibility**: Each file should have one reason to change
- **DRY**: 6 category total methods share 90% of code
- **Discoverability**: Developers can find methods faster
- **Testing**: Smaller files are easier to test in isolation

**Proposed Split**:
```
src/infrastructure/repositories/
├── SqliteTransactionRepository.ts        (~250 lines - CRUD, core queries)
├── SqliteTransactionAggregations.ts      (~200 lines - category/account totals)
├── SqliteTransactionProjections.ts       (~150 lines - projections)
├── helpers/
│   ├── TransactionQueryBuilder.ts        (~100 lines - SQL generation)
│   └── CategoryTotalsQuery.ts            (~80 lines - reusable aggregation)
```

---

### 3.3 Split transaction.usecase.ts

**Status**: [ ] Not Started

**File**: `src/domain/transaction/transaction.usecase.ts`

**Current Size**: 830 lines, 40+ exports

**Function Categories**:
- CRUD operations: addTransaction, updateTransaction, removeTransaction, etc.
- List operations: getTransactions, getTransactionsInRange
- Monthly data: getMonthlyExpenseTotals, getMonthlyCategoryTotals, etc.
- Yearly data: getYearlyExpenseTotals, getYearlyCategoryTotals, etc.
- All-time data: getAllTimeExpenseTotals, getCumulativeNetData, etc.
- Projections: getMonthlyProjection, getYearlyProjection
- Insights: getPersonalBests, getSpendingVelocity

**Helper Functions Mixed In**:
- `currentMonthYYYYMM()` (lines 13-17)
- `slugify()` (lines 19-26)
- `buildTxKey()` (lines 28-40)
- `getDaysInMonth()` (line 669)
- `getMonthsElapsed()` (lines 743-748)

**Why Refactor**:
- **Single Responsibility**: 830 lines covers too many concerns
- **Organization**: Related functions should be grouped
- **Imports**: Consumers import entire file for one function
- **Testability**: Easier to test focused modules

**Proposed Split**:
```
src/domain/transaction/
├── transaction.usecase.ts           (~150 lines - re-exports, main CRUD)
├── transaction.crud.ts              (~100 lines - add, update, remove, restore)
├── transaction.aggregations.ts      (~200 lines - totals, breakdowns)
├── transaction.projections.ts       (~150 lines - monthly/yearly projections)
├── transaction.insights.ts          (~100 lines - personal bests, velocity)
├── transaction.utils.ts             (~80 lines - helpers: slugify, buildTxKey, date utils)
```

---

## Phase 4: Type Safety Improvements

### 4.1 Remove `any` Cast in transaction.model.ts

**Status**: [ ] Not Started

**File**: `src/domain/transaction/transaction.model.ts`

**Line**: 22

**Current Code**:
```typescript
if ((input as any).fromAccountId || (input as any).toAccountId) {
  throw new Error('non-transfer must not include fromAccountId/toAccountId')
}
```

**Problem**:
- `any` cast defeats TypeScript's type checking
- `AddTransactionInput` is already a discriminated union
- TypeScript could catch this at compile time

**Why Refactor**:
- **Type Safety**: Catch errors at compile time, not runtime
- **IDE Support**: Better autocomplete and error highlighting
- **Clean Code**: `any` is a code smell indicating design issues

**Solution**:
```typescript
// Use type guard or discriminated union properly
if (input.type !== 'transfer') {
  // TypeScript knows this is IncomeExpenseInput
  // fromAccountId/toAccountId don't exist on this type
}
```

---

### 4.2 Define CategoryIndex Interface

**Status**: [ ] Not Started

**File**: `src/domain/category/category.model.ts`

**Lines**: 15-16, 22

**Current Code**:
```typescript
if (typeof (ref as any).type !== 'string' ||
    typeof (ref as any).categoryKey !== 'string') { ... }
const typeMap = (index as any)[type]
```

**Problem**:
- 3 `any` casts indicate weak typing around CategoryIndex
- CategoryIndex is imported from config but not properly typed
- Runtime validation compensates for missing type safety

**Why Refactor**:
- **Type Safety**: Proper interface eliminates runtime checks
- **Documentation**: Interface serves as self-documenting code
- **IDE Support**: Autocomplete for CategoryIndex properties

**Solution**:
```typescript
// src/domain/category/category.types.ts
export interface CategoryIndex {
  expense: Record<string, CategoryMeta>
  income: Record<string, CategoryMeta>
  transfer: Record<string, CategoryMeta>
}
```

---

### 4.3 Move TransactionPage Type

**Status**: [ ] Not Started

**Files**:
- `src/domain/transaction/transaction.usecase.ts` (lines 101-105)
- `src/domain/transaction/transaction.repository.ts` (lines 86-90)

**Current Code** (duplicated):
```typescript
// In usecase.ts
export type TransactionPage = Readonly<{
  items: Transaction[]
  hasMore: boolean
  oldestDate: string | null
}>

// In repository.ts (same definition)
export type TransactionPage = Readonly<{
  items: Transaction[]
  hasMore: boolean
  oldestDate: string | null
}>
```

**Why Refactor**:
- **DRY**: Same type defined twice
- **Maintenance**: Changes must be made in both places
- **Consistency Risk**: Types could diverge over time

**Solution**:
- Move to `src/domain/transaction/transaction.types.ts`
- Export from both usecase and repository via re-export

---

### 4.4 Move AssetProjection Type

**Status**: [ ] Not Started

**File**: `src/domain/asset/asset.usecase.ts`

**Line**: 233

**Current Code**:
```typescript
// Type defined in usecase file
export type AssetProjection = { ... }
```

**Problem**:
- Type definitions belong in `*.types.ts` files
- Usecase files should contain business logic, not types
- Inconsistent with other domain modules

**Why Refactor**:
- **Convention**: Follow established `*.types.ts` pattern
- **Discoverability**: Types are easier to find in dedicated files
- **Imports**: Cleaner import paths for type-only imports

**Solution**:
- Move to `src/domain/asset/asset.types.ts`
- Re-export from usecase for backward compatibility

---

## Phase 5: Code Consolidation

### 5.1 Extract listCategoryTotals Helper

**Status**: [ ] Not Started

**File**: `src/infrastructure/repositories/SqliteTransactionRepository.ts`

**Duplicate Methods**:
- `listMonthlyExpenseByCategory()` (line 301)
- `listMonthlyIncomeByCategory()` (line 325)
- `listYearlyExpenseByCategory()` (line 478)
- `listYearlyIncomeByCategory()` (line 500)
- `listAllTimeExpenseByCategory()` (line 546)
- `listAllTimeIncomeByCategory()` (line 590)

**Pattern** (repeated 6 times with minor variations):
```typescript
listMonthlyExpenseByCategory(month: string): CategoryTotal[] {
  const rows = this.dataSource.queryAll(`
    SELECT category_id, SUM(amount_cents) as total
    FROM transactions
    WHERE type = 'expense'
      AND substr(occurred_at, 1, 7) = ?
    GROUP BY category_id
  `, [month])
  return rows.map(...)
}
```

**Why Refactor**:
- **DRY**: 6 methods share 90% identical code
- **Bugs**: Fix must be applied 6 times
- **Testing**: 6 similar tests instead of 1 parameterized test

**Solution**:
```typescript
private listCategoryTotals(
  type: 'expense' | 'income',
  dateFilter: { scope: 'month' | 'year' | 'all'; value?: string }
): CategoryTotal[] {
  const whereClause = this.buildDateWhereClause(dateFilter)
  // Single implementation
}
```

---

### 5.2 Extract listAccountActivity Helper

**Status**: [ ] Not Started

**File**: `src/infrastructure/repositories/SqliteTransactionRepository.ts`

**Lines**: 765-868

**Duplicate Methods**:
- `listAccountActivityForMonth()` (line 765)
- `listAccountActivityForYear()` (line 800)
- `listAccountActivityAllTime()` (line 836)

**Why Refactor**:
- Only differ by WHERE clause date filter
- Same aggregation logic repeated 3 times

**Solution**:
```typescript
private listAccountActivity(
  dateFilter?: { scope: 'month' | 'year'; value: string }
): AccountActivity[] {
  // Single implementation with optional date filter
}
```

---

### 5.3 Move Helpers to transaction.utils.ts

**Status**: [ ] Not Started

**File**: `src/domain/transaction/transaction.usecase.ts`

**Helper Functions to Move**:
- `currentMonthYYYYMM()` (lines 13-17)
- `slugify()` (lines 19-26)
- `buildTxKey()` (lines 28-40)
- `getDaysInMonth()` (line 669)
- `getMonthsElapsed()` (lines 743-748)

**Why Refactor**:
- **Separation of Concerns**: Helpers aren't business logic
- **Reusability**: These could be used elsewhere
- **Testing**: Utilities can be tested independently
- **File Size**: Reduces usecase.ts by ~50 lines

**Target File**: `src/domain/transaction/transaction.utils.ts`

---

### 5.4 Create Centralized Date Utilities

**Status**: [ ] Not Started

**Problem**: Date formatting scattered across codebase

**Current State**:
- `YYYY-MM-DD` format in some places
- `YYYY-MM` format in others
- ISO strings elsewhere
- `safeDate()` in transaction.utils.ts handles both Date and string

**Why Refactor**:
- **Consistency**: Single source of truth for date formats
- **Bug Prevention**: Date parsing errors are common
- **Reusability**: Same patterns needed across features

**Solution**:
```typescript
// src/shared/utils/date.ts
export function toYYYYMM(date: Date): string
export function toYYYYMMDD(date: Date): string
export function parseISODate(s: string): Date
export function formatMonthYear(monthStr: string): string
export function getMonthsElapsed(start: Date, end: Date): number
```

---

## Phase 6: Error Handling & Resilience

### 6.1 Add Feature Error Boundaries

**Status**: [ ] Not Started

**Files Needing Error Boundaries**:
- `src/features/dashboard/monthly/MonthlyBody.tsx`
- `src/features/dashboard/yearly/YearlyBody.tsx`
- `src/features/dashboard/all/AllBody.tsx`
- `src/features/dashboard/insights/InsightsBody.tsx`
- `src/features/dashboard/assets/AssetsBody.tsx`
- `src/features/dashboard/accounts/AccountsBody.tsx`

**Current State**:
```tsx
if (loading) { return <LoadingView /> }
if (error) { return <ErrorView /> }
// But no catch for JS runtime errors!
```

**Why Refactor**:
- **User Experience**: Graceful degradation instead of white screen
- **Debugging**: Error boundaries can log errors to analytics
- **Recovery**: Users can retry without app restart

**Solution**:
```typescript
// src/shared/components/FeatureErrorBoundary.tsx
export class FeatureErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={...} />
    }
    return this.props.children
  }
}
```

---

### 6.2 Standardize Repository Error Handling

**Status**: [ ] Not Started

**Current Inconsistency**:

**SqliteAccountRepository.ts:52** - Throws:
```typescript
if (!row?.id) throw new Error(`Account not found for key=${key}`)
```

**SqliteDraftRepository.ts** - Returns null silently

**SqliteTransactionRepository.ts** - No error handling

**Why Refactor**:
- **Predictability**: Callers need to know what to expect
- **Debugging**: Silent failures hide bugs
- **Consistency**: Same pattern across all repositories

**Proposed Convention**:
- **Writes** (add, update, delete): Throw on failure
- **Reads** (get, list): Return null/empty array on not found
- **Document**: Add JSDoc to each method

---

### 6.3 Add Runtime Validation in Mappers

**Status**: [ ] Not Started

**File**: `src/infrastructure/mappers/asset.mapper.ts`

**Lines**: 64-65

**Current Code**:
```typescript
field: normalizeAssetField(row.field),
category: normalizeAssetCategory(row.category),
```

**Problem**:
- Invalid enum values are silently "normalized" to defaults
- Data corruption goes undetected
- Debugging is difficult when bad data propagates

**Why Refactor**:
- **Data Integrity**: Catch corruption at the source
- **Debugging**: Fail fast with clear error messages
- **Trust**: Mappers guarantee valid domain objects

**Solution**:
```typescript
function validateAssetField(value: unknown): AssetField {
  if (!VALID_ASSET_FIELDS.includes(value)) {
    throw new Error(`Invalid asset field: ${value}`)
  }
  return value as AssetField
}
```

---

## Phase 7: Performance Optimizations

### 7.1 Add React.memo to Chart Components

**Status**: [ ] Not Started

**Components to Memoize**:
- `src/features/dashboard/monthly/category/MonthlyCategoryDonut.tsx`
- `src/features/dashboard/yearly/components/MonthlyCashflowChart.tsx`
- `src/features/dashboard/all/components/YearlyNetChart.tsx`
- `src/features/dashboard/all/components/CumulativeNetChart.tsx`
- `src/features/dashboard/insights/components/NetSparkline.tsx`
- `src/features/dashboard/insights/components/DailyOutflowBars.tsx`

**Why Refactor**:
- **Performance**: Charts are expensive to render
- **Props Stability**: Chart data often unchanged between renders
- **React Best Practice**: Memoize presentational components

**Solution**:
```typescript
export const MonthlyCategoryDonut = React.memo(function MonthlyCategoryDonut(props) {
  // ...
})
```

---

### 7.2 Memoize Colors Object

**Status**: [ ] Not Started

**File**: `src/features/dashboard/DashboardScreen.tsx`

**Current Code**:
```tsx
// New object created every render
colors={{
  text: theme.semantic.text,
  textSecondary: theme.semantic.textSecondary,
  // ...
}}
```

**Why Refactor**:
- **Performance**: New object = new reference = child re-renders
- **React Pattern**: Stable references prevent unnecessary work

**Solution**:
```typescript
const colors = useMemo(() => ({
  text: theme.semantic.text,
  // ...
}), [theme])
```

---

### 7.3 Split Large Hook Return Objects

**Status**: [ ] Not Started

**Hooks with Large Returns**:
- `useCategoryPicker()` - 25 properties
- `useAmountKeypad()` - 11 properties
- `useDateTime()` - Similar pattern

**Current Pattern**:
```typescript
return {
  // State (5 properties)
  selectedCategory, selectedSubCategory, searchQuery, isSearching, searchResults,
  // Modal controls (4 properties)
  showCategoryModal, showSubCategoryModal, openCategoryModal, closeCategoryModal,
  // Display values (3 properties)
  categoryDisplayLabel, categoryColor, subCategoryDisplayLabel,
  // Actions (8 properties)
  chooseCategory, chooseSubCategory, setSearchQuery, clearSearch, ...
  // Computed (5 properties)
  hasCategory, canChooseSubCategory, ...
}
```

**Why Refactor**:
- **Discoverability**: Hard to find what's available
- **Testing**: Large objects are hard to mock
- **Performance**: Returning new objects can trigger re-renders

**Solution Options**:
1. Split into multiple hooks: `useCategoryPickerState()`, `useCategoryPickerActions()`
2. Group into namespaces: `{ state: {...}, actions: {...}, display: {...} }`
3. Use reducer pattern for complex state

---

## Completed Items

| Date | Phase | Task | Notes |
|------|-------|------|-------|
| 2026-03-06 | 1 | 1.1 Fix N+1 Tag Queries | JOIN + GROUP_CONCAT in 4 list methods |
| 2026-03-06 | 1 | 1.2 Add Missing Database Index | Already existed in migration |
| 2026-03-06 | 1 | 1.3 Batch Load Categories | Map-based O(1) category lookups |

---

## Notes

- Each task should be committed separately for easy rollback
- Run app after each phase to verify no regressions
- Update this doc as tasks complete
- Priority can be adjusted based on immediate needs
