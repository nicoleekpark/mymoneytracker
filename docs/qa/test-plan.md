# HoH Ledger - QA Test Plan

> **Version:** 1.0
> **Last Updated:** 2026-03-05
> **App Version:** SDK 54 (Expo)

This document outlines all testable features, expected behaviors, and edge cases for the HoH Finance Tracker app. Use this as a checklist for manual QA testing before releases.

---

## Table of Contents

1. [Dashboard - Overview Mode](#1-dashboard---overview-mode)
2. [Dashboard - Assets Mode](#2-dashboard---assets-mode)
3. [Dashboard - Accounts Mode](#3-dashboard---accounts-mode)
4. [Dashboard - Insights Mode](#4-dashboard---insights-mode)
5. [Add Transaction Modal](#5-add-transaction-modal)
6. [Transactions Page](#6-transactions-page)
7. [Edit Transaction Modal](#7-edit-transaction-modal)
8. [Navigation & General UI](#8-navigation--general-ui)
9. [Edge Cases & Error States](#9-edge-cases--error-states)

---

## Test ID Prefixes

| Prefix | Meaning | Description |
|--------|---------|-------------|
| **OV** | Overview | Dashboard Overview mode (Monthly/Yearly/All) |
| **AS** | Assets | Dashboard Assets mode |
| **AC** | Accounts | Dashboard Accounts mode |
| **IN** | Insights | Dashboard Insights mode |
| **AT** | Add Transaction | Add Transaction modal |
| **TR** | Transactions | Transactions list page |
| **ET** | Edit Transaction | Edit Transaction modal |
| **NV** | Navigation | Tab/navigation behavior |
| **ST** | Settings | Settings and preferences |
| **OB** | Onboarding | First launch and setup |
| **EC** | Edge Cases | Error states and edge cases |

---

## 1. Dashboard - Overview Mode

The Overview mode shows spending/income summaries with Monthly, Yearly, and All-time scopes.

### 1.1 Mode Tabs

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| OV-001 | Tap "Overview" tab | Overview mode is selected, shows spending data |
| OV-002 | Tap "Assets" tab | Switches to Assets mode |
| OV-003 | Tap "Accounts" tab | Switches to Accounts mode |
| OV-004 | Tap "Insights" tab | Switches to Insights mode |

### 1.2 Scope Selector (Monthly/Yearly/All)

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| OV-010 | Tap "Monthly" chip | Shows monthly view with calendar |
| OV-011 | Tap "Yearly" chip | Shows yearly summary with 12-month chart |
| OV-012 | Tap "All" chip | Shows all-time data, period picker disabled |

### 1.3 Period Navigation

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| OV-020 | Tap left arrow (Monthly) | Goes to previous month |
| OV-021 | Tap right arrow (Monthly) | Goes to next month (if not current) |
| OV-022 | Tap period label (Monthly) | Opens month/year picker |
| OV-023 | Tap left arrow (Yearly) | Goes to previous year |
| OV-024 | Tap right arrow (Yearly) | Goes to next year (if not current) |
| OV-025 | Period navigation at current date | Right arrow disabled/dimmed |
| OV-026 | Swipe left on content | Goes to next period |
| OV-027 | Swipe right on content | Goes to previous period |

### 1.4 Monthly View Content

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| OV-030 | Hero section | Shows total spent, income, and net for month |
| OV-031 | Calendar display | Shows all days of month with spending dots |
| OV-032 | Tap calendar day with transactions | Opens day detail bottom sheet |
| OV-033 | Tap calendar day without transactions | Shows empty state or no action |
| OV-034 | Day detail sheet | Shows list of transactions for that day |
| OV-035 | Tap transaction in day sheet | Navigates to transaction detail |
| OV-036 | Category spending section | Shows categories sorted by amount |
| OV-037 | Expand category | Shows subcategories with breakdown |
| OV-038 | Income section | Shows income by category |

### 1.5 Yearly View Content

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| OV-040 | Hero section | Shows total spent, income, net for year |
| OV-041 | Monthly cashflow chart | Shows 12 bars (income/expense per month) |
| OV-042 | Tap month bar | (Future: navigate to that month) |
| OV-043 | Category breakdown | Shows yearly category totals |
| OV-044 | Year-over-year comparison | Shows vs previous year if data exists |

### 1.6 All-Time View Content

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| OV-050 | Hero section | Shows all-time totals |
| OV-051 | Cumulative net chart | Shows running total over time |
| OV-052 | Yearly net chart | Shows net by year |
| OV-053 | Period picker disabled | Cannot select period in All scope |

---

## 2. Dashboard - Assets Mode

Assets mode shows net worth, balance sheet, and goals.

### 2.1 Year Navigation

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AS-001 | Default view | Shows current year |
| AS-002 | Navigate to past year | Shows that year's data |
| AS-003 | Right arrow at current year | Disabled |

### 2.2 Member Filter (if applicable)

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AS-010 | "Everyone" selected | Shows household total |
| AS-011 | Select individual member | Filters to that member's assets |
| AS-012 | Multi-select members | Shows combined total |

### 2.3 Hero Section

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AS-020 | Net Worth display | Shows current net worth |
| AS-021 | Change since start of year | Shows growth/loss amount |
| AS-022 | Accessible assets | Tappable, shows info sheet |
| AS-023 | Tied up assets | Tappable, shows info sheet |

### 2.4 Goal Section

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AS-030 | Goal display (if set) | Shows progress bar and target |
| AS-031 | Goal info button | Shows goal explanation sheet |
| AS-032 | No goal set | Goal section hidden |

### 2.5 Balance Sheet

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AS-040 | "All" filter | Shows all assets and liabilities |
| AS-041 | "Actionable" filter | Shows accessible assets, short-term debt |
| AS-042 | Expand category (chevron) | Shows individual items |
| AS-043 | **Assets carry forward** | Viewing future month shows last known balance |
| AS-044 | Assets with no transactions | Still shows carried-forward value |
| AS-045 | Liabilities section | Shows if liabilities exist |
| AS-046 | Net equation | Shows Assets - Liabilities = Net |

---

## 3. Dashboard - Accounts Mode

Accounts mode shows account balances with activity breakdown.

### 3.1 Scope & Period

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AC-001 | Monthly scope | Shows Start/Current/Change for month |
| AC-002 | Yearly scope | Shows Start/End/Change for year |
| AC-003 | All-time scope | Shows current balance only |
| AC-004 | Period navigation | Same as Overview mode |

### 3.2 Summary Section (Totals)

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AC-010 | "Total Cash & Savings" row | Shows section aggregate |
| AC-011 | "Total Debt" row | Shows debt aggregate (positive number) |
| AC-012 | "Total Investments" row | Shows investments aggregate |
| AC-013 | Start/End labels | Shows "Start" and "End" for past periods |
| AC-014 | **Current period labels** | Shows "Start" and "Current" (not "End") |
| AC-015 | Change display (assets) | "$X more" or "$X less" with color |
| AC-016 | Change display (debt) | "$X more debt" or "$X less debt" |

### 3.3 Account Sections

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AC-020 | Section header | Shows "Cash & Savings", "Debt", etc. |
| AC-021 | Account row | Shows name and balance |
| AC-022 | Account with activity | Shows chevron (▶) |
| AC-023 | Account without activity | Shows "No activity", dimmed, at bottom |
| AC-024 | Inactive accounts sorted | Appear at bottom of their section |

### 3.4 Expandable Account Detail

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AC-030 | Tap account with activity | Expands to show math breakdown |
| AC-031 | Expanded view - Start | Shows starting balance |
| AC-032 | Expanded view - Money In | Shows "+ $X" in green |
| AC-033 | Expanded view - Money Out | Shows "− $X" in red |
| AC-034 | Expanded view - End/Current | Shows final balance with divider line |
| AC-035 | **Collapsed hides timeline** | "$X → $Y" hidden when expanded |
| AC-036 | Transaction count link | Shows "X txns ›" |
| AC-037 | Tap transaction link | Navigates to filtered transactions page |
| AC-038 | Credit card labels | Shows "Charged" / "Paid back" |
| AC-039 | Bank account labels | Shows "Money in" / "Money out" |

---

## 4. Dashboard - Insights Mode

Insights mode shows spending patterns and analytics.

### 4.1 Period Navigation

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| IN-001 | Period picker | Uses monthly scope |
| IN-002 | Swipe navigation | Goes prev/next month |

### 4.2 Insight Cards

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| IN-010 | Net flow sparkline | Shows visual of daily cash flow |
| IN-011 | Weekday heat hint | Shows which days you spend most |
| IN-012 | Daily outflow bars | Shows spending by day of week |
| IN-013 | Category delta bar | Shows category change vs previous |
| IN-014 | Swipe through cards | Carousel navigation works |
| IN-015 | Insufficient data | Shows appropriate message |

---

## 5. Add Transaction Modal

Modal for creating new transactions.

### 5.1 Opening the Modal

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AT-001 | Tap "+" tab | Opens add transaction modal |
| AT-002 | Modal animates up | Smooth slide-up animation |

### 5.2 Transaction Type

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AT-010 | Default type | "Expense" selected |
| AT-011 | Tap "Income" | Switches to income mode |
| AT-012 | Tap "Transfer" | Switches to transfer mode |
| AT-013 | Type affects UI | Account labels change appropriately |

### 5.3 Amount Entry

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AT-020 | Tap amount area | Opens keypad |
| AT-021 | Enter digits | Updates amount display |
| AT-022 | Decimal entry | Only 2 decimal places allowed |
| AT-023 | Clear/backspace | Removes last digit |
| AT-024 | Zero amount | Cannot save with $0 |

### 5.4 Description/Item

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AT-030 | Tap description field | Keyboard appears |
| AT-031 | Enter text | Updates description |
| AT-032 | Animated placeholder | Shows suggestions |

### 5.5 Category Selection

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AT-040 | Tap category row | Opens category picker |
| AT-041 | Select category | Updates UI, auto-closes |
| AT-042 | Category has subcategories | Shows subcategory picker |
| AT-043 | Select subcategory | Updates to show both |
| AT-044 | Category icon & color | Displays correctly |

### 5.6 Account Selection

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AT-050 | Tap account row | Opens account picker |
| AT-051 | Select account | Updates UI |
| AT-052 | Transfer: "From" account | Shows source account |
| AT-053 | Transfer: "To" account | Shows destination account |
| AT-054 | No accounts exist | Shows add account prompt |

### 5.7 Date & Time

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AT-060 | Default date | Today's date |
| AT-061 | Tap date row | Opens date picker |
| AT-062 | Select past date | Updates date display |
| AT-063 | Select future date | Allowed (or blocked per business rule) |

### 5.8 Quick Chips

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AT-070 | Quick chips display | Shows user's saved chips |
| AT-071 | Tap quick chip | Auto-fills category |
| AT-072 | Edit chips button | Opens chip edit modal |
| AT-073 | Add new chip | Creates new quick chip |
| AT-074 | Delete chip | Removes from list |

### 5.9 Tags

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AT-080 | Add tag | Creates tag on transaction |
| AT-081 | Remove tag | Deletes tag |
| AT-082 | Suggested tags | Shows based on category |

### 5.10 Save Transaction

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| AT-090 | Tap save button | Saves and closes modal |
| AT-091 | Missing required fields | Shows validation error |
| AT-092 | Success toast | Shows confirmation |
| AT-093 | Dashboard updates | Reflects new transaction |

---

## 6. Transactions Page

List view of all transactions.

### 6.1 Display

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| TR-001 | Default sort | Most recent first |
| TR-002 | Section headers | Grouped by day |
| TR-003 | Month section | Shows month name and total |
| TR-004 | Transaction row | Shows item, amount, category icon |
| TR-005 | Expense amount | Shows in normal color |
| TR-006 | Income amount | Shows in green/positive |

### 6.2 Search & Filter

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| TR-010 | Search bar | Filters by item/merchant/note |
| TR-011 | Filter by account | Shows URL param filter |
| TR-012 | Clear search | Shows all transactions |

### 6.3 Transaction Actions

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| TR-020 | Tap transaction | Opens detail sheet |
| TR-021 | Swipe left | Reveals delete action |
| TR-022 | Delete transaction | Removes with undo toast |
| TR-023 | Tap undo | Restores transaction |
| TR-024 | Edit from detail sheet | Opens edit modal |

### 6.4 Empty States

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| TR-030 | No transactions | Shows empty state message |
| TR-031 | No search results | Shows "No matches" message |

---

## 7. Edit Transaction Modal

Modal for editing existing transactions.

### 7.1 Opening & Display

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| ET-001 | Open from detail sheet | Pre-fills all fields |
| ET-002 | Amount shows existing | Displays current amount |
| ET-003 | Category shows existing | Displays current category |

### 7.2 Editing

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| ET-010 | Change amount | Updates value |
| ET-011 | Change category | Updates selection |
| ET-012 | Change date | Updates date |
| ET-013 | Change account | Updates account |

### 7.3 Save Changes

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| ET-020 | Tap save | Updates transaction |
| ET-021 | Dashboard reflects changes | Totals recalculated |
| ET-022 | Cancel edit | Discards changes |

---

## 8. Navigation & General UI

### 8.1 Tab Bar

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| NV-001 | Dashboard tab | Goes to dashboard |
| NV-002 | Add tab (+) | Opens add modal |
| NV-003 | Transactions tab | Goes to transactions list |
| NV-004 | Tab highlight | Active tab is highlighted |

### 8.2 Theme

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| NV-010 | Light mode | Correct colors |
| NV-011 | Dark mode | Correct colors, readable |
| NV-012 | System theme | Follows device setting |

### 8.3 Accessibility

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| NV-020 | VoiceOver labels | All elements labeled |
| NV-021 | Dynamic text size | Respects system setting |
| NV-022 | Color contrast | Meets WCAG AA |

---

## 9. Settings Page

### 9.1 Settings Navigation

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| ST-001 | Open settings | Settings page loads |
| ST-002 | Back navigation | Returns to previous screen |

### 9.2 Theme Settings

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| ST-010 | Light mode option | Switches to light theme |
| ST-011 | Dark mode option | Switches to dark theme |
| ST-012 | System option | Follows device theme |
| ST-013 | Theme persists | Survives app restart |

### 9.3 Account Management

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| ST-020 | View accounts list | Shows all accounts |
| ST-021 | Add new account | Creates account |
| ST-022 | Edit account name | Updates name |
| ST-023 | Archive account | Hides from pickers, keeps data |
| ST-024 | Unarchive account | Restores to active |
| ST-025 | Account types | Cash, Checking, Savings, Credit Card, Loan, Investment |

### 9.4 Category Management

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| ST-030 | View categories | Shows all categories |
| ST-031 | Category order | Can reorder (if supported) |
| ST-032 | Custom categories | Can add custom (if supported) |

### 9.5 Data Management

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| ST-040 | Export data | Exports to CSV/JSON |
| ST-041 | Import data | Imports from file |
| ST-042 | Clear all data | Requires confirmation, wipes DB |

### 9.6 Notifications Settings

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| ST-050 | Toggle notifications | Enables/disables |
| ST-051 | Reminder time | Sets daily reminder |
| ST-052 | Permission prompt | Requests OS permission |

---

## 10. Onboarding / First-Run Experience

### 10.1 Fresh Install

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| OB-001 | First app launch | Shows onboarding flow |
| OB-002 | Skip onboarding | Can skip to main app |
| OB-003 | Complete onboarding | Navigates to dashboard |

### 10.2 Account Setup

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| OB-010 | Prompt to add account | Suggests creating first account |
| OB-011 | Add first account | Creates successfully |
| OB-012 | Skip account setup | Can proceed without |

### 10.3 Initial Transaction

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| OB-020 | Prompt for first transaction | Guides user to add |
| OB-021 | First transaction success | Shows celebration/confirmation |

### 10.4 Feature Introduction

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| OB-030 | Dashboard tour | Explains modes/scopes |
| OB-031 | Quick chips intro | Explains quick entry |
| OB-032 | Swipe gestures | Teaches swipe navigation |

### 10.5 Onboarding State

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| OB-040 | Onboarding completes | Doesn't show again |
| OB-041 | Reset onboarding (settings) | Can replay from settings |
| OB-042 | Reinstall app | Shows onboarding again |

---

## 11. Edge Cases & Error States

### 9.1 Data Edge Cases

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| EC-001 | No transactions ever | Empty states throughout |
| EC-002 | First transaction | Creates correctly |
| EC-003 | Large amounts ($1M+) | Displays without overflow |
| EC-004 | Negative balances | Shows correctly (debt) |
| EC-005 | Future-dated transaction | Handles appropriately |
| EC-006 | Very old transaction (2020) | Included in All-time |

### 9.2 Account Edge Cases

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| EC-010 | No accounts created | Prompts to add account |
| EC-011 | Archived account | Hidden from pickers |
| EC-012 | Delete account with transactions | Handled gracefully |

### 9.3 Performance

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| EC-020 | 1000+ transactions | Loads within 2s |
| EC-021 | Rapid period switching | No UI jank |
| EC-022 | Memory usage | No leaks after navigation |

### 9.4 Offline/Error States

| Test ID | Test Case | Expected Behavior |
|---------|-----------|-------------------|
| EC-030 | Database error | Shows error message |
| EC-031 | App backgrounded | State preserved |
| EC-032 | App killed and reopened | Data persists |

---

## Test Execution Checklist

Before each release, run through all test cases and mark status:

| Status | Meaning |
|--------|---------|
| ✅ | Passed |
| ❌ | Failed |
| ⚠️ | Passed with issues |
| ⏭️ | Skipped (not applicable) |

### Quick Smoke Test (5 min)

Run these before every build:

1. [ ] App launches without crash
2. [ ] Dashboard loads with data
3. [ ] Can add a transaction
4. [ ] Transaction appears in list
5. [ ] Can delete transaction
6. [ ] Can switch dashboard modes

---

## Reporting Issues

When reporting a bug, include:

1. **Test ID** (e.g., AC-030)
2. **Device/OS** (e.g., iPhone 15 Pro, iOS 17.4)
3. **Steps to reproduce**
4. **Expected behavior**
5. **Actual behavior**
6. **Screenshot/video** if applicable

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-05 | Claude | Initial QA test plan |
