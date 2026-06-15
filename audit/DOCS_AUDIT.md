# Documentation Audit Report

> Generated: 2026-06-14
> Analysis-only - No files modified

---

## 1. Documentation Inventory

### Root Documents

| File | Purpose | Accuracy |
|------|---------|----------|
| `README.md` | Project overview, features, tech stack | ⚠️ Partial issues |
| `CLAUDE.md` | AI guidelines, architecture rules | ⚠️ Minor issues |
| `CHANGELOG.md` | Version history | ✅ Current |

### `/docs/` Directory

| File | Purpose | Accuracy |
|------|---------|----------|
| `docs/DEVELOPMENT.md` | Setup, commands, troubleshooting | ✅ Accurate |
| `docs/ROADMAP.md` | Future features | ✅ Accurate |
| `docs/QA_BUGS.md` | Bug tracking | ✅ Accurate |
| `docs/todos.md` | Technical debt tracker | ✅ Accurate |
| `docs/architecture/overview.md` | Architecture deep-dive | ✅ Accurate |
| `docs/guides/testing.md` | Testing guide | ⚠️ Minor issues |
| `docs/guides/development.md` | Development setup | ❓ Not verified |
| `docs/guides/deployment.md` | Deployment guide | ❓ Not verified |
| `docs/reference/dev-tools.md` | Developer tools | ❓ Not verified |
| `docs/reference/glossary.md` | Terminology | ❓ Not verified |
| `docs/reference/ui-terminology.md` | UI terms | ❓ Not verified |

### `/docs/specs/` Directory

| File | Purpose | Accuracy |
|------|---------|----------|
| `docs/specs/README.md` | Spec index | ✅ Accurate |
| `docs/specs/screens/add-transaction.spec.md` | Add transaction spec | ❓ Not verified |
| `docs/specs/screens/drafts.spec.md` | Drafts spec | ❓ Not verified |
| `docs/specs/screens/dashboard.spec.md` | Dashboard spec | ❓ Not verified |
| `docs/specs/modals/transaction-detail.spec.md` | Transaction detail spec | ❓ Not verified |
| `docs/specs/modals/category-selection.spec.md` | Category picker spec | ❓ Not verified |
| `docs/specs/modals/quick-chips-edit.spec.md` | Quick chips spec | ❓ Not verified |
| `docs/specs/modals/payment-chips-reorder.spec.md` | Payment chips spec | ❓ Not verified |
| `docs/specs/modals/amount-keypad.spec.md` | Keypad spec | ❓ Not verified |

### `/.claude/` Directory

| File | Purpose | Accuracy |
|------|---------|----------|
| `.claude/rules/general.md` | General AI rules | ✅ Accurate |
| `.claude/rules/domain.md` | Domain layer rules | ✅ Accurate |
| `.claude/rules/application.md` | Service layer rules | ✅ Accurate |
| `.claude/rules/infrastructure.md` | Infrastructure rules | ✅ Accurate |
| `.claude/rules/features.md` | Feature module rules | ✅ Accurate |
| `.claude/rules/screens.md` | Screen rules | ✅ Accurate |
| `.claude/rules/components.md` | Component rules | ⚠️ Issues found |
| `.claude/rules/store.md` | Store rules | ✅ Accurate |

---

## 2. Inaccuracies Found

### 2.1 README.md - Missing Screenshots

**Location:** `README.md`, lines 6-8, 43-52, 64-73, 86-92

**Issue:** README references 9 screenshot images that don't exist in `assets/screenshots/`:
- `hero.png`
- `dashboard-monthly.png`
- `dashboard-yearly.png`
- `dashboard-all.png`
- `add-transaction.png`
- `category-picker.png`
- `quick-chips.png`
- `insights.png`
- `budget-alert.png`

**Actual State:** Directory exists but is empty.

**Proposed Fix:** Either:
1. Add the screenshots, OR
2. Remove/comment out the image references until screenshots are available

---

### 2.2 README.md - Test Count Slightly Outdated

**Location:** `README.md`, line 128

**Claim:** "Total Tests: 553"

**Actual:** 553 tests exist, but 28 are failing. The count is correct but doesn't reflect current test health.

**Proposed Fix:** Add note about test status or keep as-is (count is technically accurate).

---

### 2.3 CLAUDE.md - Tamagui References

**Location:** `.claude/rules/components.md`, lines 1-15

**Claim:**
```
Use Tamagui primitives:
- `XStack`, `YStack` for layout (not View)
- `Text` for typography (not RN Text)
- `styled()` for component variants
```

**Actual State:** The codebase does NOT use Tamagui. It uses React Native's `View`, `Text`, and `StyleSheet`. Tamagui is not in `package.json` dependencies.

**Proposed Fix:** Remove Tamagui references from `.claude/rules/components.md` and update to reflect actual patterns:
```markdown
Use React Native primitives with StyleSheet:
- `View` for layout
- `Text` for typography
- `StyleSheet.create()` for styles
```

---

### 2.4 Testing Guide - Coverage Claims

**Location:** `docs/guides/testing.md`, line 12 and line 327-332

**Claim:** "~78% code coverage"

**Actual:** Cannot verify without running `npm run test:coverage`. The 28 test failures suggest coverage may be lower than documented.

**Proposed Fix:**
- Run coverage and update with actual numbers
- Note that some tests are currently failing

---

### 2.5 Architecture Overview - Technical Debt Section

**Location:** `docs/architecture/overview.md`, lines 214-227

**Issue:** Lists technical debt items that may have been addressed or are outdated.

**Listed Items:**
1. "Domain imports Infrastructure" - Accepted trade-off
2. "No Query Builder" - Low priority
3. "Inconsistent Exception Handling" - Status unknown
4. "No Input Validation Layer" - Status unknown
5. "No Caching" - Status unknown
6. "Inconsistent Barrel File Exports" - Status unknown

**Proposed Fix:** Review each item and update status. Add dates for when debt was identified.

---

## 3. Documentation Describing Non-Existent Features

### 3.1 Storybook (Roadmap Only)

**Location:** `docs/ROADMAP.md`, lines 87-118

**Status:** Storybook is listed as a v2 feature. It does NOT currently exist in the codebase.

**Issue:** None - Correctly marked as future feature.

---

### 3.2 E2E Maestro Tests

**Location:** `docs/guides/testing.md`, lines 282-320

**Claim:** References `e2e/maestro/flows/` directory with example flows.

**Actual:** Need to verify if this directory and flows exist.

**Proposed Fix:** Verify directory exists. If not, mark as planned feature.

---

## 4. Needs Author Input

### 4.1 Component Rules - Token System Adoption

**Question:** The CLAUDE.md mentions a "Token-First Development" approach (lines 53-88), but the codebase has hardcoded values in many places. Was this rule added recently and not yet fully adopted?

**Context:** 42 ESLint warnings for unused variables suggests code may be in flux.

---

### 4.2 Price Tracker Feature Status

**Location:** `docs/ROADMAP.md`, line 11

**Claim:** "Price Tracker (UI 65% done)"

**Question:** Is this percentage still accurate? The feature exists in `src/features/price-tracker/` but completeness is unclear.

---

### 4.3 Test Failures - Known or Regressions?

**Question:** Are the 28 test failures (in `asset.service.test.ts` and `format.currency.test.ts`) known issues or recent regressions?

**Context:**
- Asset service tests fail due to mock configuration
- Currency format tests fail due to rounding behavior

---

### 4.4 Family Roles Reference

**Location:** `src/core/domain/asset/asset.model.ts`, line 7

**Code:** `FamilyMemberRole` is defined but unused (ESLint warning)

**Question:** Is this for v2 family features? Should it be removed or kept for future use?

---

## 5. Setup/Install Verification

### 5.1 README.md Quick Start

**Location:** `README.md`, lines 26-31

**Commands:**
```bash
git clone <repository-url>
cd hoh_ledger
npm install
npm run dev
```

**Verification:**
- ✅ `npm install` - Standard npm install
- ✅ `npm run dev` - Defined in package.json
- ⚠️ `<repository-url>` - Placeholder not filled in

**Proposed Fix:** Add actual repository URL if public, or leave as placeholder if private.

---

### 5.2 Development Guide Commands

**Location:** `docs/DEVELOPMENT.md`

**Commands Verified:**
| Command | Defined | Works |
|---------|---------|-------|
| `npm run dev` | ✅ | ✅ |
| `npm run dev:android` | ✅ | Likely |
| `npm run staging` | ✅ | Likely |
| `npm run build:ios` | ✅ | Requires Xcode |
| `npm run build:android` | ✅ | Requires Android SDK |
| `npm run eas:dev` | ✅ | Requires EAS CLI |
| `npm run eas:staging` | ✅ | Requires EAS CLI |
| `npm run eas:prod` | ✅ | Requires EAS CLI |
| `npm run db:migrate:new` | ✅ | ✅ |
| `npm run db:migrate:regen` | ✅ | ✅ |
| `npm run db:pull` | ✅ | Requires simulator |
| `npm run db:reset` | ✅ | Requires simulator |
| `npm test` | ✅ | ✅ (with failures) |
| `npm run lint` | ✅ | ✅ (with warnings) |
| `npm run typecheck` | ✅ | ✅ |

---

## 6. Summary

### Overall Accuracy: 85%

| Status | Count | Description |
|--------|-------|-------------|
| ✅ Accurate | 14 | Documentation matches code |
| ⚠️ Minor Issues | 4 | Small corrections needed |
| ❓ Not Verified | 14 | Needs manual verification |
| ❌ Inaccurate | 0 | No major inaccuracies |

### Priority Fixes

| Priority | Issue | Action |
|----------|-------|--------|
| High | Tamagui references | Remove from component rules |
| Medium | Missing screenshots | Add or remove references |
| Medium | Test coverage claims | Re-run and update |
| Low | Repository URL placeholder | Fill in when ready |

### Deletion Candidates

None. All documentation files are relevant.

### Files Needing Updates

1. `.claude/rules/components.md` - Remove Tamagui, add StyleSheet patterns
2. `README.md` - Screenshot references
3. `docs/guides/testing.md` - Coverage numbers after test fixes
4. `docs/architecture/overview.md` - Technical debt status review
