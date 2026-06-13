# Dashboard Spec

> The main navigation tabs: Overview, Accounts, and Insights

---

## Page Architecture

The dashboard has three main tabs, each answering a different core question:

| Tab | Core Question | Focus | Time Horizon |
|-----|---------------|-------|--------------|
| **Overview** | "How much am I earning/spending?" | Cash **Flow** | Current period |
| **Accounts** | "How much do I have?" | Cash **Position** | Balance now |
| **Insights** | "What patterns should I notice?" | **Analysis** | Trends over time |

### Visual Model

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   OVERVIEW          ACCOUNTS           INSIGHTS                 │
│   (Flow)            (Position)         (Analysis)               │
│                                                                 │
│   ┌─────────┐       ┌─────────┐        ┌─────────┐             │
│   │ Income  │       │ Cash    │        │ Trends  │             │
│   │ Expense │       │ Debt    │        │Anomalies│             │
│   │ Net     │       │ Invest  │        │ Goals   │             │
│   └─────────┘       └─────────┘        └─────────┘             │
│                                                                 │
│   "I spent $2,000"  "I have $10,000"   "Food is up 30%"        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Overview Tab

**Purpose:** Show current period cash flow snapshot

### Scopes

| Scope | Shows | Use Case |
|-------|-------|----------|
| **Monthly** | This month's income, expense, net | "How am I doing this month?" |
| **Yearly** | This year's totals and monthly breakdown | "How am I doing this year?" |
| **All** | Lifetime totals and yearly breakdown | "What's my total picture?" |

### Sections (Monthly)

| Section | Content | Purpose |
|---------|---------|---------|
| Hero | Net Cash Flow (+/- $X) | At-a-glance health |
| Stats Row | Income / Expense | Flow breakdown |
| Calendar | Daily spending heatmap | When did I spend? |
| Categories | Expense by category | Where did money go? |
| Income | Income by category | Where did money come from? |

### Sections (Yearly)

| Section | Content | Purpose |
|---------|---------|---------|
| Hero | Net Cash Flow for year | At-a-glance health |
| Stats Row | Income / Expense | Flow breakdown |
| Monthly Chart | Bar chart by month | Trend through year |
| Categories | Expense by category | Where did money go? |

### Sections (All)

| Section | Content | Purpose |
|---------|---------|---------|
| Hero | Lifetime net | Total picture |
| Stats Row | Income / Expense | Lifetime totals |
| Cumulative Chart | Net worth trend | Long-term trajectory |
| Categories | All-time by category | Lifetime spending patterns |

---

## 2. Accounts Tab

**Purpose:** Show current cash position across all accounts

### Sections

| Section | Content | Purpose |
|---------|---------|---------|
| Summary Strip | Cash & Savings / Debt / Investments totals | At-a-glance position |
| Cash & Savings | List of cash accounts with balances | Where is my cash? |
| Debt | List of debt accounts with balances | What do I owe? |
| Investments | List of investment accounts | What's invested? |

### Per Account

| Data | Description |
|------|-------------|
| Name | Account name |
| Balance | Current balance |
| Start/Change | Period start balance and delta (for context) |

---

## 3. Insights Tab

**Purpose:** Surface patterns, anomalies, and actionable insights

### What Insights IS

- **Pattern recognition** - trends over time
- **Anomaly detection** - unusual spending
- **Comparisons** - this month vs typical
- **Predictions** - what to aim for

### What Insights IS NOT

- Not a duplicate of Overview (no "this month net" hero)
- Not a place for current period data that belongs in Overview

### Sections

| Section | Content | Purpose |
|---------|---------|---------|
| Primary Driver | Category with biggest change vs average | "What changed most?" |
| Net Trend | Sparkline of net over 6-12 months | "Am I improving?" |
| Spending Pattern | Daily outflow distribution | "When do I spend?" |
| Opportunity | Suggested target for next month | "What should I aim for?" |

### Duration Selector

User can adjust the comparison window:
- 6 months (default)
- 12 months
- All time

---

## Design Principles

### No Duplication

Each tab should show unique information:
- If it's about **current flow** → Overview
- If it's about **current balances** → Accounts
- If it's about **patterns/trends** → Insights

### Clear Hierarchy

Each page has:
1. **Hero** - Single most important metric
2. **Supporting sections** - Details that explain the hero

### Consistent Patterns

- Section headers use `SectionHeader` component
- Numbers use smart formatting (commas, hide .00)
- Colors: success (green), danger (red), neutral (text)

---

## Test Checklist

### Overview
- [ ] Monthly view shows current month data
- [ ] Yearly view shows current year data
- [ ] All view shows lifetime data
- [ ] Period picker navigates between periods
- [ ] Category breakdown is accurate

### Accounts
- [ ] All active accounts appear
- [ ] Balances are accurate
- [ ] Section totals are correct
- [ ] Adding account refreshes list

### Insights
- [ ] Primary driver shows correct category
- [ ] Net trend chart renders with history
- [ ] Spending pattern shows daily bars
- [ ] Duration selector changes comparison window
- [ ] Empty states show for new users

---

## Related Specs

- [Add Transaction](add-transaction.spec.md) - Creating transactions
- [Transaction Detail](../modals/transaction-detail.spec.md) - Viewing transactions
