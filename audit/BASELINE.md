# Baseline Audit Report

> Generated: 2026-06-14
> Commit: `198b29e130f15bc311b8c79634e71879167c3a3f`
> Branch: `main`

---

## 1. Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Runtime** | React Native | 0.81.5 |
| **Framework** | Expo SDK | 54.0.30 |
| **Language** | TypeScript | 5.9.2 |
| **Package Manager** | npm | - |
| **UI** | StyleSheet + Design Tokens | Native |
| **Database** | SQLite (expo-sqlite) | 16.0.10 |
| **State Management** | Zustand | 5.0.9 |
| **Navigation** | Expo Router | 6.0.21 |
| **Validation** | Zod | 4.3.6 |
| **Testing** | Jest + Testing Library | 29.7.0 |

---

## 2. Build Status

### TypeScript Compilation

```bash
$ npx tsc --noEmit
```

**Result: ✅ PASS** - No type errors

---

### ESLint

```bash
$ npm run lint
```

**Result: ⚠️ WARNINGS** - 1 error, 42 warnings

#### Error (1)
| File | Line | Issue |
|------|------|-------|
| `src/app/_layout.tsx` | 76 | `@typescript-eslint/no-var-requires` - Require statement not part of import |

#### Warnings Summary (42 total)

| Category | Count | Files Affected |
|----------|-------|----------------|
| `@typescript-eslint/no-unused-vars` | 28 | 18 files |
| `@typescript-eslint/no-explicit-any` | 10 | 8 files |
| `no-console` | 2 | 1 file |

<details>
<summary>Full Warning List</summary>

| File | Line | Variable/Issue |
|------|------|----------------|
| `_layout.tsx` | 80, 84 | console statements |
| `_layout.tsx` | 158 | `router` unused |
| `asset.model.ts` | 7 | `FamilyMemberRole` unused |
| `asset.service.ts` | 16, 17, 74, 110 | Multiple unused imports/vars |
| `transaction.insights.ts` | 136 | `_month` unused |
| `AddAccountScreen.tsx` | 75, 411 | `insets` unused, `any` type |
| `EditAccountScreen.tsx` | 60 | `keyboardVisible` unused |
| `AddAssetScreen.tsx` | 25, 26, 43, 319 | Multiple unused, `any` type |
| `AccountSettingsSheet.tsx` | 88 | `any` type |
| `useAssetsData.ts` | 14, 169, 197, 367 | Multiple unused |
| `InsightsBody.tsx` | 5, 59 | `letterSpacing`, `volatilityInsight` unused |
| `NetSparkline.tsx` | 109 | `areaPath` unused |
| `useInsightsData.ts` | 260 | `driverConfidence` unused |
| `MonthlyBody.tsx` | 25, 26 | Loading vars unused |
| `MonthlyCategorySection.tsx` | 54 | `any` type |
| `category.utils.ts` | 25, 31 | `any` types |
| `useMonthlyCategorySpending.ts` | 122 | `any` type |
| `useMonthlyIncomeByCategory.ts` | 122 | `any` type |
| `DashboardHeader.tsx` | 20, 222 | `fontWeight` unused, `any` type |
| `MonthlyCashflowChart.tsx` | 1 | `useMemo` unused |
| `NotificationsScreen.tsx` | 237, 360 | `any` type, `renderDraftsSummary` unused |
| `ItemPriceHistorySheet.tsx` | 114 | `index` unused in callback |
| `AddTransactionScreen.tsx` | 106 | `insets` unused |
| `AnimatedQuickChip.tsx` | 46 | `borderColor` unused |
| `ItemizedSection.tsx` | 50, 51, 83 | Multiple unused vars |
| `PaymentChipsReorderModal.tsx` | 9 | `CategoryIcon` unused |

</details>

---

## 3. Test Suite Status

```bash
$ npm test
```

**Result: ⚠️ PARTIAL FAILURE**

| Metric | Value |
|--------|-------|
| Test Suites | 32 passed, 4 failed (36 total) |
| Tests | 525 passed, 28 failed (553 total) |
| Time | 1.899s |

### Failed Test Suites

#### 1. `asset.service.test.ts` (5 failures)

**Root Cause:** `accountRepository` is undefined - mock not properly configured

```
TypeError: Cannot read properties of undefined (reading 'listActive')
at listActive (src/core/services/asset/asset.service.ts:84:38)
```

**Affected Tests:**
- `getAssetItems › sorts by field then category then sortOrder`
- `getAssetItemsGrouped › groups items by field and category`
- `getGoalProgress › returns zero progress when no goal exists`
- `getGoalProgress › calculates progress correctly when goal exists`
- `getGoalProgress › caps progress at 100%`

#### 2. `format.currency.test.ts` (2 failures)

**Root Cause:** Rounding behavior mismatch in currency formatting

```
Expected: "$450"
Received: "$450.40"

Expected: "+$1.0k"
Received: "+$999.90"
```

**Affected Tests:**
- `formatUsdInt › rounds decimals`
- `formatSignedUsdCompact › rounds decimals`

---

## 4. Reference Points

| Item | Value |
|------|-------|
| Git Branch | `main` |
| Git Commit | `198b29e130f15bc311b8c79634e71879167c3a3f` |
| Commit Message | (most recent: `fix: bug fixes`) |
| Uncommitted Changes | Yes - 17 modified files, 3 new files |

### Uncommitted Files

**Modified:**
- `src/core/domain/account/account.repository.ts`
- `src/core/domain/account/account.types.ts`
- `src/core/services/account/account.service.ts`
- `src/features/dashboard/accounts/AccountsBody.tsx`
- `src/features/transactions/add/AddTransactionScreen.tsx`
- `src/infrastructure/repositories/SqliteAccountRepository.ts`
- (and 11 more)

**New:**
- `docs/mockups/`
- `src/infrastructure/db/migrations/20260605100000_add_account_details.ts`
- `src/shared/components/AddAccountSheet.tsx`

---

## 5. Summary

| Check | Status | Notes |
|-------|--------|-------|
| TypeScript | ✅ Pass | No errors |
| ESLint | ⚠️ Warnings | 1 error, 42 warnings |
| Tests | ⚠️ Partial | 28 failures (mock/assertion issues) |
| Build Ready | ✅ Yes | App can build and run |

**Recommendation:** Fix the 28 test failures before release. They appear to be test configuration issues rather than actual bugs in the application code.
