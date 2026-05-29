# MyMoneyTracker - Code Audit Report

**Date:** 2026-03-30
**Auditor:** Senior Software Engineer & Architect
**Scope:** Full codebase review (security, clean code, scalability, reliability, efficiency)
**Time Budget:** 8 hours for critical fixes

---

## Executive Summary

The MyMoneyTracker codebase demonstrates **solid architectural discipline** with Clean Architecture correctly implemented. The domain layer is pure, the repository pattern is properly applied, and the codebase is well-organized with 329 source files across 82 directories.

**Overall Grade: B+**

| Category | Grade | Notes |
|----------|-------|-------|
| Security | A | No SQL injection, parameterized queries throughout |
| Architecture | A- | Clean separation, 5 minor violations |
| Code Quality | B+ | Good patterns, some anti-patterns in features |
| Test Coverage | C+ | 64% coverage, critical gaps in CRUD/services |
| Reliability | B | Missing error boundaries, memory leak patterns |
| Performance | B+ | Some N+1 queries, generally efficient |

---

## Table of Contents

1. [Critical Issues (Fix Immediately)](#1-critical-issues-fix-immediately)
2. [High Priority Issues](#2-high-priority-issues)
3. [Medium Priority Issues](#3-medium-priority-issues)
4. [Low Priority / Technical Debt](#4-low-priority--technical-debt)
5. [Positive Findings](#5-positive-findings)
6. [Recommended 8-Hour Action Plan](#6-recommended-8-hour-action-plan)

---

## 1. Critical Issues (Fix Immediately)

### 🔴 CRIT-1: Memory Leaks in Transaction Screens

**Severity:** CRITICAL
**Impact:** App stability degradation over time
**Effort:** 2 hours

**Files Affected:**
- `src/features/transactions/add/AddTransactionScreen.tsx`
- `src/features/transactions/list/TransactionsScreen.tsx`
- `src/shared/components/Toast.tsx`

**Problem:** Multiple `setTimeout` calls without cleanup and async operations without cancellation.

**Specific Locations:**

1. **AddTransactionScreen.tsx**
   - Line 311: Untracked scroll timeout
   - Line 331: Untracked scroll timeout
   - Line 525: Modal close timeout (800ms)
   - Line 568: Draft save timeout (800ms)
   - Lines 248-317: Promise chain without AbortController

2. **TransactionsScreen.tsx**
   - Line 323-337: Auto-scroll timeout without cleanup ref

3. **Toast.tsx**
   - Line 37: Auto-hide timeout without cleanup

**Fix Pattern:**
```typescript
// Before (BAD)
setTimeout(() => router.back(), 800)

// After (GOOD)
const timeoutRef = useRef<NodeJS.Timeout | null>(null)

useEffect(() => {
  return () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }
}, [])

const handleSave = () => {
  // ... save logic
  timeoutRef.current = setTimeout(() => router.back(), 800)
}
```

---

### 🔴 CRIT-2: Missing Error Boundaries on Feature Screens

**Severity:** CRITICAL
**Impact:** Any render error crashes entire app
**Effort:** 1 hour

**Problem:** `FeatureErrorBoundary` component exists but is NOT used anywhere.

**Files Missing Error Boundaries:**
- `src/features/dashboard/DashboardScreen.tsx`
- `src/features/transactions/list/TransactionsScreen.tsx`
- `src/features/transactions/add/AddTransactionScreen.tsx`
- `src/features/notifications/NotificationsScreen.tsx`
- `src/features/price-tracker/PriceTrackerScreen.tsx`

**Fix:** Wrap each feature screen:
```tsx
// In src/app/(tabs)/index.tsx
import { FeatureErrorBoundary } from '@/shared/components'
import { DashboardScreen } from '@/features/dashboard'

export default function DashboardRoute() {
  return (
    <FeatureErrorBoundary featureName="Dashboard">
      <DashboardScreen />
    </FeatureErrorBoundary>
  )
}
```

---

### 🔴 CRIT-3: Tag Cleanup Bug on Transaction Update

**Severity:** CRITICAL
**Impact:** Tags accumulate incorrectly, data integrity issue
**Effort:** 30 minutes

**File:** `src/core/services/transaction/transaction.crud.ts` (Lines 192-195)

**Problem:** When updating a transaction, old tags are never deleted:
```typescript
// Current (BAD) - only adds new tags, never removes old
if (input.tags && input.tags.length > 0) {
  transactionRepository.saveTags(tx.id, input.tags)
}
```

**Fix:**
```typescript
// Delete existing tags first, then save new ones
transactionRepository.deleteTags(tx.id)
if (input.tags && input.tags.length > 0) {
  transactionRepository.saveTags(tx.id, input.tags)
}
```

**Also Required:** Add `deleteTags()` method to repository interface and implementation.

---

### 🔴 CRIT-4: Transaction saveTags() Not Transactional

**Severity:** CRITICAL
**Impact:** Partial tag saves on failure = data inconsistency
**Effort:** 30 minutes

**File:** `src/infrastructure/repositories/SqliteTransactionRepository.ts` (Lines 660-679)

**Problem:** Multiple INSERT statements in loop without transaction wrapper:
```typescript
saveTags(transactionId: UUID, tagNames: string[]): void {
  for (const name of tagNames) {
    this.dataSource.exec(...)  // Each could fail independently
    this.dataSource.exec(...)
  }
}
```

**Fix:** Wrap in transaction:
```typescript
saveTags(transactionId: UUID, tagNames: string[]): void {
  this.dataSource.withTransaction(() => {
    for (const name of tagNames) {
      // ... existing logic
    }
  })
}
```

---

## 2. High Priority Issues

### 🟠 HIGH-1: Architecture Violation - Features Importing Infrastructure

**Severity:** HIGH
**Impact:** Violates Clean Architecture, harder to test/maintain
**Effort:** 2 hours

**Problem:** 5 feature files directly import from `@/infrastructure/repositories` instead of `@/core/services`.

**Files:**
1. `src/features/dashboard/all/hooks/useAllTimeData.ts`
2. `src/features/dashboard/accounts/hooks/useAccountsData.ts`
3. `src/features/dashboard/monthly/category/useMonthlyCategorySpending.ts`
4. `src/features/dashboard/monthly/category/useMonthlyIncomeByCategory.ts`
5. `src/features/dashboard/yearly/hooks/useYearlyData.ts`

**Fix:** Create service functions and import from services layer instead.

---

### 🟠 HIGH-2: N+1 Query in Price Tracker

**Severity:** HIGH
**Impact:** Poor performance with many items (101 queries for 50 items)
**Effort:** 1.5 hours

**File:** `src/infrastructure/repositories/SqlitePriceTrackerRepository.ts` (Lines 491-550)

**Problem:**
```typescript
listItemPriceSummaries(limit = 50): ItemPriceSummary[] {
  const items = this.dataSource.queryAll(...)  // Query 1

  return items.map((item) => {
    const latestRow = this.dataSource.queryFirst(...)   // Query 2 per item
    const lowestRow = this.dataSource.queryFirst(...)   // Query 3 per item
  })
}
```

**Fix:** Use JOINs and window functions in a single query.

---

### 🟠 HIGH-3: State Update During Render (React Anti-pattern)

**Severity:** HIGH
**Impact:** React warnings, potential infinite loops
**Effort:** 1 hour

**Files:**
- `src/features/dashboard/yearly/YearlyBody.tsx` (Lines 94-104)
- `src/features/dashboard/all/AllBody.tsx` (Lines 185-189)

**Problem:** State updates during render phase:
```typescript
// WRONG - setState during render
if (!hasExpenseInitialized && defaultExpenseExpanded.size > 0) {
  setExpandedExpenseCategories(defaultExpenseExpanded)
  setHasExpenseInitialized(true)  // State update during render!
}
```

**Fix:** Move to `useEffect`:
```typescript
useEffect(() => {
  if (defaultExpenseExpanded.size > 0) {
    setExpandedExpenseCategories(defaultExpenseExpanded)
  }
}, [defaultExpenseExpanded])
```

---

### 🟠 HIGH-4: Missing Test Coverage for Critical Paths

**Severity:** HIGH
**Impact:** Bugs can ship undetected
**Effort:** 4+ hours (separate sprint)

**Critical Gaps:**
| File | Coverage | Risk |
|------|----------|------|
| `transaction.crud.ts` | 0% | CRUD operations untested |
| `transaction.model.ts` | 0% | Validation logic untested |
| `category.model.ts` | 0% | Category validation untested |
| `price-tracker.service.ts` | 0% | Business logic untested |

---

### 🟠 HIGH-5: Asset Projection Calculation Bug

**Severity:** HIGH
**Impact:** Incorrect financial projections shown to user
**Effort:** 1 hour

**File:** `src/core/services/asset/asset.service.ts` (Lines 250-259)

**Problems:**
1. `startMonthIndex` is calculated but never used (dead code)
2. No validation on `startYearMonth` format
3. Month calculation assumes January start

**Fix:** Remove dead code, add validation, fix month calculation.

---

## 3. Medium Priority Issues

### 🟡 MED-1: Inconsistent Error Handling Patterns

**Files:** Multiple repositories and services

**Problem:** Some methods throw, others return null silently.

**Examples:**
- `SqliteAccountRepository.ts:52` - throws error
- `SqliteCategoryRepository.ts:70` - returns null

**Recommendation:** Establish and document error handling conventions.

---

### 🟡 MED-2: Missing Accessibility Attributes

**Files:**
- `src/features/dashboard/yearly/YearlyBody.tsx` (Lines 401, 538)
- `src/features/dashboard/all/AllBody.tsx` (Lines 560, 697)
- `src/features/notifications/NotificationsScreen.tsx`

**Problem:** Pressable components missing `accessibilityLabel`, `accessibilityRole`.

---

### 🟡 MED-3: Theme Mode Resolution Order Mismatch

**File:** `src/shared/providers/HoHThemeProvider.tsx` (Lines 27-29)

**Problem:** Code differs from TODO comment:
```typescript
// TODO says: userMode ?? systemMode ?? initialMode ?? 'dark'
// Code does:  userMode ?? initialMode ?? systemMode ?? 'dark'
```

---

### 🟡 MED-4: Silent JSON Parsing Failures

**File:** `src/infrastructure/mappers/draft.mapper.ts` (Lines 46-54)

**Problem:** Corrupted JSON silently defaults to undefined with no logging.

---

### 🟡 MED-5: Store Settings Not Persisted

**Files:**
- `src/shared/store/settings.store.ts`
- `src/shared/store/tags.store.ts`
- `src/shared/store/quickChips.store.ts`

**Problem:** User preferences reset on app restart (in-memory only).

---

### 🟡 MED-6: Missing Index Exports (Barrel Files)

**Directories missing `index.ts`:**
- `/src/core/domain/` (parent)
- `/src/core/domain/common/`
- `/src/features/transactions/`
- `/src/features/transactions/add/`
- `/src/features/transactions/list/`

---

### 🟡 MED-7: Notification dismiss() Uses Wrong Column

**File:** `src/infrastructure/repositories/SqliteNotificationRepository.ts` (Line 125)

**Problem:** Uses `sender_avatar = '1'` as soft-delete flag instead of proper column.

---

### 🟡 MED-8: Race Condition in Price Tracker Sheet

**File:** `src/features/price-tracker/PriceTrackerScreen.tsx` (Lines 60-77)

**Problem:** Sheet presents before state updates complete.

---

## 4. Low Priority / Technical Debt

### 🔵 LOW-1: Missing Linting/Formatting Config
- No `.eslintrc` or `.prettierrc`
- No pre-commit hooks
- Type checking not in CI/CD

### 🔵 LOW-2: Unsafe Type Assertions
- `CategoryIcon.tsx:18` - icon name cast
- `AppBar.tsx` - route cast with `as any`

### 🔵 LOW-3: Magic Numbers in Styles
- `AppBar.tsx` uses hardcoded values instead of spacing tokens

### 🔵 LOW-4: Unused Code
- `startMonthIndex` in asset.service.ts
- Some components not exported from index.ts

### 🔵 LOW-5: Missing Migration Rollback
- Migrations only have `up()`, no `down()` for rollback

### 🔵 LOW-6: Repository Interface Inconsistency
- `SqliteNotificationRepository` doesn't implement interface
- `SqliteSuggestionsRepository` doesn't implement interface

---

## 5. Positive Findings

### ✅ Security
- **Zero SQL injection vulnerabilities** - All queries use parameterized statements
- Strong SQLite PRAGMA configuration (foreign keys, WAL mode)
- No sensitive data in client-side stores

### ✅ Architecture
- Domain layer is **100% pure** - no infrastructure imports
- Repository pattern correctly implemented
- Feature-first organization with clear boundaries
- Consistent file naming conventions

### ✅ Type Safety
- TypeScript strict mode enabled
- Excellent use of discriminated unions
- Zod schemas for runtime validation
- Proper readonly annotations

### ✅ Design System
- WCAG-compliant color contrast
- Comprehensive typography scale
- Pre-composed component styles
- Consistent spacing tokens

### ✅ Test Structure
- Well-organized test directories
- Excellent mapper coverage (100%)
- Good schema validation tests

### ✅ Database
- Mature migration system (23 migrations)
- Proper seed/fixture system
- Good constraint definitions

---

## 6. Recommended 8-Hour Action Plan

### Hour 1-2: Fix Memory Leaks (CRIT-1)

1. **AddTransactionScreen.tsx** - Add timeout refs and cleanup
2. **TransactionsScreen.tsx** - Add scroll timeout cleanup
3. **Toast.tsx** - Add auto-hide cleanup

```bash
# Files to edit:
src/features/transactions/add/AddTransactionScreen.tsx
src/features/transactions/list/TransactionsScreen.tsx
src/shared/components/Toast.tsx
```

### Hour 3: Add Error Boundaries (CRIT-2)

1. Wrap all route screens with `FeatureErrorBoundary`

```bash
# Files to edit:
src/app/(tabs)/index.tsx
src/app/(tabs)/transactions.tsx
src/app/(tabs)/price-tracker.tsx
src/app/notifications.tsx
src/app/(modal)/add-transaction.tsx
src/app/(modal)/edit-transaction.tsx
```

### Hour 4: Fix Tag Cleanup Bug (CRIT-3 + CRIT-4)

1. Add `deleteTags()` to repository interface
2. Implement `deleteTags()` in SqliteTransactionRepository
3. Update `transaction.crud.ts` to delete before save
4. Wrap `saveTags()` in transaction

```bash
# Files to edit:
src/core/domain/transaction/transaction.repository.ts
src/infrastructure/repositories/SqliteTransactionRepository.ts
src/core/services/transaction/transaction.crud.ts
```

### Hour 5-6: Fix Architecture Violations (HIGH-1)

1. Create missing service functions
2. Update feature hooks to use services

```bash
# Files to create/edit:
src/core/services/transaction/transaction.aggregations.ts (add functions)
src/features/dashboard/all/hooks/useAllTimeData.ts
src/features/dashboard/accounts/hooks/useAccountsData.ts
src/features/dashboard/monthly/category/useMonthlyCategorySpending.ts
src/features/dashboard/monthly/category/useMonthlyIncomeByCategory.ts
src/features/dashboard/yearly/hooks/useYearlyData.ts
```

### Hour 7: Fix React Anti-patterns (HIGH-3)

1. Fix state updates during render in YearlyBody.tsx
2. Fix state updates during render in AllBody.tsx

```bash
# Files to edit:
src/features/dashboard/yearly/YearlyBody.tsx
src/features/dashboard/all/AllBody.tsx
```

### Hour 8: Fix Asset Projection Bug + Testing (HIGH-5)

1. Remove dead code in asset.service.ts
2. Add input validation
3. Write quick unit tests for the fix

```bash
# Files to edit:
src/core/services/asset/asset.service.ts
__tests__/unit/services/asset.service.test.ts
```

---

## Post-Audit Recommendations

### Sprint 1 (Next Week)
- [ ] Add SQLite persistence to settings/tags/quickChips stores
- [ ] Fix N+1 query in price tracker
- [ ] Add missing barrel exports
- [ ] Add accessibility labels

### Sprint 2
- [ ] Add ESLint + Prettier configuration
- [ ] Add pre-commit hooks
- [ ] Add `tsc --noEmit` to CI
- [ ] Write tests for transaction.crud.ts (0% → 80%)

### Sprint 3
- [ ] Write tests for transaction.model.ts
- [ ] Write tests for category.model.ts
- [ ] Add integration tests
- [ ] Document error handling conventions

---

## Appendix: Files Analyzed

**Total Files Reviewed:** 329 source files

| Layer | Files | Issues Found |
|-------|-------|--------------|
| app/ | 12 | 2 |
| core/domain/ | 48 | 0 |
| core/services/ | 14 | 5 |
| features/ | 133 | 12 |
| infrastructure/ | 64 | 6 |
| shared/ | 66 | 4 |
| **Total** | **329** | **29** |

---

*Report generated 2026-03-30 by Code Audit Process*
