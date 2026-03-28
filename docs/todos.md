# TODO Tracker

> Technical debt and feature placeholders extracted from code comments.

*Last updated: March 2026*

---

## Summary

| Priority | Category | Count |
|----------|----------|-------|
| Low | V2 Features | 4 |
| Low | Technical Debt | 4 |
| **Total** | | **8** |

---

## V2 Features (Planned)

These are placeholders for features planned in v2.

| File | Line | Description | Status |
|------|------|-------------|--------|
| `NotificationsScreen.tsx` | 143 | Navigate to related content based on notification subtype | Pending |
| `AppBar.tsx` | 169 | Open search functionality | Pending |
| `AppBar.tsx` | 172 | Open messages (v2 feature) | Pending |
| `AppBar.tsx` | 178 | Sign out functionality | Pending |

---

## Technical Debt

Minor improvements that can be addressed opportunistically.

| File | Line | Description | Priority | Status |
|------|------|-------------|----------|--------|
| `HoHThemeProvider.tsx` | 27 | Cleanup comment about correct effectiveMode logic | Low | Pending |
| `quickChips.store.ts` | 5 | Add SQLite persistence if needed | Low | Pending |
| `admin.ts` | 70 | Dev seed for categories/accounts/transactions | Low | Pending |
| `ItemPriceHistorySheet.tsx` | 152 | Navigate to full price history | Low | Pending |

---

## Resolution Guide

When resolving a TODO:

1. Fix the code
2. Remove the TODO comment
3. Update this document (change status to "Done" or remove row)
4. Commit both changes together

---

## Adding New TODOs

When adding a TODO to code:

1. Use format: `// TODO: Brief description`
2. Add entry to this document
3. Consider if it should be a GitHub issue instead (for larger work)
