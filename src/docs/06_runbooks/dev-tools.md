# Dev Tools Overlay

Development tools for testing and debugging. Only visible in dev mode.

## Accessing Dev Tools

**Toggle visibility:** Tap the "HoH" logo in the AppBar

When visible, a floating "DEV" chip appears in the top-left corner. Tap to expand the menu.

---

## Button Reference

| Button | Action | Use Case |
|--------|--------|----------|
| **Seed All** | Inserts fixture data for accounts, transactions, notifications, and suggestions | Populate app with test data for development |
| **Clear All** | Deletes all fixture data from all tables | Reset to empty state for testing edge cases |
| **Seed Notifs** | Inserts notification fixtures only | Quick notification testing without affecting other data |
| **Clear Notifs** | Deletes all system notifications | Reset notifications for fresh testing |
| **Reset DB** | Deletes ALL data and resets auto-increment IDs | Full database wipe (destructive) |
| **Seed DB** | Runs minimal seed (default categories, sample accounts) | Restore baseline data after reset |
| **Export** | Exports SQLite database to device | Share DB file for debugging |
| **Close** | Collapses the dev tools panel | - |

---

## Detailed Descriptions

### Seed All
Runs fixture seeding for:
- **Accounts**: Sample bank accounts, credit cards, cash
- **Transactions**: Sample expenses and income across date ranges
- **Notifications**: Mock notifications of all 5 types (system, user_action, message, reaction, group)
- **Suggestions**: Common items and merchants for auto-suggest testing

Data source: `src/infrastructure/db/seed/data/*.json`

### Clear All
Deletes fixture data only. Uses fixture keys to identify and remove seeded data.
Does NOT affect user-created data (if any).

### Seed Notifs / Clear Notifs
For iterative notification testing:
1. **Clear Notifs** - removes all system notifications (`is_system = 1`)
2. **Seed Notifs** - inserts fresh notifications from `seed_notifications.json`

**Workflow:** Clear → Seed → Test → Repeat

This avoids wiping accounts/transactions when you only need fresh notifications.

### Reset DB
**Destructive operation.** Shows confirmation dialog.
- Deletes ALL rows from all tables
- Resets auto-increment counters to 1
- Use when you need a completely fresh database

### Seed DB
Runs system seeds:
- Default expense/income categories
- Sample accounts (Checking, Savings, Credit Card, Cash)
- Does NOT include fixture data (use "Seed All" for that)

### Export
Copies the SQLite database file to a shareable location.
Useful for:
- Debugging data issues
- Sharing database state with team members
- Backup before destructive operations

---

## Feature Flag

Dev tools are controlled by `FEATURE_FLAGS.devTools` in `src/config/feature-flags.config.ts`.

```typescript
// Only enabled in __DEV__ mode
devTools: isDev
```

---

## File Locations

| File | Purpose |
|------|---------|
| `src/shared/components/dev/DevToolsOverlay.tsx` | UI component |
| `src/store/dev.store.ts` | Visibility state (Zustand) |
| `src/infrastructure/db/seed/` | Seed runners and fixture data |
| `src/infrastructure/db/queries/admin.ts` | Reset/seed DB functions |

---

## Adding New Dev Tools

1. Add button to `DevToolsOverlay.tsx`
2. Import necessary functions from `@/infrastructure/db`
3. Keep the 2-column layout for consistency
4. Show Alert for feedback on success/failure
