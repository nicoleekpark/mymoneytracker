# Problem Inventory

> Generated: 2026-06-14
> Analysis-only - No code modified

---

## Top 15 Issues by Impact

| Rank | Issue | Severity | Files | Risk |
|------|-------|----------|-------|------|
| 1 | Duplicated category section components (95% identical) | High | 2 | Safe |
| 2 | Duplicated getCategoryMeta/getSubcategoryMeta functions | High | 3 | Safe |
| 3 | Hardcoded backdrop colors with inconsistent opacity | High | 7 | Safe |
| 4 | Duplicated shadow styles (not using tokens) | High | 7 | Safe |
| 5 | 28 test failures (mock/assertion issues) | High | 2 | Risky |
| 6 | Hardcoded hex colors in transaction components | Med | 5 | Safe |
| 7 | Opacity values not using tokens | Med | 10+ | Safe |
| 8 | Large component files (1000+ lines) | Med | 3 | Risky |
| 9 | Duplicate EmptyState component in price-tracker | Med | 2 | Safe |
| 10 | 42 ESLint warnings (unused vars, any types) | Med | 25 | Safe |
| 11 | Hardcoded alignment widths (magic numbers) | Med | 5 | Safe |
| 12 | Missing screenshots referenced in README | Low | 1 | Safe |
| 13 | Duplicated modal handle dimensions | Low | 2 | Safe |
| 14 | No TODO/FIXME comments in code (clean) | - | - | - |
| 15 | Uncommitted changes on main branch | Low | 17 | Needs-human |

---

## Detailed Problem Catalog

### 1. DRY Violations

#### 1.1 Duplicated Category Section Components - HIGH

**Files:**
- `src/features/dashboard/monthly/category/MonthlyCategorySection.tsx` (241 lines)
- `src/features/dashboard/monthly/category/MonthlyIncomeSection.tsx` (242 lines)

**Issue:** These two files are ~95% identical. The only differences are:
- Hook called: `useMonthlyCategorySpending` vs `useMonthlyIncomeByCategory`
- Text label: "Spending" vs "Income"
- Section title: "Spending by Category" vs "Income by Category"

**Lines:** Entire files

**Severity:** High

**Risk:** Safe - Mechanical refactor

**Recommendation:** Extract to a single parameterized `CategorySection` component with props for hook, label, and title.

---

#### 1.2 Duplicated getCategoryMeta/getSubcategoryMeta Functions - HIGH

**Files:**
- `src/features/dashboard/monthly/category/MonthlyCategorySection.tsx:21-49`
- `src/features/dashboard/monthly/category/MonthlyIncomeSection.tsx:21-49`
- `src/features/dashboard/shared/CategoryAccordion.tsx:35-54`

**Issue:** Three files define identical helper functions. A shared utility already exists at `src/shared/format/category.ts` with the same functions.

**Severity:** High

**Risk:** Safe - Import existing utility

**Recommendation:** Remove duplicates and import from `@/shared/format/category`.

---

#### 1.3 Duplicate EmptyState Component - MEDIUM

**Files:**
- `src/shared/components/EmptyState.tsx` (full-featured)
- `src/features/price-tracker/components/EmptyState.tsx` (simplified)

**Issue:** Price-tracker has its own EmptyState that duplicates shared component functionality.

**Severity:** Medium

**Risk:** Safe

**Recommendation:** Remove price-tracker EmptyState, use shared component.

---

### 2. Hardcoded Values

#### 2.1 Hardcoded Backdrop Colors - HIGH

**Files and Lines:**
| File | Line | Value |
|------|------|-------|
| `shared/components/AmountKeypadSheet.tsx` | 217 | `rgba(0, 0, 0, 0.5)` |
| `features/transactions/add/components/DateTimePickerModal.tsx` | 146 | `rgba(0,0,0,0.6)` |
| `features/transactions/add/components/PaymentChipsReorderModal.tsx` | 112 | `rgba(0,0,0,0.5)` |
| `features/transactions/add/components/QuickChipsEditModal.tsx` | 232 | `rgba(0,0,0,0.5)` |
| `features/transactions/add/components/CategorySelectionModal.tsx` | 470 | `rgba(0,0,0,0.6)` |
| `features/transactions/add/components/SaveFAB.tsx` | 212 | `rgba(0, 0, 0, 0.85)` |
| `shared/components/AppBar.tsx` | 505 | `rgba(0,0,0,0.3)` |

**Issue:** At least 4 different opacity values (0.3, 0.5, 0.6, 0.85) used inconsistently.

**Severity:** High

**Risk:** Safe

**Recommendation:** Create backdrop constants in tokens:
```typescript
export const BACKDROP_LIGHT = 'rgba(0, 0, 0, 0.3)'
export const BACKDROP_MEDIUM = 'rgba(0, 0, 0, 0.5)'
export const BACKDROP_DARK = 'rgba(0, 0, 0, 0.6)'
```

---

#### 2.2 Hardcoded Hex Colors - MEDIUM

**Files and Lines:**
| File | Line | Value |
|------|------|-------|
| `features/transactions/add/AddTransactionScreen.tsx` | 262 | `#5A6A6A` |
| `features/transactions/add/components/QuickChipsEditModal.tsx` | 67, 108 | `#5A7A8A` |
| `features/transactions/add/components/QuickChipsEditModal.tsx` | 138 | `#5A6A6A` |
| `features/transactions/add/components/PaymentChipsReorderModal.tsx` | 51 | `#5A6A6A` |
| `src/app/_layout.tsx` | 132 | `#666` (fallback) |
| `features/dashboard/monthly/category/MonthlyCategorySection.tsx` | 40, 45 | `#666` (fallback) |
| `features/dashboard/monthly/category/MonthlyIncomeSection.tsx` | 40, 45 | `#666` (fallback) |

**Severity:** Medium

**Risk:** Safe

**Recommendation:** Define semantic tokens for these colors or use existing theme colors.

---

#### 2.3 Hardcoded Alignment Widths - MEDIUM

**Files and Lines:**
| File | Lines | Values |
|------|-------|--------|
| `MonthlyCategorySection.tsx` | 169, 174, 228, 233 | `width: 40`, `width: 20` |
| `MonthlyIncomeSection.tsx` | 164, 169, 223, 228 | `width: 40`, `width: 20` |
| `AllBody.tsx` | 666, 721, 808, 863 | `width: 40`, `width: 20` |
| `DateTimePickerModal.tsx` | 160 | `width: 40` |
| `CategorySelectionModal.tsx` | 485 | `width: 40` |

**Issue:** Magic numbers used for alignment (40 for percentage column, 20 for chevron).

**Severity:** Medium

**Risk:** Safe

**Recommendation:** Extract to named constants:
```typescript
const PERCENTAGE_COLUMN_WIDTH = 40
const CHEVRON_COLUMN_WIDTH = 20
```

---

#### 2.4 Modal Handle Dimensions - LOW

**Files and Lines:**
| File | Lines | Values |
|------|-------|--------|
| `DateTimePickerModal.tsx` | 159-161 | `width: 40, height: 5` |
| `CategorySelectionModal.tsx` | 484-486 | `width: 40, height: 5` |

**Issue:** Modal drag handle dimensions repeated.

**Severity:** Low

**Risk:** Safe

**Recommendation:** Use `modalStyles.dragHandle` from design system.

---

### 3. Shadow Duplication - HIGH

**Files with duplicated shadow properties:**

| File | Lines | Issue |
|------|-------|-------|
| `shared/components/AppBar.tsx` | 515 | Custom shadow |
| `shared/components/Toast.tsx` | 99-102 | Custom shadow |
| `features/transactions/add/components/SaveFAB.tsx` | 180-184, 192-196, 204-208 | 3 different shadows |
| `features/transactions/add/components/DraggableChipList.tsx` | 196 | Custom shadow |
| `features/transactions/list/components/DraftsFAB.tsx` | 74-78 | Custom shadow |
| `features/transactions/list/components/UndoToast.tsx` | 105-109 | Custom shadow |
| `features/dashboard/insights/InsightsBody.tsx` | 283 | Custom shadow |

**Issue:** `CARD_SHADOW` token exists at `src/shared/theme/tokens/shadow.ts` but is not consistently used.

**Severity:** High

**Risk:** Safe

**Recommendation:** Create additional shadow presets (FAB_SHADOW, TOAST_SHADOW) and use consistently.

---

### 4. Opacity Not Using Tokens - MEDIUM

**Files with hardcoded opacity:**
- `features/dashboard/assets/AssetsBody.tsx` (lines 305, 550, 645, 709, 756, 956, 958, 982, 991)
- `features/dashboard/all/AllBody.tsx` (lines 710-737, 852-879)
- `features/dashboard/monthly/category/MonthlyCategorySection.tsx` (lines 219, 220, 250)
- `features/dashboard/monthly/category/MonthlyIncomeSection.tsx` (lines 214, 215, 245)

**Issue:** Hardcoded `opacity: 0.5`, `opacity: 0.6`, etc. instead of using `opacity` tokens from `src/shared/theme/tokens/opacity.ts`.

**Severity:** Medium

**Risk:** Safe

**Recommendation:** Import and use `opacity.divider`, `opacity.muted`, etc.

---

### 5. Test Failures - HIGH

#### 5.1 Asset Service Tests (5 failures)

**File:** `__tests__/unit/services/asset.service.test.ts`

**Root Cause:** `accountRepository` is undefined because mock is not properly configured.

**Severity:** High

**Risk:** Risky - Need to verify mock setup

**Lines:** Test file mock configuration

---

#### 5.2 Currency Format Tests (2 failures)

**File:** `__tests__/unit/format.currency.test.ts`

**Root Cause:** Rounding behavior assertions don't match implementation.

**Expected vs Actual:**
- `formatCompactUsd(450.4)`: Expected `$450`, got `$450.40`
- `formatSignedUsdCompact(999.9)`: Expected `+$1.0k`, got `+$999.90`

**Severity:** High

**Risk:** Risky - Need to decide correct behavior

---

### 6. ESLint Warnings - MEDIUM

#### 6.1 Unused Variables (28 warnings)

**Files with unused variables:**

| File | Variables |
|------|-----------|
| `_layout.tsx` | `router` |
| `asset.model.ts` | `FamilyMemberRole` |
| `asset.service.ts` | `createEmptySummary`, `Account`, `isInvestmentAccountKind`, `getInvestmentAccountBalance` |
| `transaction.insights.ts` | `_month` |
| `AddAccountScreen.tsx` | `insets` |
| `EditAccountScreen.tsx` | `keyboardVisible` |
| `AddAssetScreen.tsx` | `AssetCategoryMeta`, `ASSET_CATEGORIES`, `letterSpacing` |
| `useAssetsData.ts` | `isLiquidifiableCategory`, `isCurrentMonth`, `isMultiMember`, `fieldTotal` |
| `InsightsBody.tsx` | `letterSpacing`, `volatilityInsight` |
| `NetSparkline.tsx` | `areaPath` |
| `useInsightsData.ts` | `driverConfidence` |
| `MonthlyBody.tsx` | `loadingDaily`, `loadingBudget` |
| `MonthlyCashflowChart.tsx` | `useMemo` |
| `NotificationsScreen.tsx` | `renderDraftsSummary` |
| `ItemPriceHistorySheet.tsx` | `index` |
| `AddTransactionScreen.tsx` | `insets` |
| `AnimatedQuickChip.tsx` | `borderColor` |
| `ItemizedSection.tsx` | `editingPriceCents`, `editingPriceCentsText`, `setEditingPriceCentsText`, `commitGhostRow` |
| `PaymentChipsReorderModal.tsx` | `CategoryIcon` |
| `DashboardHeader.tsx` | `fontWeight` |

**Severity:** Medium

**Risk:** Safe

---

#### 6.2 Explicit Any Types (10 warnings)

**Files:**
- `AddAccountScreen.tsx:411`
- `AddAssetScreen.tsx:319`
- `AccountSettingsSheet.tsx:88`
- `MonthlyCategorySection.tsx:54`
- `category.utils.ts:25, 31`
- `useMonthlyCategorySpending.ts:122`
- `useMonthlyIncomeByCategory.ts:122`
- `DashboardHeader.tsx:222`
- `NotificationsScreen.tsx:237`

**Severity:** Medium

**Risk:** Safe

---

### 7. Large Files - MEDIUM

| File | Lines | Issue |
|------|-------|-------|
| `AssetsBody.tsx` | 1,017 | Multiple sections, info sheets, breakdown logic |
| `AllBody.tsx` | 911 | Multiple sections with inline styles |
| `AccountsBody.tsx` | 681 | Account grouping, sorting, display logic |
| `AddTransactionScreen.tsx` | ~900 | Form state, validation, keypad, modals |
| `CategorySelectionModal.tsx` | ~500 | Category list, search, selection |

**Severity:** Medium

**Risk:** Risky - Refactoring large components requires careful testing

**Recommendation:** Extract sub-components for each logical section.

---

### 8. Documentation Issues - LOW

#### 8.1 Missing Screenshots

**File:** `README.md`

**Issue:** References 9 screenshots in `assets/screenshots/` that don't exist:
- `hero.png`
- `dashboard-monthly.png`
- `dashboard-yearly.png`
- `dashboard-all.png`
- `add-transaction.png`
- `category-picker.png`
- `quick-chips.png`
- `insights.png`
- `budget-alert.png`

**Severity:** Low

**Risk:** Safe

---

### 9. Dead Code / Unused Imports

**Files with significant dead code:**

| File | Item | Type |
|------|------|------|
| `asset.service.ts` | `isInvestmentAccountKind` function | Unused function |
| `asset.service.ts` | `getInvestmentAccountBalance` function | Unused function |
| `NotificationsScreen.tsx` | `renderDraftsSummary` function | Unused function |
| `ItemizedSection.tsx` | `commitGhostRow` function | Unused function |

**Severity:** Low

**Risk:** Safe - Can be deleted

---

### 10. Architecture Concerns

#### 10.1 Tamagui Not Used Despite Rule

**Issue:** CLAUDE.md component rules mention using Tamagui (`XStack`, `YStack`, `Text`), but the codebase uses React Native's `View` and `Text` with StyleSheet.

**Files:** Component rules at `.claude/rules/components.md`

**Severity:** Low (documentation inconsistency, not code issue)

**Risk:** Safe - Update docs or remove Tamagui references

---

## Summary by Severity

| Severity | Count | Description |
|----------|-------|-------------|
| High | 6 | DRY violations, test failures, hardcoded values |
| Medium | 8 | Unused code, any types, large files, opacity |
| Low | 4 | Documentation, minor duplications |
