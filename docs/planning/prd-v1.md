# PRD — v1 (MVP)

> **Version**: 1.0
> **Status**: In Active Development
> **Last Updated**: January 29, 2026

## Table of Contents

- [Overview](#overview)
- [Product Vision](#product-vision)
- [Target Users & Personas](#target-users--personas)
- [Goals & Success Metrics](#goals--success-metrics)
- [Core Features (v1 Scope)](#core-features-v1-scope)
- [User Stories](#user-stories)
- [Technical Architecture](#technical-architecture)
- [Edge Cases & Data Requirements](#edge-cases--data-requirements)
- [Non-Goals](#non-goals)
- [Open Questions](#open-questions)

---

## Overview

**Product Name**: MyMoneyTracker
**Working Name**: Subject to change

### Product Description

MyMoneyTracker is a cross-platform personal finance application designed for **manual, intentional financial tracking**. Unlike automatic bank-sync apps, HoH empowers users to consciously log every transaction, building awareness and control over their spending habits.

**Core Philosophy**:
- **Offline-first**: All data stored locally using expo-sqlite
- **No authentication required**: Lower barrier to entry, start tracking immediately
- **Privacy-focused**: User data never leaves their device (v1)
- **Google Calendar-inspired UX**: Date-centric navigation with clear temporal context

---

## Product Vision

### The Problem

Many people struggle with financial awareness not because they lack tools, but because:
- Automatic tracking creates passive observation without engagement
- Complex features overwhelm users who just want clarity
- Bank-sync requires trust and account linking, creating friction
- Existing apps don't make spending patterns visually intuitive

### Our Solution

MyMoneyTracker provides:
1. **Visual Clarity**: Google Calendar-inspired daily cash flow view
2. **Manual Intentionality**: Conscious transaction logging builds awareness
3. **Immediate Start**: No signup, no bank linking, no learning curve
4. **Cross-Platform**: Works seamlessly on iOS, Android, and web

---

## Target Users & Personas

### Primary Persona: The Conscious Spender

**Demographics**:
- Age: 25-45
- Tech-savvy but values simplicity
- Has smartphone and/or computer

**Jobs-to-be-Done**:
1. "I want to see where my money goes each month"
2. "I want to stick to a monthly budget without complex tracking"
3. "I want to catch overspending before it becomes a problem"
4. "I want financial visibility without linking my bank accounts"

**Pain Points**:
- Automatic apps don't make me think about spending
- Complex budgeting tools feel like homework
- I don't trust giving apps my bank credentials
- I need something that works offline when traveling

### Secondary Persona: The Budget Planner

**Jobs-to-be-Done**:
1. "I want to plan major purchases by understanding spending patterns"
2. "I want to see category breakdowns to identify waste"
3. "I want year-over-year comparison to track improvement"

---

## Goals & Success Metrics

### v1 Goals

#### Must Have:
- ✅ Users can manually log transactions in < 30 seconds
- ✅ Users can see daily/monthly spending at a glance
- ✅ Users can track progress against monthly budget
- ✅ App works offline with zero network dependency

#### Should Have:
- 🔄 Visual calendar shows spending intensity by day
- 🔄 Category breakdown reveals spending patterns
- 🔄 Transaction history is searchable and filterable

#### Could Have:
- ⏳ Export data for external analysis
- ⏳ Dark mode support

### Success Metrics (v1)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Transaction Entry Time** | < 30 sec average | Time from "Add +" to "Save" |
| **Daily Active Use** | 3+ transactions/day | Median user transaction count |
| **Budget Awareness** | 70% view budget card | Analytics: budget card views |
| **Retention** | 40% 7-day retention | Users who return after 7 days |
| **Data Quality** | 90%+ have category | % transactions with category |

---

## Core Features (v1 Scope)

### 1. Dashboard Tab

**Navigation Structure**:

```
┌──────────────────────────────────────────────────┐
│  [Overview] [Cash Flow] [Accounts] [Net Worth]   │ ← Mode Tabs
├──────────────────────────────────────────────────┤
│  ‹ January 2026 ›    [Today] [Month][Year][All]  │ ← Period Toolbar
├──────────────────────────────────────────────────┤
│                                                  │
│              [Content by Mode]                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

#### 1.1 Overview Mode

##### Month View (Default)

**Budget & Spending Card**
- Shows: Budgeted amount vs. Actual spent
- Visual: Progress bar (green < budget, red > budget)
- Displays: Remaining amount or overage
- Alert: Shows date when budget was crossed

**Daily Cash Flow Calendar**
- 7-day grid (Sunday-Saturday)
- Each cell shows:
  - Day number (highlighted if today)
  - Transaction count badge
  - Expense total (red pill)
  - Income total (green pill)
- Toggle: Show expense | Show income (at least one must be active)
- Interaction: Tap cell → Navigate to transaction list filtered by date

**Monthly Spending by Category**
- Donut chart with top 5 categories + "Others"
- Center label: Total spent for month
- Category list below chart:
  - Color dot (matches chart)
  - Category name
  - Dollar amount (right-aligned)
  - Percentage of total (right-aligned)
- Future: Tap category → Drilldown to transactions

##### Year View

**Overview Section**:
- Comprehensive yearly income and expense view
- Data organized by:
  - Category/Subcategory
  - Month-by-month breakdown
  - Subtotals by category
- Metrics provided:
  - Raw total for the year
  - Monthly average (only completed months)
- Purpose: Snapshot of user's cash flow patterns

**Visual Reference**: See images in `legacy_doc/v1/img/`
- Screenshot 2026-01-29 at 2.25.15 PM.png
- Screenshot 2026-01-29 at 2.25.24 PM.png

**Budget & Spending**:
- Yearly budget vs. actual (if set)
- Month-over-month comparison

**Yearly Spending by Category**:
- Bar chart: Categories ordered by amount (descending)
- Each bar expandable:
  - Tap → Show top 3 subcategories
  - "Expand list" button → Show all subcategories

##### All View

**Spending by Category**:
- Lifetime spending across all recorded time
- Categories ordered by total amount (descending)
- Same expandable pattern as Year view

#### 1.2 Assets Tab

**Status**: TBD (placeholder in v1)
**Future Purpose**: Track non-cash assets (real estate, investments, etc.)

#### 1.3 Accounts Tab

**Display**:
- List all user accounts:
  - Cash, Checking, Savings
  - Credit cards (liability)
  - Loans (liability)
  - Investments

**Per Account Card**:
- Starting balance (beginning of period)
- Ending balance (current)
- Total spent
- Total earned
- Total transferred

**Interaction**:
- Tap account → Navigate to Transactions tab filtered by account

#### 1.4 Insights Tab

**Status**: Placeholder for v2 AI features

**Vision**:
- User can request specific data views
- Natural language queries (AI integration in v2)
- Examples:
  - "Show me coffee spending last 3 months"
  - "Compare this year to last year"
  - "Fixed costs vs. variable costs"

---

### 2. Add Transaction (+ Button)

**Modal Pattern**: Inspired by Apple Calendar

```
┌──────────────────────────────────────────────────┐
│  [Cancel]      Add Transaction            [Save] │
├──────────────────────────────────────────────────┤
│  [Expense] [Income] [Transfer]                   │ ← Type Toggle
├──────────────────────────────────────────────────┤
│  Item / Merchant: _______________________        │
│  Amount:          $___________  [Keypad]         │
│  Date:            Jan 29, 2026                   │
│  Account:         Chase Checking         ▼       │
│  Category:        Food & Dining          ▼       │
│  Subcategory:     Restaurants            ▼       │
│  Note:            _______________________        │
└──────────────────────────────────────────────────┘
```

#### Transaction Types

**Expense**:
- Item/Merchant (text)
- Amount (number keypad, stored in cents)
- Date (date picker)
- Account (dropdown)
- Category & Subcategory (hierarchical picker)
- Note (optional text)

**Income**:
- Item/Source (text)
- Amount (number keypad)
- Date (date picker)
- Account (dropdown)
- Note (optional text)

**Transfer**:
- Item (text)
- Amount (number keypad)
- From Account (dropdown)
- To Account (dropdown)
- Date (date picker)
- Note (optional text)

**UX Requirements**:
- Amount keypad: Calculator-style, always visible
- Default date: Today
- Default account: Last used account
- Save validation: Amount > 0, Account selected
- Success feedback: Brief toast + modal dismiss

---

### 3. Transactions Tab

**Layout**:

```
┌─────────────────────────────────────────────────┐
│  [Search: _________]                 [Filter ▼] │
├─────────────────────────────────────────────────┤
│  Inflow: $8,000   Outflow: $1,200   Net: $6,800 │ ← Sticky Summary
├─────────────────────────────────────────────────┤
│                                                 │
│  JANUARY 2025               $8,000     $1,200   │ ← Sticky Month Header
│  ───────────────────────────────────────────────│
│  15  Paychecks                        $8,000    │
│      Employer Payroll   Chase Plus Checking     │
│  ───────────────────────────────────────────────│
│  2   Sofa                             $1,200    │
│      Joybird            Chase Sapphire          │
│  ───────────────────────────────────────────────│
│                                                 │
│  DECEMBER 2024              $7,200     $2,400   │
│  ...                                            │
└─────────────────────────────────────────────────┘
```

**Features**:
- **Search**: Text search across item, merchant, note
- **Filters**: Year, Month, Account, Amount range
- **Monthly Summary Headers** (sticky):
  - Total inflow (green)
  - Total outflow (red)
- **Transaction Rows**:
  - Date | Item | Amount (color-coded)
  - Merchant | Account (smaller text)
- **Interaction**:
  - Tap transaction → Read-only detail view (v1)
  - Future: Edit capability (v2)

---

## User Stories

### Must Have (v1)

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-001 | As a user, I want to manually add an expense in < 30 seconds | - Modal opens immediately<br>- Keypad auto-focuses<br>- Only amount and account required<br>- Save takes < 1 sec |
| US-002 | As a user, I want to see my daily spending on a calendar | - Calendar shows current month by default<br>- Each day displays expense/income totals<br>- Tap day → View transactions for that date |
| US-003 | As a user, I want to track progress against my monthly budget | - Budget card shows spent/total<br>- Progress bar updates in real-time<br>- Alert when budget crossed |
| US-004 | As a user, I want to see where my money goes by category | - Donut chart shows top 5 categories<br>- List shows all categories with % and $<br>- Colors are consistent per category |
| US-005 | As a user, I want to search my transaction history | - Search bar filters by item/merchant/note<br>- Results update as I type<br>- Search works across all time |

### Should Have (v1)

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-006 | As a user, I want to view transactions by specific account | - Accounts tab lists all accounts<br>- Tap account → Filtered transaction list |
| US-007 | As a user, I want to record income separately from expenses | - Income toggle in add modal<br>- Income shows green in transaction list<br>- Income excluded from budget tracking |
| US-008 | As a user, I want to transfer money between accounts | - Transfer type available in add modal<br>- Transfer creates dual entries<br>- Transfer excluded from spending totals |

### Could Have (Future)

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-009 | As a user, I want to edit past transactions | - Tap transaction → Edit modal<br>- Can modify all fields<br>- Recalculates totals |
| US-010 | As a user, I want to export my data | - Export button in settings<br>- CSV or JSON format<br>- Includes all transactions |

---

## Technical Architecture

### Platforms & Tech Stack

**Platforms**:
- iOS (primary)
- Android (functional parity)
- Web (mobile-first, functional parity)

**Frontend**:
- **Framework**: Expo (SDK 52+)
- **UI Library**: React Native + Tamagui
- **Language**: TypeScript
- **Routing**: Expo Router (file-based)
- **State Management**: Zustand

**Persistence**:
- **Database**: expo-sqlite (SQLite on device)
- **Migration System**: Custom migration runner
- **Seed Data**: JSON fixtures for development

**Architecture Pattern**:
```
┌─────────────────────────────────────────────┐
│         Presentation Layer                  │
│  (features/, app/, shared/components)       │
├─────────────────────────────────────────────┤
│          Domain Layer                       │
│  (domain/ - Pure business logic)            │
├─────────────────────────────────────────────┤
│       Infrastructure Layer                  │
│  (infrastructure/ - DB, repos, mappers)     │
└─────────────────────────────────────────────┘
```

**Key Principles**:
- Offline-first (no network dependency)
- Deterministic calculations (no floating-point money) - use cents
- Type-safe domain models
- Repository pattern for data access
- Clean separation of concerns

---

## Edge Cases & Data Requirements

### Financial Edge Cases

| Case | Handling |
|------|----------|
| **Negative amounts** | Not allowed in entry, show error |
| **Zero amounts** | Not allowed in entry, show error |
| **Future-dated transactions** | Allowed (planned expenses) |
| **Duplicate transactions** | No automatic de-duplication, user responsibility |
| **Currency precision** | Store in cents (integers), display with 2 decimals |
| **Large amounts** | No upper limit, format with K/M abbreviations in UI |
| **Credit card payments** | Use Transfer type (asset → liability account) |
| **Refunds** | Enter as negative expense OR positive income |

### Data Requirements

**Transaction Fields**:
- `id` (UUID, required)
- `type` (expense | income | transfer, required)
- `amount_cents` (integer > 0, required)
- `occurred_at` (ISO date-time, required)
- `account_id` (UUID, required)
- `category_id` (UUID, optional for income/transfer)
- `subcategory_id` (UUID, optional)
- `item` (string, required, max 200 chars)
- `merchant` (string, optional, max 200 chars)
- `note` (string, optional, max 500 chars)
- `created_at` (ISO date-time, required)
- `updated_at` (ISO date-time, required)

**Account Fields**:
- `id` (UUID, required)
- `name` (string, required, max 100 chars)
- `nature` (asset | liability, required)
- `kind` (cash | checking | savings | credit_card | loan | investment | other, required)
- `starting_balance_cents` (integer, required, default 0)
- `is_archived` (boolean, default false)

**Category Fields**:
- `id` (UUID, required)
- `name` (string, required, max 100 chars)
- `parent_id` (UUID, optional) // For subcategories
- `icon` (string, optional)
- `color` (hex string, optional)

### Data Accuracy Requirements

| Field | Accuracy | Validation |
|-------|----------|------------|
| Amount | Exact cents | Integer, no rounding errors |
| Date | Day precision | ISO 8601, user's timezone |
| Category | User-defined | Validate ID exists |
| Account | User-defined | Validate ID exists |

### Data Retention

- **v1**: No automatic deletion
- **Future**: User-configurable archival (e.g., > 3 years old)

---

## Non-Goals

What v1 explicitly **will NOT** include:

| Feature | Reason | Future Version |
|---------|--------|----------------|
| Bank sync | Privacy concerns, complexity | v2+ (optional) |
| Cloud sync | Offline-first priority | v2 (optional) |
| Email/Authentication | Lower barrier to entry | v2 (for family features) |
| Multi-user/Family sharing | v1 scope constraint | v2 |
| Transaction editing | Simplicity | v2 |
| Recurring transactions | Complexity | v2 |
| Bill reminders | Out of scope | v2+ |
| Investment tracking | Complex valuation logic | v2+ |
| Tax categorization | Requires accounting expertise | v3+ |
| Receipt OCR | Requires ML/cloud | v2+ |

---

## Open Questions

### Product Questions

1. **Product Name**: "MyMoneyTracker" is placeholder - needs final decision
2. **Cash Flow Tab**: What should this view show differently from Overview?
3. **Budget Granularity**: Should we support per-category budgets in v1 or wait for v2?
4. **Graph Visual Language**: Should we use consistent colors across all charts?

### Technical Questions

1. **Database Backups**: How should users back up their data in v1 (no cloud)?
   - Option A: Manual export to file
   - Option B: Local device backup only
   - Option C: Both
2. **Migration Strategy**: If schema changes, how do we handle existing user data?
   - Current: Custom migration runner
   - Need: Better testing strategy for migrations

### UX Questions

1. **Empty States**: How much guidance should we provide for first-time users?
   - Option A: Onboarding tutorial
   - Option B: Inline hints
   - Option C: Just clear empty state messages
2. **Category Management**: Should users be able to customize categories in v1?
   - Current: Fixed category list
   - Request: User wants to add custom categories

---

## Appendix

### Related Documentation

- **Architecture Guide**: `/CLAUDE.md`
- **Dashboard Implementation**: `/src/docs/new/02_architecture/system-overview.md`
- **Database Schema**: `/src/infrastructure/db/migrations/`

### Design References

- **Inspiration**: Google Calendar (layout), Apple Calendar (modals), Mint (budget), YNAB (categories)
- **Figma**: TBD
- **Screenshots**: `legacy_doc/v1/img/`

### Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-01-29 | Migrated from legacy PRD, enhanced structure | Claude |
| 2026-01-24 | Infrastructure refactoring completed | Dev Team |
| 2026-01-23 | Dashboard folder structure refactored | Dev Team |

---

**Status**: This PRD is a living document. As implementation progresses, it will be updated to reflect reality. Breaking changes require ADR documentation.

**Next Steps**:
1. Complete Year and All-time views in Dashboard
2. Implement transaction editing (pending UX decision)
3. Add data export functionality
4. Begin v2 planning (family features)
