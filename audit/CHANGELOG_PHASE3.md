# Phase 3 Changelog: Documentation Accuracy Pass

> Branch: `docs/phase3-accuracy`
> Date: 2026-06-15

---

## Summary

Documentation accuracy pass to align docs with current codebase state after Phase 1 & 2 refactoring.

---

## Files Updated

### `/docs/guides/testing.md`

**Issue**: E2E Maestro test directory referenced but doesn't exist

**Changes**:
- Line 82-84: Added `(Planned - not yet added)` note to `e2e/` structure
- Lines 139-143: Changed "### E2E Tests" to "### E2E Tests (Planned)" and added `*(to be added)*` note
- Lines 283-285: Added "Planned" to section header and note explaining flows haven't been added yet

---

### `/docs/guides/development.md`

**Issue**: Multiple incorrect npm script names

**Changes**:
- Lines 36-41: Removed `start:ios`, `start:dev:ios`, `start:android` references → updated to `dev`, `dev:android`
- Lines 51-66: Fixed command table:
  - `start:ios` → `dev`
  - `start:dev:ios` → `dev`
  - `ios:run` → `build:ios`
  - `db:migration:new` → `db:migrate:new`
  - `db:migration:regen` → `db:migrate:regen`
  - `db:dev:pull` → `db:pull`
- Lines 89-114: Fixed migration section to use `db:migrate:new` and `db:migrate:regen`
- Lines 152: Added `(planned)` note for e2e/ directory
- Lines 159-163: Fixed rebuild command from `ios:run` to `build:ios`
- Lines 171-177: Fixed `db:dev:pull` → `db:pull`
- Lines 198-211: Fixed troubleshooting commands to use `dev` instead of `start:dev:ios`

---

### `/README.md`

**Issue**: Test coverage claim unverified, E2E status unclear

**Changes**:
- Line 129: Changed `~78%` to `~78% (unverified)`
- Line 133: Changed E2E row to `Maestro mobile automation (planned)`

---

## Already Fixed (Before Phase 3)

### `/.claude/rules/components.md`

The Tamagui references flagged in DOCS_AUDIT.md were already fixed:
- Now correctly documents React Native primitives (View, Text, StyleSheet)
- Uses `useHoHTheme()` and spacing tokens from `@/shared/theme/tokens`

---

## Author-Input Decisions Applied

### 1. Price Tracker Completion Percentage — REMOVED

| File | Change |
|------|--------|
| `docs/ROADMAP.md:11` | Removed "(UI 65% done)" → now just "Track grocery/item prices over time" |
| `docs/guides/deployment.md:21` | Removed "65% complete" → now just "Missing add/edit/store UI" |

### 2. Repository URL — UPDATED

| File | Change |
|------|--------|
| `README.md:27` | `<repository-url>` → `https://github.com/nicoleekpark/hoh_ledger` |
| `docs/guides/development.md:22` | `<repository-url>` → `https://github.com/nicoleekpark/hoh_ledger` |

### 3. Token Adoption Wording — CLARIFIED

| File | Change |
|------|--------|
| `CLAUDE.md:53-55` | Added adoption status note: "Partial — tokens exist for colors, spacing, backdrop, shadow, layout, and modal patterns. Adoption is ongoing; some older code still uses hardcoded values." |

---

## Items Resolved

From DOCS_AUDIT.md "Needs Author Input" section:

| Item | Status |
|------|--------|
| Token adoption | ✅ RESOLVED - Clarified as partial/ongoing |
| Price Tracker % | ✅ RESOLVED - Removed percentage claims |
| Repository URL | ✅ RESOLVED - Updated to actual URL |
| Test failures | ✅ RESOLVED - All 553 tests now pass |
| FamilyMemberRole | ✅ RESOLVED in Phase 2 - unused type removed |

---

## Not Changed

### `/README.md` - Screenshots

The screenshot references are intentional placeholders. Lines 188-204 contain a "Screenshots Checklist" documenting what images should be added later. No changes needed.

### Architecture Technical Debt

The technical debt section in `docs/architecture/overview.md` lists architectural decisions, not code bugs. Items remain valid considerations.

---

## Verification

```bash
# Tests pass
npm test                    # 553 passed

# No TypeScript errors
npm run typecheck           # No errors

# Lint clean (only 8 warnings in REVIEW.md off-limits files)
npm run lint
```

---

## Files Not Changed (Verified Accurate)

- `.claude/rules/general.md` - Accurate
- `.claude/rules/domain.md` - Accurate
- `.claude/rules/application.md` - Accurate
- `.claude/rules/infrastructure.md` - Accurate
- `.claude/rules/features.md` - Accurate
- `.claude/rules/screens.md` - Accurate
- `.claude/rules/store.md` - Accurate
- `docs/DEVELOPMENT.md` - Accurate (has correct command names)
- `docs/ROADMAP.md` - Accurate
- `docs/QA_BUGS.md` - Accurate
- `docs/todos.md` - Accurate
- `docs/architecture/overview.md` - Accurate
