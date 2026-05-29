# Open Questions & Ideas

> **Purpose**: This document captures ongoing discussions, unresolved questions, and ideas for future features. 
> Items here are **not committed** to any release. 
> **Once decisions are made, they move to ADRs or PRDs.**
>
> **Status**: Living document
> **Last Updated**: January 29, 2026

---

## Table of Contents

- [Open Questions \& Ideas](#open-questions--ideas)
  - [Table of Contents](#table-of-contents)
  - [Product Open Questions](#product-open-questions)
    - [Q1: Final Product Name](#q1-final-product-name)
    - [Q2: Cash Flow Tab Purpose](#q2-cash-flow-tab-purpose)
    - [Q3: Per-Category Budgets](#q3-per-category-budgets)
    - [Q4: Budget Crossing Behavior](#q4-budget-crossing-behavior)
  - [Technical Open Questions](#technical-open-questions)
    - [T1: Database Sync/Backup Strategy (v1)](#t1-database-syncbackup-strategy-v1)
    - [T2: Migration Testing Strategy](#t2-migration-testing-strategy)
    - [T3: Large Dataset Performance](#t3-large-dataset-performance)
    - [T4: Web Optimizations](#t4-web-optimizations)
  - [UX Open Questions](#ux-open-questions)
    - [U1: First-Time User Experience](#u1-first-time-user-experience)
    - [U2: Custom Category Management](#u2-custom-category-management)
    - [U3: Transaction Detail View Behavior](#u3-transaction-detail-view-behavior)
  - [Feature Ideas (Backlog)](#feature-ideas-backlog)
    - [Idea: Recurring Transactions](#idea-recurring-transactions)
    - [Idea: Receipt OCR](#idea-receipt-ocr)
    - [Idea: Spending Insights with AI](#idea-spending-insights-with-ai)
    - [Idea: Bill Reminders](#idea-bill-reminders)
    - [Idea: Multi-Currency Support](#idea-multi-currency-support)
    - [Idea: Spending Challenges](#idea-spending-challenges)
  - [Research \& Discovery](#research--discovery)
    - [Research Item: Competitor Analysis](#research-item-competitor-analysis)
    - [Research Item: User Interviews](#research-item-user-interviews)
  - [Archived Items](#archived-items)
    - [~~Idea: Multi-Account Transfers with Fees~~](#idea-multi-account-transfers-with-fees)
    - [~~Q: Should we support decimal amounts?~~](#q-should-we-support-decimal-amounts)
    - [~~Idea: Social Features (Share budgets with friends)~~](#idea-social-features-share-budgets-with-friends)
  - [How to Use This Document](#how-to-use-this-document)
    - [Adding New Items](#adding-new-items)
    - [Resolving Items](#resolving-items)

---

## Product Open Questions

### Q1: Final Product Name

**Current**: "MyMoneyTracker" (placeholder)

**Options**:
- MyMoneyTracker
- HoH Wallet
- CashFlow
- Manual Money
- Intentional Finance

**Decision Needed**: By end of v1 development (before public release)

**Stakeholders**: Product, Marketing, Legal (trademark check)

---

### Q2: Cash Flow Tab Purpose

**Context**: Dashboard has 4 modes: Overview, **Cash Flow**, Accounts, Net Worth

**Problem**: Cash Flow tab is currently placeholder. What should it show that Overview doesn't?

**Options**:
1. **Detailed income/expense flow diagram** (Sankey chart style)
2. **Net cash position over time** (line graph)
3. **Projected cash runway** based on spending trends
4. **Remove tab entirely** - Cash Flow is already in Overview

**Discussion**:
- Overview already shows daily cash flow calendar
- Users might expect "Cash Flow" to be more technical/detailed
- Consider renaming to "Trends" or "Analysis"?

**Decision Needed**: Before v1.1 release

---

### Q3: Per-Category Budgets

**Context**: v1 has global monthly budget only

**User Request**: "I want to set $500 budget for Food, $200 for Transport, etc."

**Options**:
1. **Add in v1**: Increase scope, delay release
2. **Wait for v2**: Keep v1 simple
3. **Hybrid**: Allow setting but don't enforce (passive tracking)

**Trade-offs**:
| Option | Pros | Cons |
|--------|------|------|
| Add in v1 | Users love granular control | Increases complexity, UI crowded |
| Wait for v2 | Keep v1 focused | May disappoint power users |
| Hybrid | Low effort, nice-to-have | Confusing half-feature |

**Leaning**: Wait for v2

**Decision Needed**: By February 2026

---

### Q4: Budget Crossing Behavior

**Context**: When user exceeds monthly budget

**Current**: Show date budget was crossed, progress bar turns red

**Question**: Should we provide more guidance?

**Ideas**:
- Send notification when budget crossed?
- Suggest actions ("Pause spending in category X")?
- Show projected month-end total based on trend?
- Allow user to increase budget mid-month (discouraged)?

**User Research Needed**: Do users want prescriptive guidance or just awareness?

---

## Technical Open Questions

### T1: Database Sync/Backup Strategy (v1)

**Context**: v1 is offline-only, no cloud sync

**Problem**: How do users back up their financial data?

**Options**:
1. **Manual Export**:
   - User taps "Export Data" → Downloads JSON/CSV
   - Pros: Simple, user controls data
   - Cons: Easy to forget, no automatic backup
2. **Local Device Backup Only**:
   - Rely on iOS/Android system backups
   - Pros: Zero implementation work
   - Cons: Users may not have system backups enabled
3. **Both**:
   - Implement manual export + document system backup behavior
   - Pros: Best of both worlds
   - Cons: More work

**Current Leaning**: Option 3 (both)

**Decision Needed**: Before v1 release

**Implementation Cost**: ~2 days for export feature

---

### T2: Migration Testing Strategy

**Context**: Custom SQLite migration system

**Problem**: How do we test migrations don't break existing user data?

**Current Approach**:
- Manual testing on simulator
- No automated migration tests

**Proposed**:
- Create test database snapshots for each schema version
- Run all migrations forward/backward in CI
- Validate data integrity after migration

**Blocker**: Need to set up test infrastructure

**Decision Needed**: Before next migration (high priority)

---

### T3: Large Dataset Performance

**Context**: App currently tested with ~100 transactions

**Question**: How does it perform with 10,000+ transactions?

**Concerns**:
- Dashboard daily flow query (scans all transactions for month)
- Transaction list scrolling
- Category breakdown calculation

**Testing Needed**:
- Create seed script with 10K+ transactions
- Benchmark query performance
- Add database indexes if needed

**Decision Needed**: Before v1 public release

---

### T4: Web Optimizations

**Context**: v1 has web support but mobile-first

**Question**: Should we optimize for desktop web UX?

**Ideas**:
- Two-column layout on wide screens
- Keyboard shortcuts (arrow keys for navigation)
- Bulk transaction entry (CSV import)
- Desktop-specific date picker (not iOS wheels)

**Trade-offs**:
- Effort: ~1-2 weeks
- Benefit: Better web experience
- Risk: Divergent codebases (mobile vs. web)

**Current Leaning**: Keep mobile-first for v1, optimize in v1.5

---

## UX Open Questions

### U1: First-Time User Experience

**Context**: App has no onboarding tutorial currently

**Question**: How much guidance should we provide?

**Options**:
1. **Full Tutorial** (3-5 screens):
   - "Welcome to HoH"
   - "Add your first transaction"
   - "Set your budget"
   - "Explore the dashboard"
   - Pros: Hand-holding
   - Cons: Users skip tutorials, maintenance burden
2. **Inline Hints** (tooltips on first use):
   - First time opening dashboard: "Tap here to add transaction"
   - First time viewing calendar: "Tap a day to see transactions"
   - Pros: Contextual, less intrusive
   - Cons: Easy to miss
3. **Clear Empty States Only**:
   - "No transactions yet. Tap + to add your first expense."
   - Pros: Simple, self-explanatory
   - Cons: Assumes user is self-motivated

**User Feedback**: TBD (need beta testing)

**Current Implementation**: Option 3 (empty states only)

**Decision Needed**: After beta feedback

---

### U2: Custom Category Management

**Context**: v1 has fixed category list (seeded from config)

**User Request**: "I want to add my own categories"

**Options**:
1. **Allow Full Customization**:
   - User can add/edit/delete categories
   - Pros: Ultimate flexibility
   - Cons: Can create a mess, hard to undo
2. **Fixed Categories, Custom Subcategories**:
   - Top-level categories locked
   - User can add subcategories
   - Pros: Balanced control
   - Cons: May not fit all use cases
3. **No Customization (v1)**:
   - Wait for user feedback
   - Pros: Keep v1 simple
   - Cons: Power users feel constrained

**Current Leaning**: Option 3 for v1, Option 2 for v2

**Decision Needed**: After v1 release based on feedback

---

### U3: Transaction Detail View Behavior

**Context**: Tapping transaction shows read-only detail

**Question**: Should we allow editing from detail view in v1?

**Concerns**:
- Editing can break budget calculations if date changes
- Need to handle cascading updates (account balances)
- Complexity: Audit trail? (who changed what when)

**Options**:
1. **Read-only (v1)**: Simplicity, no edge cases
2. **Edit-in-place (v2)**: Full editing capability with audit trail
3. **Delete-only (v1)**: Allow delete but not edit

**Current Leaning**: Option 3 (delete-only for v1)

**Decision Needed**: Before v1 release

---

## Feature Ideas (Backlog)

These are interesting ideas but **not planned for v1 or v2**. Capturing for future consideration.

### Idea: Transfers Validation

**Use Case**: Prevent user errors when creating transfer transactions

**Description**:
- Prevent selecting same account for both "from" and "to" in transfers
- Show validation error message when same account selected
- Auto-clear destination account if user selects same as source
- Consider auto-matching transfer pairs (outgoing transfer matches incoming)

**Technical Notes**:
- Validation in `AddTransactionScreen` and `edit-transaction` modal
- Domain validation in `transaction.model.ts`

**Complexity**: Low
**Value**: High (prevents data integrity issues)
**Earliest Version**: v1.x (quick win)

---

### Idea: Recurring Transactions

**Use Case**: Rent, subscriptions, utilities

**Description**:
- User sets up recurring template
- App auto-creates transaction on schedule
- User can skip/modify individual occurrences

**Complexity**: Medium
**Value**: High (top user request in similar apps)
**Earliest Version**: v2

---

### Idea: Receipt OCR

**Use Case**: Capture spending from physical receipts

**Description**:
- Take photo of receipt
- AI extracts amount, merchant, date
- Confirm and save as transaction

**Complexity**: High (requires ML/cloud)
**Value**: Medium (nice-to-have)
**Earliest Version**: v2+

---

### Idea: Spending Insights with AI

**Use Case**: "Why did I spend more this month?"

**Description**:
- AI analyzes spending patterns
- Generates insights: "Coffee spending up 40% this month"
- Suggests budget adjustments

**Complexity**: Very High
**Value**: High (differentiator)
**Earliest Version**: v2+ (requires user opt-in, cloud processing)

---

### Idea: Bill Reminders

**Use Case**: "Don't forget to pay rent on the 1st"

**Description**:
- User sets reminders for bills
- Push notification on due date
- Option to log payment directly from reminder

**Complexity**: Medium
**Value**: Medium
**Earliest Version**: v2

---

### Idea: Multi-Currency Support

**Use Case**: Travelers, expats, international users

**Description**:
- Set currency per account
- Enter transactions in account's native currency
- Display conversion to base currency
- Historical exchange rate tracking
- Manual exchange rate override option
- Net worth calculation in base currency
- Currency selector in transaction form

**Database Schema**:
```sql
-- Add to accounts table
ALTER TABLE accounts ADD COLUMN currency TEXT DEFAULT 'USD';

-- Add to transactions table
ALTER TABLE transactions ADD COLUMN original_currency TEXT;
ALTER TABLE transactions ADD COLUMN exchange_rate REAL;

-- Exchange rates table
CREATE TABLE exchange_rates (
  id TEXT PRIMARY KEY,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate REAL NOT NULL,
  date TEXT NOT NULL,
  source TEXT, -- 'manual' or API source
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
```

**Technical Notes**:
- Consider free exchange rate APIs (exchangerate.host, frankfurter.app)
- Cache rates locally for offline use
- Store amounts in cents for each currency
- Display formatting per currency (symbol, decimals, placement)

**Complexity**: High (offline-first conflict, currency formatting)
**Value**: Medium-High (international users)
**Earliest Version**: v2+

---

### Idea: Spending Challenges

**Use Case**: Gamification for behavior change

**Description**:
- "No eating out for 7 days"
- "Stay under $100 this week"
- Achievements and streaks

**Complexity**: Medium
**Value**: Low (gimmicky?)
**Earliest Version**: v3+ (if at all)

---

### Idea: Receipt Storage

**Use Case**: Keep digital copies of receipts attached to transactions

**Description**:
- Attach photo/image to transaction
- Store receipt metadata in database
- Support multiple receipts per transaction

**Database Schema**:
```sql
CREATE TABLE receipts (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  uri TEXT NOT NULL,
  filename TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);
```

**Complexity**: Medium
**Value**: Medium (useful for expense reports, tax records)
**Earliest Version**: v2+

---

### Idea: Bulk Transaction Entry

**Use Case**: Add multiple transactions at once (e.g., splitting a bill)

**Description**:
- Add multiple line items in one session
- Assign different members/guests to transactions
- Split amounts across people

**Complexity**: Medium
**Value**: Medium (useful for group expenses)
**Earliest Version**: v2+

---

### Idea: Auto-Complete from History

**Use Case**: Faster transaction entry for repeated purchases

**Description**:
- As user types item/merchant name, suggest from history
- Similar to Apple Calendar event suggestions
- Learn from past transactions

**Complexity**: Low
**Value**: High (reduces friction for daily use)
**Earliest Version**: v1.x

---

## Research & Discovery

### Research Item: Competitor Analysis

**Goal**: Understand what users love/hate in existing apps

**Apps to Study**:
- Mint (RIP, but lessons learned)
- YNAB (You Need A Budget)
- PocketGuard
- Simplifi by Quicken
- GoodBudget
- Monarch Money

**Key Questions**:
- What makes users switch apps?
- What features are table stakes vs. differentiators?
- How do users feel about bank-sync vs. manual?

**Status**: Not started
**Owner**: TBD

---

### Research Item: User Interviews

**Goal**: Validate v1 assumptions with target users

**Questions**:
1. How do you currently track spending?
2. What frustrates you about your current method?
3. Would you use an app with no bank-sync?
4. How important is web access vs. mobile?
5. What would make you trust a finance app?

**Status**: Not started
**Owner**: TBD

---

## Archived Items

Items that were resolved or decided against.

### ~~Idea: Multi-Account Transfers with Fees~~

**Status**: Decided against for v1
**Reason**: Rare use case (bank transfers rarely have fees), adds complexity
**Date**: January 2026

---

### ~~Q: Should we support decimal amounts?~~

**Status**: Resolved
**Decision**: Store in cents (integers) to avoid floating-point errors
**ADR**: adr-XXXX-money-in-cents.md (TODO: Create this ADR)
**Date**: January 2026

---

### ~~Idea: Social Features (Share budgets with friends)~~

**Status**: Rejected
**Reason**: Financial privacy concerns, out of scope
**Date**: January 2026

---

## How to Use This Document

### Adding New Items

1. Choose appropriate section (Product, Technical, UX, Ideas, Research)
2. Use template below:

```markdown
### [Q/T/U/Idea]: Title

**Context**: Brief background

**Problem/Use Case**: What needs solving?

**Options**:
1. Option A: Description
   - Pros: ...
   - Cons: ...
2. Option B: Description
   - Pros: ...
   - Cons: ...

**Current Leaning**: Option X

**Decision Needed**: By [date/milestone]
```

### Resolving Items

When a decision is made:  
1. Create ADR or update PRD with decision
2. Move item to "Archived Items" with decision summary
3. Link to ADR or commit that implemented decision

---

**Contribution**: Open questions welcome from team and beta users. Tag items with **[USER REQUEST]** if coming from user feedback.
