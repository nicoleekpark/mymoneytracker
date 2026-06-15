# Phase 2 Changelog: Best Practices + Readability

> Generated: 2026-06-15
> Branch: `refactor/phase2-cleanup`
> Baseline: 72 warnings → 8 warnings (all 8 are in REVIEW.md)

---

## Summary

| Metric | Before | After |
|--------|--------|-------|
| TypeScript | ✅ clean | ✅ clean |
| ESLint errors | 0 | 0 |
| ESLint warnings | 72 | 8 |
| Tests passing | 553 | 553 |
| Files touched | - | 36 |
| Warnings fixed | - | 64 |
| Lines removed (net) | - | ~17 |

---

## Changes by Category

### 1. Unused Imports Removed (13 files)

| File | Removed |
|------|---------|
| `_layout.tsx` | `useRouter` |
| `asset.service.ts` | `createEmptySummary`, `Account` type |
| `AddAccountScreen.tsx` | `useSafeAreaInsets` |
| `AddAssetScreen.tsx` | `AssetCategoryMeta`, `ASSET_CATEGORIES`, `letterSpacing` |
| `useAssetsData.ts` | `isLiquidifiableCategory` |
| `InsightsBody.tsx` | `letterSpacing` |
| `DashboardHeader.tsx` | `fontWeight` |
| `MonthlyCashflowChart.tsx` | `useMemo` |
| `PaymentChipsReorderModal.tsx` | `CategoryIcon` |
| `TransactionsScreen.tsx` | `CategoryIcon`, `useSafeAreaInsets` |
| `AddTransactionScreen.tsx` | `useSafeAreaInsets` |
| `SqliteAccountRepository.ts` | `AccountCategory` |
| `BottomSheetContainer.tsx` | `modalStyles` |
| `InfoSheet.tsx` | `radius` |

### 2. Unused Variables Removed (10 instances)

| File | Variable | Type |
|------|----------|------|
| `_layout.tsx` | `router` | Declared but never used |
| `EditAccountScreen.tsx` | `keyboardVisible` + keyboard listener | State + effect unused |
| `useAssetsData.ts` | `isCurrentMonth` | Computed but unused |
| `useAssetsData.ts` | `isMultiMember` | Computed but unused |
| `useAssetsData.ts` | `fieldTotal` | Accumulated but unused |
| `InsightsBody.tsx` | `volatilityInsight` | Computed but unused |
| `useInsightsData.ts` | `driverConfidence` | Computed but unused (logic block removed) |
| `NetSparkline.tsx` | `areaPath` | Destructured but unused |
| `MonthlyBody.tsx` | `loadingDaily`, `loadingBudget` | Destructured but unused |

### 3. Callback Parameters Prefixed with _ (4 files)

| File | Before | After |
|------|--------|-------|
| `ItemPriceHistorySheet.tsx` | `(pp, index)` | `(pp, _index)` |
| `AnimatedQuickChip.tsx` | `borderColor` | `borderColor: _borderColor` |
| `AccountSelectionScreen.tsx` | `{ item: a, index }` | `{ item: a, index: _index }` |
| `suggestions.store.ts` | `(set, get)` | `(set, _get)` |

### 4. Destructuring Simplified (2 files)

| File | Change |
|------|--------|
| `transaction.insights.ts` | `[_month, net]` → `[, net]` |
| `MonthlyBody.tsx` | Removed `loading:` aliases entirely |

### 5. no-console Handled (2 files)

| File | Approach |
|------|----------|
| `_layout.tsx` | Block eslint-disable for hotfix logging |
| `logger.ts` | File-level eslint-disable (intentional console wrapper) |

### 6. prefer-const Fixed (1 file)

| File | Change |
|------|--------|
| `fixture.assets.ts` | `let currentDate` → `const currentDate` |

### 7. no-explicit-any Handled (17 → 9 with eslint-disable)

**Phase 2a - Initial pass (eslint-disable with rationale):**
- `sqlite.ts`: SQLite bind parameters (3 functions)
- `fixture.loader.ts`: Fixture return type varies by name (dev-only)
- `DashboardHeader.tsx`: RN fontWeight type narrowing
- `NotificationsScreen.tsx`: FontAwesome icon name
- `TransactionFilterSheet.tsx`: FontAwesome icon name
- `AddAccountScreen.tsx`: FontAwesome icon name
- `AddAssetScreen.tsx`: FontAwesome icon name
- `MonthlyCategorySection.tsx`: accordionColors backward compat (in REVIEW.md)

**Phase 2b - Type safety pass (properly typed):**
- `AccountSettingsSheet.tsx`: `props: any` → `props: BottomSheetBackdropProps`
- `TransactionFilterSheet.tsx`: `props: any` → `props: BottomSheetBackdropProps`
- `AppBar.tsx`: `catch (e: any)` × 7 → `catch (e: unknown)` with proper handling
- `useMonthlyCategorySpending.ts`: `(r: any)` → `(r: CategoryResultRow)` (new local type)
- `useMonthlyIncomeByCategory.ts`: `(r: any)` → `(r: CategoryResultRow)` (new local type)
- `TransactionsScreen.tsx`: `tx.type as any` × 2 → `tx.type as TransactionType` (imported type)
- `SqlitePriceTrackerRepository.ts`: `category as any` → `category as ItemCategory | undefined`
- `category.utils.ts`: `(c: any)` → `(c: CategoryMeta)`, `(s: any)` → `(s: SubCategoryMeta)`

---

## Items Preserved in REVIEW.md

These 8 warnings were NOT addressed per instructions:

| File | Item | Reason |
|------|------|--------|
| `asset.model.ts` | `FamilyMemberRole` | Flagged: v2 prep or dead code? |
| `asset.service.ts` | `isInvestmentAccountKind` | Flagged: dead code |
| `asset.service.ts` | `getInvestmentAccountBalance` | Flagged: dead code |
| `NotificationsScreen.tsx` | `renderDraftsSummary` | Flagged: dead code |
| `ItemizedSection.tsx` | `editingPriceCents` | Flagged: dead code |
| `ItemizedSection.tsx` | `editingPriceCentsText` | Flagged: dead code |
| `ItemizedSection.tsx` | `setEditingPriceCentsText` | Flagged: dead code |
| `ItemizedSection.tsx` | `commitGhostRow` | Flagged: dead code |

---

## Verification

```
✓ TypeScript: npx tsc --noEmit
✓ ESLint: 0 errors, 8 warnings (all in REVIEW.md)
✓ Tests: 553 passing
```
