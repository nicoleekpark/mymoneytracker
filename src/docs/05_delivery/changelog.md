# Changelog

All notable changes to HoH Finance Tracker will be documented in this file.

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

**Last Updated**: January 29, 2026
**Current Version**: 0.1.0-alpha
**Next Release**: 0.2.0-alpha (Dashboard Year/All views, Transaction editing)
