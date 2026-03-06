# Accounts Tab v2 — Specification

## Overview

Restructure Accounts tab to show **portfolio context** (summary strip) + **per-account timeline** (activity rows). Users see both "what do I have" and "how did it change" at a glance.

Based on: Option 3 (Summary Strip + Story) with timeline metaphor preserved.

---

## Structure

```
┌─────────────────────────────────────────────────────┐
│  [collapse ▾]                                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │ CASH    │ │ DEBT    │ │ INVEST  │  ← Strip      │
│  │ $158→169│ │ -$11→14 │ │ $0→$0   │               │
│  │ (+$10k) │ │ (-$3k)  │ │ ($0)    │               │
│  └─────────┘ └─────────┘ └─────────┘               │
├─────────────────────────────────────────────────────┤
│  CASH & SAVINGS                        ← Section   │
├─────────────────────────────────────────────────────┤
│  Chase Premier Plus Checking      8 txns           │
│  $158,885 ───[+$10,629]─── $169,515   ← Row       │
│                                                     │
│  Chase Total Checking             No activity      │
│  $0 ─────────────────────── $0        ← Dimmed    │
│                                                     │
├─────────────────────────────────────────────────────┤
│  DEBT                                               │
├─────────────────────────────────────────────────────┤
│  Chase Prime Visa                 4 txns           │
│  -$2,163 ───[-$500]─── -$2,663                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 1. Summary Strip

### Layout
- Horizontal row of 3 cards: Cash & Savings, Debt, Investments
- Cards flex to fill width with equal sizing
- Collapsible: toggle button at top-right

### Card Content

**Monthly/Yearly scope:**
```
CASH & SAVINGS          ← Label (xs, caps, letter-spacing)
$158,885 → $169,515     ← Start → End (sm, semibold, tabular-nums)
(+$10,629)              ← Delta (xs, success/danger color)
```

**All Time scope (no start balance):**
```
CASH & SAVINGS
$169,515                ← End only (sm, semibold)
                        ← No delta line
```

### Interactions
- Tap card → auto-scroll to corresponding section
- Tap collapse toggle → hide strip, show only toggle to expand

### Styling
- Cards: `surface` background, `border` stroke, `radius.lg`
- Gap between cards: `spacing.sm`
- Padding inside card: `spacing.md`
- Delta color: `success` if positive, `danger` if negative, `textSecondary` if zero

### Collapse State
- Collapsed: strip hidden, small pill/button shows "Show summary"
- Expanded: full strip visible with "Hide" button
- Default: expanded
- Persist preference? (optional, can decide during implementation)

---

## 2. Section Headers

### Layout
- Divider line above
- Label only (no total — strip handles totals)

```
─────────────────────────────────
CASH & SAVINGS
```

### Styling
- Divider: 1px, `border` color
- Label: `fontSize.xs`, `fontWeight.semibold`, `letterSpacing: 0.5`, `textSecondary`
- Margin top: `spacing.xl` (between sections)
- Margin bottom: `spacing.md` (before first row)

### Sections (in order)
1. Cash & Savings (checking, savings, cash)
2. Debt (credit_card, loan)
3. Investments (investment)
4. Other (fallback)

Hide section entirely if no accounts in that category.

---

## 3. Account Rows

### Layout — Active Account (has activity)

```
┌─────────────────────────────────────────────────────┐
│ Chase Premier Plus Checking              8 txns    │
│ $158,885 ─────[ +$10,629 ]───── $169,515          │
└─────────────────────────────────────────────────────┘
```

**Row 1:** Account name (left) + transaction count (right)
**Row 2:** Start balance → delta badge → End balance (timeline)

### Layout — Expanded State

```
┌─────────────────────────────────────────────────────┐
│ Chase Premier Plus Checking              8 txns    │
│ $158,885 ─────[ +$10,629 ]───── $169,515          │
│                                                     │
│            ▸ spent $1,912                          │
│            ▸ earned $12,542                    [›] │
└─────────────────────────────────────────────────────┘
```

- Activity breakdown in middle column
- Chevron button at right → navigates to Transactions filtered by account

### Layout — No Activity Account

```
┌─────────────────────────────────────────────────────┐
│ Chase Total Checking                   No activity │
│ $0 ───────────────────────────────── $0           │
└─────────────────────────────────────────────────────┘
```

- Dimmed (`textSecondary` for all text)
- No expand interaction
- No chevron (nothing to navigate to)
- Collapsed by default (see section 4)

### Layout — All Time Scope (no start balance)

```
┌─────────────────────────────────────────────────────┐
│ Chase Premier Plus Checking              8 txns    │
│                                        $169,515    │
└─────────────────────────────────────────────────────┘
```

- End balance only, right-aligned
- No timeline, no delta badge

### Interactions
- Tap row (active) → expand/collapse inline details
- Tap chevron (expanded) → navigate to Transactions with account filter
- Tap row (no activity) → no action

### Styling
- Account name: `fontSize.sm`, `fontWeight.medium`
- Txn count: `fontSize.xs`, `fontWeight.medium`, `textSecondary`
- Balances: `fontSize.sm`, `fontWeight.semibold`, `tabular-nums`
- Delta badge: `fontSize.xs`, `fontWeight.semibold`, `success`/`danger` bg, `surface` text
- Activity labels: `fontSize.xs`, `textSecondary`
- Activity values: `fontSize.xs`, `fontWeight.semibold`, `success`/`danger`
- Row padding: `spacing.md` vertical

### Activity Labels (by account type)
| Account Type | Out Label | In Label |
|--------------|-----------|----------|
| Cash/Checking/Savings | spent | earned |
| Credit Card | charged | paid |
| Loan | borrowed | paid |
| Investment | withdrawn | deposited |

---

## 4. No-Activity Accounts

### Behavior
- **Collapsed by default**: shown but minimized (single line?)
- OR **Hidden with toggle**: "Show inactive accounts" at bottom of section

### Recommendation
Go with **collapsed by default** approach:
- Always visible but take less space
- No extra toggle UI needed
- User sees full picture without hunting for hidden accounts

### Collapsed No-Activity Layout
```
Chase Total Checking                    $0  No activity
```
- Single line: name + balance + "No activity" badge
- Tap → does nothing (no expansion)
- Dimmed styling

---

## 5. Edge Cases

### Empty State (no accounts)
```
No accounts

Add accounts to track your balances and activity.
```
- Centered, `fontSize.lg` title, `fontSize.md` subtitle

### Single Section
- Strip still shows all 3 cards (others show $0)
- Or hide empty cards? (decision: show all for consistency)

### Negative Balances (Debt)
- Display with minus sign: `-$2,663`
- Delta for debt: negative means debt increased (bad), positive means debt decreased (good)
- Color logic: debt increasing = `danger`, debt decreasing = `success`

### Zero Delta
- Show `($0)` in `textSecondary` color
- No positive/negative styling

---

## 6. Component Breakdown

### New Components
- `SummaryStrip` — the collapsible strip at top
- `SummaryCard` — individual card in strip

### Modified Components
- `AccountsBody` — add strip, update section headers
- `AccountGroupSection` — remove total from header
- `AccountRow` — add collapsed no-activity variant

### Types to Update
- `AccountsColors` — ensure has all needed colors
- `AccountActivity` — already has needed data

---

## 7. Data Requirements

All data already available in `useAccountsData`:
- `startBalance`, `endBalance` per account
- `totalOut`, `totalIn` per account
- `transactionCount`, `hasActivity`
- Section totals via `AccountGroup.totalBalance`

New calculation needed:
- Section-level start balance (sum of account start balances)
- Section-level delta (end total - start total)

---

## 8. Open Questions (for implementation)

1. **Persist collapse state?** LocalStorage/AsyncStorage or reset each session?
2. **Animation**: LayoutAnimation for expand/collapse or simpler?
3. **Strip scroll behavior**: Does strip scroll with content or have slight parallax?
4. **Accessibility**: VoiceOver labels for strip cards and expand states

---

## Approval Checklist

- [x] Summary strip with Start → End + Delta
- [x] Collapsible strip (default expanded)
- [x] Strip cards tappable → scroll to section
- [x] Minimal section headers (label only)
- [x] Timeline row layout preserved
- [x] Two-step interaction (tap expand, tap chevron navigate)
- [x] No-activity accounts collapsed by default
- [x] All Time scope: end balance only, no arrows
- [x] Debt color logic: increasing = danger
