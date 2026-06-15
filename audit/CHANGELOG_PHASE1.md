# Phase 1 Changelog: DRY + Design Tokens

> Generated: 2026-06-15
> Branch: `refactor/phase1-dry-tokens`
> Baseline: `a8cc21c` (553 tests, 0 lint errors)

---

## Summary

| Metric | Before | After |
|--------|--------|-------|
| TypeScript | ✅ clean | ✅ clean |
| ESLint errors | 0 | 0 |
| ESLint warnings | 72 | 72 |
| Tests passing | 553 | 553 |
| Files touched | - | 13 |
| Hardcoded values tokenized | - | 11 |
| Duplications consolidated | - | 1 |
| Components extracted | - | 0 |

---

## Commits

### 1. `6270b88` - refactor(tokens): create BACKDROP constants for modal overlays

**Files changed:** 9

| File | Change |
|------|--------|
| `src/shared/theme/tokens/backdrop.ts` | NEW - Created BACKDROP constants |
| `src/shared/theme/tokens/index.ts` | Added export |
| `src/shared/components/AppBar.tsx` | `rgba(0,0,0,0.3)` → `BACKDROP.light` |
| `src/shared/components/AmountKeypadSheet.tsx` | `rgba(0,0,0,0.5)` → `BACKDROP.medium` |
| `src/features/.../PaymentChipsReorderModal.tsx` | `rgba(0,0,0,0.5)` → `BACKDROP.medium` |
| `src/features/.../QuickChipsEditModal.tsx` | `rgba(0,0,0,0.5)` → `BACKDROP.medium` |
| `src/features/.../DateTimePickerModal.tsx` | `rgba(0,0,0,0.6)` → `BACKDROP.dark` |
| `src/features/.../CategorySelectionModal.tsx` | `rgba(0,0,0,0.6)` → `BACKDROP.dark` |
| `src/features/.../SaveFAB.tsx` | `rgba(0,0,0,0.85)` → `BACKDROP.heavy` |

**Rationale:** Consolidated 4 different backdrop opacity values into semantic constants.

---

### 2. `442a98b` - refactor(tokens): add FAB_SHADOW and TOAST_SHADOW presets

**Files changed:** 3

| File | Change |
|------|--------|
| `src/shared/theme/tokens/shadow.ts` | Added FAB_SHADOW, TOAST_SHADOW |
| `src/features/.../DraftsFAB.tsx` | Inline shadow → `...FAB_SHADOW` |
| `src/shared/components/Toast.tsx` | Inline shadow → `...TOAST_SHADOW` |

**Rationale:** Consolidated shadow styles for floating buttons and toasts.

**Note:** UndoToast not updated - uses different values (0.2 opacity vs 0.15) intentionally.

---

### 3. `075ff61` - refactor(price-tracker): use shared EmptyState component

**Files changed:** 5 (1 deleted)

| File | Change |
|------|--------|
| `src/features/price-tracker/components/EmptyState.tsx` | DELETED |
| `src/features/price-tracker/PriceTrackerScreen.tsx` | Import shared EmptyState with props |
| `src/features/price-tracker/components/index.ts` | Removed EmptyState export |
| `src/features/price-tracker/index.ts` | Removed EmptyState export |

**Rationale:** Removed 40-line duplicate component, reused shared version with props.

---

### 4. `2be9b10` - refactor(tokens): add CATEGORY_ROW_LAYOUT constants

**Files changed:** 4

| File | Change |
|------|--------|
| `src/shared/theme/tokens/layout.ts` | NEW - Created CATEGORY_ROW_LAYOUT |
| `src/shared/theme/tokens/index.ts` | Added export |
| `src/features/.../CategoryAccordion.styles.ts` | `width: 20` → `CATEGORY_ROW_LAYOUT.chevronColumnWidth` (2 places) |

**Rationale:** Created layout constants for consistent column widths.

**Note:** `percentageColumnWidth` not applied - files use inconsistent values (40 vs 44).

---

## Tasks Deferred to REVIEW.md

| Task | Reason |
|------|--------|
| 1.1 MonthlyCategorySection/MonthlyIncomeSection merge | 570 lines, structural change, needs dedicated PR |
| 1.2 getCategoryMeta consolidation | Different semantics ('Uncategorized' vs 'Other') |
| UndoToast shadow | Intentionally different values |
| DashboardPeriodPicker.styles backdrop | Uses 0.4 opacity (not in BACKDROP tokens) |
| Percentage column width unification | Inconsistent across files (40 vs 44) |

---

## New Token Files Created

| File | Contents |
|------|----------|
| `src/shared/theme/tokens/backdrop.ts` | `BACKDROP.light/medium/dark/heavy` |
| `src/shared/theme/tokens/layout.ts` | `CATEGORY_ROW_LAYOUT.chevronColumnWidth/percentageColumnWidth` |

---

## Updated Token Files

| File | Additions |
|------|-----------|
| `src/shared/theme/tokens/shadow.ts` | `FAB_SHADOW`, `TOAST_SHADOW` |
| `src/shared/theme/tokens/index.ts` | Exports for backdrop, layout |
