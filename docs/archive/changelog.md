# Changelog

All notable changes to MyMoneyTracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- 

## [Version] - YYYY-MM-DD

### Added
- New features

### Changed
- Refactoring, updates

### Deprecated
- Features marked for removal

### Removed
- Deleted features

### Fixed
- Bug fixes

### Security
- Security patches 
  
-->
---

## [Unreleased]

### In Progress
- Dashboard Year view implementation
- Dashboard All-time view implementation
- Transaction editing capability
- Data export functionality (CSV/JSON)

---

## [0.2.0-alpha] - 2026-01-31

### Added

#### Features
- **Notifications System**: Comprehensive notification center with slide-from-right animation
  - Tabs: All, Unread, Drafts, Groups*, Messages, Reactions (*Groups only shows if user has groups)
  - Compact single-line rows: Avatar + message + unread dot + time
  - Time groupings: Today, Yesterday, Last 7 Days, Last 30 Days, Older
  - Bell icon in AppBar shows dot when unread notifications OR drafts exist
  - Integrated with drafts store for transaction draft reminders
  - Files: `src/domain/notification/`, `src/store/notifications.store.ts`, `src/features/notifications/`

- **Auto-Suggestions**: Apple Calendar-style inline dropdown for transaction fields
  - Suggests items and merchants based on historical usage
  - Sorted by: prefix match > frequency > recency
  - Debounced input (150ms) with 2-character minimum
  - Highlights matching text in suggestions
  - Files: `src/shared/components/AutoSuggestInput.tsx`, `src/store/suggestions.store.ts`

- **Tags Feature**: Expandable accordion for transaction tagging
  - Premade tags: subscription, emergency, unplanned, work
  - Occurrence tags: weekly, monthly, yearly, one-time
  - Create custom tags inline
  - Files: `src/domain/tag/`, `src/store/tags.store.ts`, `src/features/transactions/add/components/TagSection.tsx`

- **Button Design System**: Reusable button component
  - Variants: primary, secondary, text, danger
  - Sizes: large (48px), medium (40px), small (32px)
  - Full-width option, disabled state
  - File: `src/shared/components/Button.tsx`

- **Draft Transactions**: Save incomplete transactions for later
  - Toggle between "Add" and "Save Draft" modes
  - Drafts appear in Notifications > Drafts tab
  - Bell icon reflects pending drafts
  - File: `src/store/drafts.store.ts`

#### Database Migrations
Four new SQLite migrations added for persistent storage:

| Migration | Table | Purpose |
|-----------|-------|---------|
| `20260131100000_create_notifications` | `notifications` | Notification storage with type, read status, sender/group info |
| `20260131100100_create_tags` | `tags`, `transaction_tags` | Tag definitions and many-to-many junction |
| `20260131100200_create_suggestions` | `suggestions` | Historical item/merchant suggestions with frequency |
| `20260131100300_create_drafts` | `transaction_drafts` | Incomplete transaction storage |

**Schema Design Decisions:**
- **Notifications**: Single table (Option A) with denormalized sender/group fields for simplicity. Sender/group will FK to users/groups tables in v2.
- **Tags**: Normalized with junction table for many-to-many relationships. `is_system` flag protects premade tags.
- **Suggestions**: Type + value unique constraint prevents duplicates. Frequency and last_used enable smart sorting.
- **Drafts**: Mirrors transactions structure but all fields nullable for partial saves.

**Indexes Added:**
- `notifications`: created_at DESC, read, type, read+type composite
- `tags`: category, is_system
- `transaction_tags`: transaction_id, tag_id
- `suggestions`: type+value, frequency DESC, last_used DESC, composite
- `drafts`: created_at DESC, type

#### Configuration
- **Tags Config** (`src/config/tags.config.ts`): Source of truth for premade tags
  - `PREMADE_TAGS`: subscription, emergency, unplanned, work
  - `OCCURRENCE_TAGS`: weekly, monthly, yearly, one-time
  - `SYSTEM_TAGS`: Combined export for seeding

- **Feature Flags** (`src/config/feature-flags.config.ts`): New dev flags
  - `devSeedNotifications`: Auto-seed mock notifications in dev mode
  - `devSeedSuggestions`: Auto-seed suggestion data in dev mode
  - `notifications`: Enabled (was false)

#### Seeds
- **System Seeds** (run on app startup):
  - `system.tags.seed.ts`: Syncs premade tags from config to DB

- **Dev Fixtures** (controlled via DevToolsOverlay):
  - **Notifications** (`fixture.notifications.ts` + `seed_notifications.json`):
    - 7 mock notifications covering all 5 types (system, user_action, message, reaction, group)
    - Mix of read/unread states and various time ranges
    - Functions: `applyFixtureNotifications()`, `deleteFixtureNotifications()`, `toggleFixtureNotificationsRead(read)`, `createMockNotification(type)`, `getNotificationStats()`
  - **Suggestions** (`fixture.suggestions.ts` + `seed_suggestions.json`):
    - 10 common items (Lunch, Coffee, Groceries...)
    - 10 common merchants (Starbucks, Target, Amazon...)
    - Functions: `applyFixtureSuggestions()`, `deleteAllSuggestions()`, `getSuggestionStats()`

#### Dev Tools
- **Dev Tools Toggle**: Dynamic show/hide mechanism for DevToolsOverlay
  - Long-press (500ms) on AppBar logo ("HoH") toggles visibility
  - State managed in new `src/store/dev.store.ts` Zustand store
  - Defaults to visible in dev mode (`__DEV__`), hidden in production
  - Shows Alert confirmation on toggle
  - No persistence (resets on app restart - intentional for dev builds)

- **DevToolsOverlay** (`src/shared/components/dev/DevToolsOverlay.tsx`): Floating "DEV" panel
  - Notifications section:
    - Seed / Clear: Insert or remove fixture notifications
    - All Read / All Unread: Batch toggle read status
    - Create Mock: Alert picker for all 5 notification types
    - Stats: Show total, unread, and counts by type
  - Suggestions section:
    - Seed / Clear: Insert or remove fixture suggestions
    - Stats: Show item/merchant/total counts
  - Fixtures section:
    - Seed Accounts / Seed Transactions / Seed All / Delete All
  - DB operations: Snapshot, DB Pull (dev/prod), Export, Reset, Seed

- **Fixture Pattern Refactoring**: Restructured dev seeds to follow established pattern
  - Moved from embedded `.ts` files to JSON data + fixture functions
  - JSON data files: `seed/data/seed_notifications.json`, `seed/data/seed_suggestions.json`
  - Fixture functions: `fixture/fixture.notifications.ts`, `fixture/fixture.suggestions.ts`
  - Deleted: `dev.notifications.seed.ts`, `dev.suggestions.seed.ts`
  - Benefits: Consistent with accounts/transactions fixtures, easier data editing

### Changed
- **AppBar**: Now internally manages notification + draft counts (no props required)
- **AddTransactionScreen**: Integrated AutoSuggestInput, TagSection, draft functionality
- **Seed Runner**: Now runs tags, dev notifications, dev suggestions seeds
- **Seed Report**: Added tags, notifications, suggestions, drafts counters

### Technical Details

**Notification Types:**
| Type | Description | v1 Support |
|------|-------------|------------|
| `system` | App updates, maintenance | Yes |
| `user_action` | Transaction added/edited | Yes (from drafts) |
| `message` | DM from group member | v2 (family sharing) |
| `reaction` | Like/comment on transaction | v2 (family sharing) |
| `group` | Group activity | v2 (family sharing) |

**Suggestion Algorithm:**
1. Filter by query (case-insensitive, min 2 chars)
2. Prioritize prefix matches over substring matches
3. Sort by frequency DESC
4. Then by last_used DESC (recency)
5. Limit to top N results (default 4)

**Feature Flag Integration:**
```typescript
// Dev seeds only run when flags are true
if (FEATURE_FLAGS.devSeedNotifications) {
  seedDevNotifications(report)
}
if (FEATURE_FLAGS.devSeedSuggestions) {
  seedDevSuggestions(report)
}
```

**Files Added:**
```
src/infrastructure/db/migrations/
  20260131100000_create_notifications.ts
  20260131100100_create_tags.ts
  20260131100200_create_suggestions.ts
  20260131100300_create_drafts.ts

src/infrastructure/db/seed/
  system.tags.seed.ts
  data/seed_notifications.json      # Fixture data (7 mock notifications)
  data/seed_suggestions.json        # Fixture data (10 items + 10 merchants)
  fixture/fixture.notifications.ts  # Fixture apply/delete/toggle/mock functions
  fixture/fixture.suggestions.ts    # Fixture apply/delete/stats functions

src/store/
  dev.store.ts                      # Dev tools visibility state

src/config/
  tags.config.ts
```

**Files Deleted:**
```
src/infrastructure/db/seed/
  dev.notifications.seed.ts         # Replaced by fixture pattern
  dev.suggestions.seed.ts           # Replaced by fixture pattern
```

**Files Modified:**
```
src/infrastructure/db/migrations/index.ts
src/infrastructure/db/seed/seed.runner.ts
src/infrastructure/db/seed/seed.report.ts
src/infrastructure/db/seed/index.ts
src/shared/components/AppBar.tsx          # Added long-press toggle
src/shared/components/dev/DevToolsOverlay.tsx  # Added notification/suggestion controls
src/store/index.ts                        # Added dev.store export
src/config/feature-flags.types.ts
src/config/feature-flags.config.ts
src/config/index.ts
src/app/settings.tsx
```

---

## [0.1.0-alpha] - 2026-01-29

### Added
- **Documentation Migration**: Migrated all legacy documentation to new structured format
  - Created comprehensive PRD v1 (English version)
  - Created PRD v2 (Future Vision)
  - Consolidated open questions and ideas
  - Documented architectural decisions (ADRs)
  - Created centralized overview README

---

## [0.0.9] - 2026-01-28

### Changed
- **Transactions Feature Refactoring**: Reduced `AddTransactionScreen.tsx` from 1,211 lines to 590 lines (51% reduction)
  - Extracted `useAmountKeypad.ts` hook (83 lines) - Amount entry state + handlers
  - Extracted `useAccountPicker.ts` hook (76 lines) - Account selection + search
  - Extracted `useCategoryPicker.ts` hook (231 lines) - Category/subcategory selection
  - Created modal components:
    - `AmountKeypadModal.tsx` (135 lines)
    - `AccountSelectionModal.tsx` (142 lines)
    - `CategorySelectionModal.tsx` (149 lines)
    - `SubCategorySelectionModal.tsx` (141 lines)
  - Improved maintainability through separation of concerns
  - Made modals and hooks reusable across app
  - Added barrel exports (`index.ts`) for clean imports

### Technical Details
- Main form now focuses on layout and orchestration
- Complex logic isolated in hooks for independent testing
- Modal components can be reused in future edit screens

---

## [0.0.8] - 2026-01-24

### Changed
- **Major Architecture Refactoring**: Adopted Clean Architecture with Repository Pattern
  - Consolidated `ui/` and `components/` directories into `shared/`
  - Created `infrastructure/` layer for data access
  - Split repository implementations from domain interfaces
  - Added data mapper layer for type transformations
  - Moved `lib/db/` to `infrastructure/db/`
  - Updated all import paths (87 files affected)

### Added
- `infrastructure/repositories/` directory with concrete implementations:
  - `SqliteAccountRepository.ts`
  - `SqliteCategoryRepository.ts`
  - `SqliteTransactionRepository.ts`
- `infrastructure/mappers/` for data transformation:
  - `account.mapper.ts`
  - `transaction.mapper.ts`
- Clear code organization rules (documented in CLAUDE.md)

### Technical Details
- Domain layer now contains only interfaces (no implementations)
- Repository pattern enables easy testing (mockable interfaces)
- Future-proof for v2 features (cloud sync, caching)
- Zero user-facing changes (pure internal refactor)

**Related**: ADR-0002 Clean Architecture Adoption

---

## [0.0.7] - 2026-01-23

### Changed
- **Dashboard Folder Structure Refactoring**: Reorganized dashboard feature from flat to domain-driven structure
  - Migrated from `useReducer` to Zustand for state management
  - Created folder hierarchy: `store/`, `types/`, `hooks/`, `shared/`, `monthly/`
  - Consolidated `DashboardPeriodNav` + `DashboardScopeSegment` into unified `DashboardToolbar`
  - Renamed hooks for semantic clarity (`useDashboardBudget` → `useBudgetSummary`)
  - Extracted styles from components into separate `.styles.ts` files
  - Added barrel exports (`index.ts`) for clean imports

### Added
- `DashboardToolbar.tsx`: Unified period navigation + scope selector
- `ScopeChips.tsx`: Extracted Month/Year/All chip selector
- Style files with factory pattern:
  - `ScopeChips.styles.ts`
  - `DashboardToolbar.styles.ts`
  - `DashboardPeriodPicker.styles.ts`
- Domain-based organization for monthly view:
  - `monthly/budget/` - Budget summary components
  - `monthly/calendar/` - Daily cash flow calendar
  - `monthly/category/` - Category spending breakdown

### Technical Details
- Zustand reduces boilerplate vs. useReducer (no action types, no switch statements)
- Folder structure scales well for future Year and All-time views
- Style extraction improves maintainability and performance (`useMemo` optimization)

**Related**: Dashboard Folder Structure Refactoring Doc

---

## [0.0.6] - 2026-01-15

### Added
- **Budget Tracking**: Monthly budget with progress visualization
  - User can set global monthly budget
  - Progress bar shows spent vs. budget (green < budget, red > budget)
  - Displays remaining amount or overage
  - Shows exact date when budget was first crossed
  - Configurable default budget in `APP_CONFIG`

### Fixed
- Budget crossing date calculation handles edge cases (spending on multiple days)
- Progress bar animation smooth on iOS and Android

---

## [0.0.5] - 2026-01-10

### Added
- **Category Spending Breakdown**: Donut chart with top 5 categories + "Others"
  - SVG-based donut chart (180px diameter, 16px stroke)
  - Color-coded slices with stable color assignment
  - Center label shows total spent for month
  - Category list below chart with amounts and percentages
  - Hash-based color selection ensures consistency

### Changed
- Category utilities moved to `monthly/category/category.utils.ts`
- 10-color palette for category visualization

---

## [0.0.4] - 2026-01-08

### Added
- **Daily Cash Flow Calendar**: Google Calendar-inspired monthly grid view
  - 7-day week grid with proper first-day alignment
  - Each cell shows transaction count badge and amounts
  - Toggleable expense/income display
  - Tap cell to navigate to filtered transaction list
  - Today indicator (blue highlight)
  - 64px cell height for comfortable touch targets

### Technical Details
- `useMonthlyDailyFlow` hook for data fetching
- `monthly.utils.ts` for date calculations (days in month, first day offset)
- Navigation to `/transactions?focusDate=YYYY-MM-DD` on cell press

---

## [0.0.3] - 2026-01-05

### Added
- **Transaction List**: Searchable, filterable transaction history
  - Monthly summary headers (sticky) showing total inflow/outflow
  - Search bar filters by item, merchant, note
  - Filter by year, month, account, amount range
  - Transaction rows show date, item, amount, merchant, account
  - Grouped by month with sticky headers
  - Tap transaction → Read-only detail view

### Changed
- Transaction repository optimized for month-based queries
- Added database indexes for date-based lookups

---

## [0.0.2] - 2026-01-03

### Added
- **Add Transaction Modal**: Quick transaction entry
  - Three transaction types: Expense, Income, Transfer
  - Calculator-style number keypad (stored in cents)
  - Date picker with default to today
  - Account dropdown (remembers last used)
  - Category & subcategory hierarchical picker (expenses only)
  - Note field (optional)
  - Form validation (amount > 0, account required)
  - Success feedback (toast + modal dismiss)

### Technical Details
- Apple Calendar-inspired modal design
- Transaction saved to SQLite with UUID
- Amounts stored as integers (cents) to avoid floating-point errors

---

## [0.0.1] - 2026-01-01

### Added
- **Initial Release**: Basic app structure
  - Expo + React Native + Tamagui setup
  - expo-sqlite integration with custom migration system
  - Domain layer structure (account, category, transaction)
  - Dashboard scaffold with mode tabs (Overview, Cash Flow, Accounts, Net Worth)
  - Period navigation (Month, Year, All)
  - iOS scroll wheel period picker
  - Swipe gestures for period navigation
  - Light/Dark mode support via HoHThemeProvider
  - Database seed data with default categories and sample accounts

### Technical Details
- TypeScript strict mode
- Expo Router (file-based routing)
- Custom migration runner tracks applied migrations
- Repository pattern with SQLite backend
- Path alias `@/` configured in tsconfig.json

---

## Breaking Changes

### v0.0.8 (Architecture Refactoring)
**Impact**: Developers only (no user-facing changes)

**What Changed**:
- Import paths changed:
  - `@/ui/*` → `@/shared/*`
  - `@/lib/db/*` → `@/infrastructure/db/*`
  - `@/domain/*/repo` → `@/domain/*/repository` (interface) + `@/infrastructure/repositories/*` (impl)
- Repository usage pattern changed from direct function calls to interface methods

**Migration Guide** (for developers with local branches):
```bash
# Update import paths
git grep -l "@/ui/" | xargs sed -i '' 's/@\/ui\//@\/shared\//g'
git grep -l "@/lib/db/" | xargs sed -i '' 's/@\/lib\/db\//@\/infrastructure\/db\//g'

# Manually update repository imports per new pattern
```

---

## Deprecated

### v0.0.7 (Dashboard Refactoring)
- `dashboard.state.ts` (useReducer) → Replaced by `store/dashboard.store.ts` (Zustand)
- `dashboard.model.ts` → Replaced by `types/dashboard.types.ts`
- `DashboardPeriodNav.tsx` + `DashboardScopeSegment.tsx` → Merged into `DashboardToolbar.tsx`

---

## Security

No security vulnerabilities addressed in v0.x (pre-release, not public)

Future considerations:
- v2 will require secure cloud sync (end-to-end encryption)
- v2 will implement proper authentication (JWT tokens, refresh rotation)

---

## Performance

### v0.0.8
- Repository pattern enables future caching strategies
- No performance regression from refactoring (verified with manual testing)

### v0.0.7
- Zustand provides better performance than useReducer for dashboard state
- Style memoization (`useMemo`) prevents unnecessary recalculation

### v0.0.4
- Daily cash flow calendar queries optimized with database indexes
- Calendar renders efficiently (no re-renders on scroll)

---

## Notes

### Version Numbering
- **0.x.x**: Pre-release, internal development
- **1.0.0**: First public release (planned: March 2026)
- **2.0.0**: Family features + AI insights (planned: October 2026)

### Unreleased Changes
Check the `[Unreleased]` section at the top for work-in-progress features.

### Rollback Plan
All database migrations are forward-only in v0.x. v1.0 will include rollback migrations.

---

**Last Updated**: January 31, 2026
**Current Version**: 0.2.0-alpha
**Next Release**: 0.3.0-alpha (Dashboard Year/All views, Transaction editing)
