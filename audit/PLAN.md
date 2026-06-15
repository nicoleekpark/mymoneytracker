# Proposed Execution Plan

> Generated: 2026-06-14
> **Status:** Awaiting approval before execution

---

## Overview

This plan addresses issues identified in PROBLEMS.md, organized into three phases:
1. **Phase 1: DRY + Design Tokens** - Eliminate duplication, consolidate to tokens
2. **Phase 2: Best Practices + Readability** - Fix warnings, reduce file sizes
3. **Phase 3: Documentation** - Update docs to match code

**Estimated Changes:** ~50 files
**Risk Level:** Low to Medium (mostly mechanical refactors)

---

## Phase 1: DRY + Design Tokens

### 1.1 Extract MonthlyCategorySection Component

**Priority:** High
**Risk:** Safe
**Files:** 3 files modified, 1 deleted

| Before | After |
|--------|-------|
| `MonthlyCategorySection.tsx` (241 lines) | `CategoryBreakdownSection.tsx` (parameterized) |
| `MonthlyIncomeSection.tsx` (242 lines) | Deleted (merged into above) |

**Intent:** Merge two 95% identical components into one parameterized component.

**Changes:**
- Create `src/features/dashboard/monthly/category/CategoryBreakdownSection.tsx`
- Add props: `type: 'spending' | 'income'`, `hook`, `title`
- Delete `MonthlyIncomeSection.tsx`
- Update `MonthlyBody.tsx` imports

---

### 1.2 Remove Duplicate getCategoryMeta Functions

**Priority:** High
**Risk:** Safe
**Files:** 3 files modified

| Before | After |
|--------|-------|
| Local `getCategoryMeta()` in 3 files | Import from `@/shared/format/category` |

**Files to modify:**
- `src/features/dashboard/monthly/category/MonthlyCategorySection.tsx`
- `src/features/dashboard/monthly/category/MonthlyIncomeSection.tsx`
- `src/features/dashboard/shared/CategoryAccordion.tsx`

**Intent:** Delete local functions (lines 21-49), import existing shared utility.

---

### 1.3 Create Backdrop Color Constants

**Priority:** High
**Risk:** Safe
**Files:** 8 files modified, 1 token file added

**New Token File:** `src/shared/theme/tokens/backdrop.ts`

```typescript
export const BACKDROP = {
  light: 'rgba(0, 0, 0, 0.3)',
  medium: 'rgba(0, 0, 0, 0.5)',
  dark: 'rgba(0, 0, 0, 0.6)',
  heavy: 'rgba(0, 0, 0, 0.85)',
} as const
```

**Files to update:**
- `src/shared/components/AmountKeypadSheet.tsx` → `BACKDROP.medium`
- `src/features/transactions/add/components/DateTimePickerModal.tsx` → `BACKDROP.dark`
- `src/features/transactions/add/components/PaymentChipsReorderModal.tsx` → `BACKDROP.medium`
- `src/features/transactions/add/components/QuickChipsEditModal.tsx` → `BACKDROP.medium`
- `src/features/transactions/add/components/CategorySelectionModal.tsx` → `BACKDROP.dark`
- `src/features/transactions/add/components/SaveFAB.tsx` → `BACKDROP.heavy`
- `src/shared/components/AppBar.tsx` → `BACKDROP.light`
- `src/shared/theme/tokens/index.ts` → Export new file

---

### 1.4 Create Additional Shadow Presets

**Priority:** High
**Risk:** Safe
**Files:** 8 files modified, 1 token file updated

**Update:** `src/shared/theme/tokens/shadow.ts`

```typescript
export const FAB_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 6,
}

export const TOAST_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 4,
}
```

**Files to update:**
- `src/features/transactions/add/components/SaveFAB.tsx` → Use `FAB_SHADOW`
- `src/features/transactions/list/components/DraftsFAB.tsx` → Use `FAB_SHADOW`
- `src/shared/components/Toast.tsx` → Use `TOAST_SHADOW`
- `src/features/transactions/list/components/UndoToast.tsx` → Use `TOAST_SHADOW`

---

### 1.5 Remove Duplicate EmptyState

**Priority:** Medium
**Risk:** Safe
**Files:** 2+ files modified, 1 deleted

| Before | After |
|--------|-------|
| `src/features/price-tracker/components/EmptyState.tsx` | Deleted |
| Uses of local EmptyState | Import from `@/shared/components` |

---

### 1.6 Extract Alignment Width Constants

**Priority:** Medium
**Risk:** Safe
**Files:** 5 files modified

**Add to existing file or create new:**
```typescript
// In relevant shared location
export const LAYOUT = {
  percentageColumnWidth: 40,
  chevronColumnWidth: 20,
} as const
```

---

## Phase 2: Best Practices + Readability

### 2.1 Fix ESLint Warnings - Unused Variables

**Priority:** Medium
**Risk:** Safe
**Files:** 18 files

**Action:** Remove or prefix with `_` for intentionally unused parameters.

**High-value targets:**
| File | Variables to Remove |
|------|---------------------|
| `asset.service.ts` | `createEmptySummary`, `Account`, `isInvestmentAccountKind`, `getInvestmentAccountBalance` |
| `NotificationsScreen.tsx` | `renderDraftsSummary` |
| `ItemizedSection.tsx` | `editingPriceCents`, `editingPriceCentsText`, `setEditingPriceCentsText`, `commitGhostRow` |

---

### 2.2 Fix ESLint Warnings - Explicit Any Types

**Priority:** Medium
**Risk:** Safe
**Files:** 8 files

**Action:** Replace `any` with proper types or `unknown`.

**Files:**
- `AddAccountScreen.tsx:411`
- `AddAssetScreen.tsx:319`
- `AccountSettingsSheet.tsx:88`
- `category.utils.ts:25, 31`
- `DashboardHeader.tsx:222`
- etc.

---

### 2.3 Replace Hardcoded Opacity Values

**Priority:** Medium
**Risk:** Safe
**Files:** 10+ files

**Action:** Import `opacity` from `@/shared/theme/tokens/opacity` and use semantic values.

---

### 2.4 Use Modal Handle from Design System

**Priority:** Low
**Risk:** Safe
**Files:** 2 files

**Action:** Replace inline `width: 40, height: 5` with `modalStyles.dragHandle`.

---

## Phase 3: Documentation

### 3.1 Update Component Rules

**Priority:** High
**Risk:** Safe
**Files:** 1 file

**File:** `.claude/rules/components.md`

**Change:** Remove Tamagui references, document actual StyleSheet patterns.

---

### 3.2 Remove/Update Screenshot References

**Priority:** Medium
**Risk:** Safe
**Files:** 1 file

**File:** `README.md`

**Option A:** Add screenshots to `assets/screenshots/`
**Option B:** Comment out image references with "TODO: Add screenshots"

---

### 3.3 Update Test Coverage Documentation

**Priority:** Low
**Risk:** Safe
**Files:** 2 files

**Files:**
- `README.md` - Note current test status
- `docs/guides/testing.md` - Update coverage numbers

---

## DO NOT AUTO-APPLY — Needs Approval

The following changes require explicit approval before execution:

### A. Test Fixes (Risky)

**Files:**
- `__tests__/unit/services/asset.service.test.ts`
- `__tests__/unit/format.currency.test.ts`

**Risk:** These test failures could indicate:
1. Missing mock configuration (likely)
2. Behavior changes that broke tests (possible)
3. Intentional behavior changes with outdated tests (possible)

**Recommendation:** Review failures manually before fixing.

---

### B. Large File Refactoring (Risky)

**Files:**
- `src/features/dashboard/assets/AssetsBody.tsx` (1,017 lines)
- `src/features/dashboard/all/AllBody.tsx` (911 lines)
- `src/features/dashboard/accounts/AccountsBody.tsx` (681 lines)

**Risk:** Component extraction may introduce bugs. Each section has:
- Complex state management
- Multiple info sheets
- Inline calculations

**Recommendation:** Only refactor after Phase 1 & 2 complete, with comprehensive testing.

---

### C. Dead Code Removal

**Files with potentially dead functions:**
| File | Function | Status |
|------|----------|--------|
| `asset.service.ts` | `isInvestmentAccountKind` | Unused - safe to delete? |
| `asset.service.ts` | `getInvestmentAccountBalance` | Unused - safe to delete? |
| `NotificationsScreen.tsx` | `renderDraftsSummary` | Unused - safe to delete? |
| `ItemizedSection.tsx` | `commitGhostRow` | Unused - safe to delete? |

**Recommendation:** Confirm these are not called via reflection or dynamic imports.

---

### D. Behavior-Affecting Changes

None identified. All Phase 1-3 changes are style/organization only.

---

## Needs Human Context

### 1. FamilyMemberRole Type

**File:** `src/core/domain/asset/asset.model.ts:7`

**Question:** The `FamilyMemberRole` type is defined but unused. Is this:
- v2 preparation (keep it)
- Dead code (delete it)
- Recently orphaned (check git history)

---

### 2. Test Assertion Behavior

**File:** `__tests__/unit/format.currency.test.ts`

**Question:** Test expects `formatCompactUsd(450.4)` to return `$450`, but implementation returns `$450.40`. Which is correct?

- If test is correct → Fix implementation
- If implementation is correct → Fix test

---

### 3. Asset Service Mock Setup

**File:** `__tests__/unit/services/asset.service.test.ts`

**Question:** Tests fail because `accountRepository` is undefined. Need to determine:
- Is the mock incomplete?
- Was `accountRepository` recently added to the service?
- Should tests mock `accountRepository`?

---

### 4. Uncommitted Changes

**Status:** 17 modified files, 3 new files on main branch

**Question:** Should these be:
- Committed before refactoring
- Reviewed and potentially reverted
- Included in first phase changes

---

## Execution Order

```
1. Commit or stash uncommitted changes
2. Phase 1.1-1.2 (Category component consolidation)
3. Phase 1.3-1.4 (Token creation for backdrop/shadows)
4. Run tests, verify no regressions
5. Phase 1.5-1.6 (Minor DRY fixes)
6. Run tests again
7. Phase 2.1-2.2 (ESLint fixes)
8. Phase 2.3-2.4 (Opacity/modal tokens)
9. Run full test suite
10. Phase 3 (Documentation)
11. Final typecheck + lint + test
```

---

## Metrics

| Metric | Before | After (Est.) |
|--------|--------|--------------|
| ESLint Errors | 1 | 0 |
| ESLint Warnings | 42 | <10 |
| Duplicated Files | 2 | 0 |
| Hardcoded Colors | ~15 | 0 |
| Hardcoded Shadows | ~7 | 0 |
| Test Failures | 28 | TBD (needs investigation) |
