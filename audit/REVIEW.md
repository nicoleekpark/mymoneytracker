# Phase 1 Review Items

> Items flagged during Phase 1 refactor that need human decision.

---

## 1. getCategoryMeta Function Duplication (Task 1.2)

**Status:** Skipped - NOT a safe mechanical change

**Files with local versions:**
- `src/features/dashboard/monthly/category/MonthlyCategorySection.tsx:21-49`
- `src/features/dashboard/monthly/category/MonthlyIncomeSection.tsx:21-49`
- `src/features/dashboard/shared/CategoryAccordion.tsx:35-54`

**Shared version:** `@/shared/format/category.ts`

**Semantic Differences:**
| Aspect | Local Versions | Shared Version |
|--------|----------------|----------------|
| Uncategorized label | `'Uncategorized'` | `'Other'` |
| Return shape | `{ name, color }` | `{ name, icon, color }` |
| CategoryAccordion | Includes `subCategories` | Does not include |
| getSubcategoryMeta fallback | `{ name, color: '#666' }` | `null` |

**Recommendation:**
- Keep local functions for now (behavior-preserving)
- Future: Unify the shared utility to support both use cases OR accept the label change
- MonthlyCategorySection/MonthlyIncomeSection duplication will be addressed by Task 1.1

---

## 2. UndoToast Shadow (Task 1.4)

**Status:** Not changed - different values intentional

**File:** `src/features/transactions/list/components/UndoToast.tsx`

**Current values:**
- `shadowOpacity: 0.2`
- `elevation: 5`

**TOAST_SHADOW token:**
- `shadowOpacity: 0.15`
- `elevation: 4`

**Reasoning:** UndoToast is an action toast (requires user attention) vs informational toast. More prominent shadow is intentional.

**Recommendation:** Keep current values OR create separate `ACTION_TOAST_SHADOW` token.

---

## 3. Items from PLAN.md "DO NOT AUTO-APPLY"

The following were NOT touched per instructions:

### A. Large File Refactoring
- `AssetsBody.tsx` (1,017 lines)
- `AllBody.tsx` (911 lines)
- `AccountsBody.tsx` (681 lines)

### B. Dead Code Removal
- `asset.service.ts`: `isInvestmentAccountKind`, `getInvestmentAccountBalance`
- `NotificationsScreen.tsx`: `renderDraftsSummary`
- `ItemizedSection.tsx`: `commitGhostRow`

### C. Needs Human Context
- `FamilyMemberRole` type - v2 prep or dead code?

---

## 5. MonthlyCategorySection/MonthlyIncomeSection Consolidation (Task 1.1)

**Status:** Deferred - Significant structural change

**Files:**
- `src/features/dashboard/monthly/category/MonthlyCategorySection.tsx` (287 lines)
- `src/features/dashboard/monthly/category/MonthlyIncomeSection.tsx` (282 lines)

**Analysis:** Components are 95% identical with these differences:
- Hook: `useMonthlyCategorySpending` vs `useMonthlyIncomeByCategory`
- Title: "Spending by Category" vs "Income by Category"
- Total color: `colors.danger` vs `colors.success`
- Empty text: "No spending yet" vs "No income yet"
- MonthlyCategorySection has extra "% of total" label
- MonthlyCategorySection has unused props: `accordionColors`, `onPressCategory`

**Risk Assessment:**
- Total lines affected: ~570
- Consumer file: MonthlyBody.tsx
- Requires API change (new props for type differentiation)

**Recommendation:**
- Create parameterized `CategoryBreakdownSection` component
- Use type discriminator prop: `type: 'spending' | 'income'`
- Remove unused props
- Test thoroughly before merging

This should be done in a dedicated PR with careful visual testing.

---

## 4. DashboardPeriodPicker.styles.ts Backdrop

**File:** `src/features/dashboard/shared/DashboardPeriodPicker.styles.ts:15`

**Current value:** `rgba(0,0,0,0.4)`

**Issue:** 0.4 opacity doesn't match any BACKDROP token (light=0.3, medium=0.5).

**Options:**
1. Change to `BACKDROP.light` (0.3) - slightly lighter
2. Change to `BACKDROP.medium` (0.5) - slightly darker
3. Add new `BACKDROP.lightMedium` (0.4) - preserves exact value

**Recommendation:** Flag for UX decision - is 0.4 intentionally between light and medium, or should it match one?
