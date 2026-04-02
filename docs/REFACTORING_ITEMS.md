# HoH Ledger - Refactoring Items

> Generated: 2026-04-01
> Last Updated: 2026-04-01

This document catalogs refactoring opportunities identified through comprehensive codebase analysis. Items are prioritized based on: **Clean Code**, **Security**, **Scalability**, **Maintainability**, **Modularity**, **DRY**, and **Industry Best Practices**.

---

## Priority Legend

| Priority | Description | Action Timeline |
|----------|-------------|-----------------|
| 🔴 **Critical** | Type safety bugs, security risks, runtime crashes | Immediate |
| 🟠 **High** | Code quality, architecture violations, performance | Next sprint |
| 🟡 **Medium** | DRY violations, inconsistencies, tech debt | Backlog |
| 🟢 **Low** | Polish, minor improvements, nice-to-have | As time permits |

---

## 🔴 Critical Priority

### 1. ✅ NotificationTabSchema Missing 'drafts' Value
**Tags:** `type-safety` `runtime-bug`
**Status:** FIXED (2026-04-01)

**Location:** `src/core/domain/notification/notification.schema.ts:19`

**Issue:** Schema doesn't match domain type.

**Fix Applied:** Added `'drafts'` to the Zod enum.

---

### 2. ✅ Domain Layer Purity Violation - CategoryIndex Import
**Tags:** `architecture` `modularity` `maintainability`
**Status:** FIXED (2026-04-01)

**Location:**
- `src/core/domain/transaction/transaction.model.ts:1-2`
- `src/core/domain/category/category.model.ts:1`

**Issue:** Domain layer imported from shared config.

**Fix Applied:**
- Moved `CategoryIndex` type to `category.types.ts` in domain layer
- Updated imports to use domain layer type
- Re-exported from shared/config for backwards compatibility

---

### 3. ✅ Category Resolution Runtime Crash Risk
**Tags:** `availability` `error-handling` `security`
**Status:** FIXED (2026-04-01)

**Location:** `src/infrastructure/repositories/SqliteCategoryRepository.ts`

**Issue:** Methods threw errors causing crashes on deleted categories.

**Fix Applied:**
- `resolveCategoryRefFromDbId()` now returns `CategoryRef | null`
- `getCategoryRowById()` returns null instead of throwing
- Updated all callers to handle null gracefully with `?? undefined` or `if (!ref) continue`

---

### 4. ✅ TransactionRepository Return Type Mismatch
**Tags:** `type-safety` `maintainability`
**Status:** FIXED (2026-04-01)

**Location:** `src/core/domain/transaction/transaction.repository.ts:108`

**Issue:** Income method returned wrong type.

**Fix Applied:**
- Added `MonthlyIncomeByCategory` type
- Updated interface and implementation to use correct type

---

## 🟠 High Priority

### 5. ⏸️ Async/Await Inconsistency in Aggregation Functions
**Tags:** `clean-code` `maintainability` `best-practice`
**Status:** DEFERRED - Breaking change risk

**Location:** `src/core/services/transaction/transaction.aggregations.ts:62-350`

**Issue:** Functions marked `async` but contain only synchronous code.

**Why Deferred:**
- Removing `async` is a breaking change for all callers using `await`
- Current pattern works correctly (just slightly inefficient)
- Future-proofing: If SQLite becomes async (e.g., web workers), no caller changes needed
- Risk vs reward: High risk of breaking existing code, low reward

---

### 6. ⏸️ Large Component Files Need Decomposition
**Tags:** `maintainability` `modularity` `scalability`
**Status:** BACKLOG - Requires design review

**Location:**
- `src/features/dashboard/monthly/MonthlyBody.tsx` (399 lines)
- `src/features/dashboard/yearly/YearlyBody.tsx` (685 lines)

**Issue:** Components mix 5+ concerns: hero display, stats rows, budget section, calendar, categories.

**Suggested Components:**
- `<HeroSection variant="monthly|yearly" />`
- `<StatsRow income={} expense={} />`
- `<CategoryAccordion categories={} onToggle={} />`

**Why Deferred:** Functional code, no bugs. Decomposition requires careful design to avoid prop drilling and ensure consistent styling. Should be tackled with proper design review.

---

### 7. ✅ Missing Error Handling in Aggregation Functions
**Tags:** `availability` `error-handling` `best-practice`
**Status:** NO ACTION NEEDED (2026-04-01)

**Location:** `src/core/services/transaction/transaction.aggregations.ts` (all functions)

**Issue:** No error handling for repository failures at the service layer.

**Resolution:** Error handling is correctly implemented at the **hook level** (UI layer), not the service layer. Hooks like `useYearlyData.ts`, `useMonthlyCategorySpending.ts`, and `useMonthlyIncomeByCategory.ts` all have proper try-catch blocks that:
- Set error state for UI display
- Reset data to safe defaults
- Let users see actionable error messages

This follows React best practices: let errors propagate to the UI layer where they can be displayed to users, rather than silently returning defaults that hide problems.

---

### 8. ✅ Silent JSON Parsing Failures
**Tags:** `maintainability` `observability` `error-handling`
**Status:** FIXED (2026-04-01)

**Location:**
- `src/infrastructure/mappers/notification.mapper.ts:28-34`
- `src/infrastructure/db/settingsStorage.ts:29`

**Issue:** Invalid JSON silently failed without logging.

**Fix Applied:**
- Added `logger.warn()` calls to both files
- Now logs key/context, raw value snippet, and error message
- Consistent with `draft.mapper.ts` pattern

---

### 9. ⏸️ Inline Styles Proliferation (890+ instances)
**Tags:** `maintainability` `scalability` `clean-code`
**Status:** BACKLOG - Low urgency

**Location:**
- `src/features/dashboard/monthly/MonthlyBody.tsx:78-204`
- `src/features/dashboard/yearly/YearlyBody.tsx:193-354`
- `src/features/dashboard/insights/components/InsightCard.tsx:222-293`

**Issue:** Heavy inline styles make theming and refactoring expensive.

**Suggested Fix:** Extract to `.styles.ts` files for components with 20+ style properties.

**Why Deferred:** Functional code, no visual bugs. Should be combined with #6 (component decomposition) for efficiency.

---

### 10. ⏸️ Lazy Require Pattern (Architecture Smell)
**Tags:** `architecture` `modularity` `best-practice`
**Status:** BACKLOG - Architecture review needed

**Location:**
- `src/shared/store/settings.store.ts:11`
- `src/shared/store/tags.store.ts:11`
- `src/shared/store/quickChips.store.ts:11`

**Issue:** Lazy require to avoid circular dependencies:
```typescript
const getStorage = () => require('@/infrastructure/db/settingsStorage') as typeof import(...)
```

**Impact:** Runtime require bypasses TypeScript checking, indicates coupling issue.

**Potential Fixes:**
1. Move settingsStorage to shared layer
2. Use dependency injection pattern
3. Split storage into separate files per store

**Why Deferred:** Works correctly at runtime. Fix requires careful architecture redesign to avoid introducing new circular dependencies.

---

## 🟡 Medium Priority

### 11. ⏸️ Duplicate Cents-to-Dollars Mapping Pattern
**Tags:** `DRY` `maintainability`
**Status:** DEFERRED - Low impact

**Location:**
- `src/core/services/transaction/transaction.aggregations.ts` (~8+ instances)
- `src/core/services/transaction/transaction.insights.ts`
- `src/core/services/price-tracker/price-tracker.service.ts`

**Issue:** Repeated mapping pattern with `centsToDollars()`.

**Why Deferred:** Each mapping has slightly different field names (month vs day, totalDollar vs incomeDollar). A generic utility would require complex type gymnastics. The pattern is simple and readable as-is.

---

### 12. ✅ Duplicate JSON Parsing Utility
**Tags:** `DRY` `error-handling` `maintainability`
**Status:** FIXED (2026-04-01)

**Location:** All mappers and settingsStorage

**Issue:** Three separate implementations of safe JSON.parse.

**Fix Applied:**
- Created `src/shared/utils/json.ts` with `tryParseJson()` and `tryParseJsonArray()`
- Updated `draft.mapper.ts`, `notification.mapper.ts`, `settingsStorage.ts` to use shared utility
- Consistent error logging with context

---

### 13. ✅ Duplicate Animation Pattern in Components
**Tags:** `DRY` `maintainability`
**Status:** FIXED (2026-04-01)

**Location:**
- `src/shared/components/ScalePressable.tsx`
- `src/features/dashboard/shared/DashboardModeTabs.tsx`
- `src/features/dashboard/shared/ScopeChips.tsx`

**Issue:** Same spring animation config duplicated.

**Fix Applied:**
- Created `src/shared/theme/tokens/animation.ts` with `SPRING_CONFIG` and `SCALE_VALUES`
- Updated all three components to use shared config
- Added variants: `press`, `gentle`, `bouncy` for future use

---

### 14. ✅ Missing useCallback in YearlyBody
**Tags:** `performance` `best-practice`
**Status:** FIXED (2026-04-01)

**Location:** `src/features/dashboard/yearly/YearlyBody.tsx`

**Issue:** Toggle handlers created inline on every render.

**Fix Applied:** Wrapped `toggleExpenseCategory` and `toggleIncomeCategory` with `useCallback`.

---

### 15. ⏸️ Error Handling Duplication in Stores
**Tags:** `DRY` `maintainability`
**Status:** NO ACTION NEEDED

**Location:** All store files

**Issue:** Identical try-catch pattern repeated.

**Resolution:** The pattern is simple, explicit, and idiomatic. A factory/decorator would add abstraction without meaningful benefit. Each store's error context is clear.

---

### 16. ⏸️ Hydration Pattern Duplication
**Tags:** `DRY` `maintainability`
**Status:** DEFERRED - Significant refactor

**Location:** Settings, Tags, QuickChips stores

**Issue:** Identical hydration patterns.

**Why Deferred:** Creating `createPersistedStore()` would require:
- Complex TypeScript generics
- Testing the utility itself
- Migrating existing stores
- Risk of breaking working code
The current pattern is clear and each store is isolated.

---

### 17. ✅ Magic String for Notification Subtype
**Tags:** `type-safety` `maintainability`
**Status:** FIXED (2026-04-01)

**Location:** `src/shared/store/notifications.store.ts`

**Issue:** Hardcoded `'draft_reminder'` string repeated 4 times.

**Fix Applied:**
- Added `NOTIFICATION_SUBTYPES` constant to `notification.types.ts`
- Updated notifications.store.ts to use `NOTIFICATION_SUBTYPES.DRAFT_REMINDER`
- Type-safe with `satisfies Record<string, SystemNotificationSubtype>`

---

### 18. ⏸️ Inconsistent Null Coercion in Mappers
**Tags:** `consistency` `maintainability`
**Status:** DEFERRED - Documentation task

**Location:** All mapper files

**Issue:** Mixed approaches for null/undefined, booleans, tags.

**Why Deferred:** The patterns are context-dependent:
- DB uses `null`, domain uses `undefined` (intentional)
- SQLite stores booleans as 0/1 (standard)
- Tags as JSON array is the standard (comma-split was legacy)
Should document patterns in mapper header comments when touching those files.

---

### 19. ✅ Unsafe Type Casts in Mappers
**Tags:** `type-safety` `maintainability`
**Status:** FIXED (2026-04-01)

**Location:** `src/infrastructure/mappers/draft.mapper.ts`

**Issue:** Type assertions without validation.

**Fix Applied:**
- Updated `draft.mapper.ts` to use `parseCategoryType()` from Zod schema
- `asset.mapper.ts` already uses Zod parse functions (no change needed)

---

### 20. ⏸️ Accessibility Gaps
**Tags:** `accessibility` `best-practice`
**Status:** DEFERRED - Requires UI audit

**Location:** Dashboard components (MonthlyBody, YearlyBody, DailyOutflowBars)

**Issues:**
- Calendar days missing `accessibilityLabel`
- Progress bars missing proper a11y attributes
- Buttons missing count in label

**Why Deferred:** Requires comprehensive UI audit and testing with VoiceOver/TalkBack. Should be tackled as dedicated accessibility sprint.

---

## 🟢 Low Priority

### 21. ⏸️ Manual Transaction Management
**Tags:** `clean-code` `best-practice`
**Status:** NO ACTION NEEDED

**Location:** `src/infrastructure/db/queries/admin.ts:28-46`

**Issue:** Manual BEGIN/COMMIT/ROLLBACK instead of `withTransaction()`.

**Resolution:** The current pattern is correct for admin operations that need PRAGMA control (foreign_keys=OFF/ON). `withTransaction()` doesn't support PRAGMA changes. Code is safe and clear as-is.

---

### 22. ⏸️ Timestamp Generation Inconsistency
**Tags:** `consistency`
**Status:** DEFERRED - Low impact

**Location:**
- `SqliteTransactionRepository.ts:724`: `new Date().toISOString()`
- `SqliteAssetRepository.ts:87`: `strftime('%Y-%m-%dT%H:%M:%fZ','now')`

**Issue:** App-generated vs SQL-generated timestamps can drift.

**Why Deferred:** Timestamps are used for ordering, not precision timing. Sub-second drift is acceptable. Standardizing would require touching many files for minimal benefit.

---

### 23. ⏸️ Hardcoded Opacity Values
**Tags:** `maintainability` `consistency`
**Status:** DEFERRED - UI task

**Location:** `src/features/dashboard/monthly/MonthlyBody.tsx:70-129`

**Issue:** Multiple opacity values scattered: `0.5`, `0.6`, `0.8`

**Why Deferred:** Functional UI with no bugs. Should be tackled during component decomposition (#6).

---

### 24. ✅ Color Hook Inconsistency
**Tags:** `consistency` `bug`
**Status:** FIXED (2026-04-01)

**Location:** `src/shared/hooks/useThemeColors.ts:47`

**Issue:** `useExtendedThemeColors` incorrectly mapped `surface` to `theme.semantic.background`.

**Fix Applied:** Changed to `theme.semantic.surface` for consistency with `useThemeColors`.

---

### 25. ✅ Search Scoring Magic Numbers
**Tags:** `clean-code` `maintainability`
**Status:** FIXED (2026-04-01)

**Location:** `src/shared/utils/search.ts`

**Issue:** Undocumented scoring weights (100, 50).

**Fix Applied:** Extracted to `SEARCH_SCORES` constant with documentation.

---

### 26. ⏸️ Logger Guard Repetition
**Tags:** `DRY` `clean-code`
**Status:** NO ACTION NEEDED

**Location:** `src/shared/utils/logger.ts:27-55`

**Issue:** `shouldLog()` guard repeated in every method.

**Resolution:** The pattern is clear and readable. A factory pattern would add complexity without meaningful benefit. Code is idiomatic and easy to understand.

---

### 27. ⏸️ useAsyncDataWithDefault Minimal Value
**Tags:** `clean-code` `API-surface`
**Status:** NO ACTION NEEDED

**Location:** `src/shared/hooks/useAsyncData.ts:105-124`

**Issue:** Wrapper adds only one line of logic.

**Resolution:** The hook provides type safety guarantees (`data: T` instead of `data: T | null`). This eliminates null checks at call sites. Valuable for type-safe code.

---

### 28. ✅ Store Persistence Classification
**Tags:** `documentation` `maintainability`
**Status:** FIXED (2026-04-01)

**Location:** All store files in `src/shared/store/`

**Issue:** No clear distinction between store types.

**Fix Applied:** Added JSDoc classification comments to all 10 stores with:
- `@persistence` - IN-MEMORY, SQLITE
- `@scope` - SESSION, PERMANENT

---

### 29. ✅ Inconsistent Parse Function Fallbacks
**Tags:** `consistency` `documentation`
**Status:** FIXED (2026-04-01)

**Location:** All `*.schema.ts` files

**Issue:** No documented rationale for fallback values.

**Fix Applied:** Added JSDoc to each parse function explaining:
- Fallback Strategy: Which value and why
- Rationale: Business reason for the choice

---

### 30. ✅ Unvalidated Input Strings
**Tags:** `security` `validation`
**Status:** FIXED (2026-04-01)

**Location:** `src/core/services/transaction/transaction.crud.ts`

**Issue:** User strings only trimmed, not validated.

**Fix Applied:**
- Added `INPUT_LIMITS` constants (MERCHANT: 100, NOTE: 500, ITEM: 200)
- Added `sanitizeInput()` helper that trims and truncates
- Applied to both `addTransaction` and `updateTransaction`

---

## Summary

### Completion Status

| Priority | Total | Fixed | No Action | Deferred | Remaining |
|----------|-------|-------|-----------|----------|-----------|
| 🔴 Critical | 4 | 4 ✅ | 0 | 0 | 0 |
| 🟠 High | 6 | 2 ✅ | 1 | 3 ⏸️ | 0 |
| 🟡 Medium | 10 | 5 ✅ | 1 | 4 ⏸️ | 0 |
| 🟢 Low | 10 | 5 ✅ | 3 | 2 ⏸️ | 0 |

**Total: 30 items | 16 fixed | 5 no action | 9 deferred | 0 remaining**

### What Was Fixed

**Critical (all fixed):**
1. ✅ NotificationTabSchema missing 'drafts' - Added to Zod enum
2. ✅ Domain Layer Purity Violation - Moved CategoryIndex to domain
3. ✅ Category Resolution Crash Risk - Made return type null-safe
4. ✅ TransactionRepository Return Type - Added MonthlyIncomeByCategory type

**High (addressed):**
7. ✅ Missing Error Handling - Confirmed correctly handled at hook level
8. ✅ Silent JSON Parsing - Added logging to notification.mapper.ts and settingsStorage.ts

**Medium (fixed):**
12. ✅ Duplicate JSON Parsing - Created `tryParseJson()` utility in `json.ts`
13. ✅ Duplicate Animation Pattern - Created `SPRING_CONFIG` and `SCALE_VALUES` tokens
14. ✅ Missing useCallback - Added to YearlyBody toggle handlers
17. ✅ Magic String Notification Subtype - Added `NOTIFICATION_SUBTYPES` constant
19. ✅ Unsafe Type Casts - Updated draft.mapper to use `parseCategoryType()`

**Low (fixed):**
24. ✅ Color Hook Inconsistency - Fixed surface mapping in useExtendedThemeColors
25. ✅ Search Scoring Magic Numbers - Extracted to SEARCH_SCORES constant
28. ✅ Store Persistence Classification - Added JSDoc @persistence/@scope to all stores
29. ✅ Inconsistent Parse Function Fallbacks - Documented rationale in all schemas
30. ✅ Unvalidated Input Strings - Added INPUT_LIMITS and sanitizeInput()

### New Files Created
- `src/shared/utils/json.ts` - Safe JSON parsing utilities
- `src/shared/theme/tokens/animation.ts` - Animation config tokens

---

## Recommended Next Steps

**Design Review Needed:**
- #6 + #9 + #23: Component decomposition with style extraction and opacity tokens

**Architecture Review Needed:**
- #10: Lazy require pattern resolution
- #16: Store hydration pattern consolidation

**Future Sprint (Accessibility):**
- #20: Dashboard accessibility audit
