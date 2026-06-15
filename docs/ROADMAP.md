# Roadmap

Future feature ideas for MyMoneyTracker.

---

## v1.x (Quick Wins)

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Price Tracker** | Track grocery/item prices over time | Medium |
| Transfer Validation | Prevent same account for from/to in transfers | Low |
| Auto-Complete | Suggest items/merchants from history | Low |
| Data Export | Export transactions to CSV/JSON | Low |

### Price Tracker (Detailed Spec)

**Purpose:** Track price changes of items across stores and over time. Helps users find best deals and understand inflation impact.

**Data Sources:**
1. **Manual entry** - User inputs item, store, price, unit, date
2. **Auto-populate from Items** - Pull from itemized expenses in transactions (merchant as store, item name, price)

**Core Features:**
- Track same item across multiple stores (e.g., "Organic Carrots" at Whole Foods vs Trader Joe's)
- Historical price graph per item/store
- Price comparison view across stores
- Unit normalization ($/lb, $/oz, $/each)
- Price alerts (optional: notify when price drops)

**Example Use Case:**
```
Organic Carrots
├── Whole Foods
│   ├── Jan 2022: $4.00/lb
│   ├── Jun 2024: $5.50/lb
│   └── Jun 2026: $6.00/lb (+50% since 2022)
├── Trader Joe's
│   ├── Jan 2022: $3.50/lb
│   └── Jun 2026: $4.00/lb (+14% since 2022)
└── Costco
    └── Jun 2026: $2.80/lb (best price)
```

**Data Model:**
```
PriceEntry {
  id: UUID
  itemName: string        // "Organic Carrots"
  storeName: string       // "Whole Foods"
  price: number           // 600 (cents)
  unit: string            // "lb" | "oz" | "each" | "pack"
  quantity: number        // 1 (for price per X units)
  date: string            // "2026-06-13"
  sourceTransactionId?: UUID  // Link to original transaction if auto-populated
}
```

**Views:**
1. **Item List** - All tracked items with latest price
2. **Item Detail** - Price history chart, store comparison
3. **Store View** - All prices at a specific store
4. **Price Alerts** - Items with significant price changes

---

## v2 (Family & Cloud)

### Core Features

| Feature | Description |
|---------|-------------|
| **Family Sharing** | Multi-user (up to 6), role-based permissions |
| **Family Messaging** | In-app chat between family members |
| **Cloud Sync** | Optional sync across devices |
| **Transaction Editing** | Edit past transactions with audit trail |
| **Recurring Transactions** | Templates for rent, subscriptions, bills |

### Family Roles
- Organizer: Full control
- Co-organizer: Full access (can't remove organizer)
- Member (Adult/Teen/Child): Configurable permissions

### Developer Experience & Tooling

| Feature | Description | Why |
|---------|-------------|-----|
| **Storybook** | Component documentation & visual testing | Interactive component catalog, visual regression testing, isolated development |
| **Visual Regression** | Automated screenshot comparison (Percy/Chromatic) | Catch unintended UI changes in CI |
| **E2E Testing** | Detox or Maestro for end-to-end flows | Automated QA for critical paths |

#### Storybook Details

**What it provides:**
- 📚 Interactive component catalog
- 🎨 Visual testing of all states (default, loading, error, edge cases)
- 🔧 Isolated component development
- 📝 Auto-generated documentation
- ♿ Accessibility checks

**Implementation:**
```bash
# React Native Storybook
npx sb@latest init --type react_native
```

**Recommended stories:**
- `Button.stories.tsx` - All button variants
- `CategoryIcon.stories.tsx` - All category icons
- `QuickChips.stories.tsx` - Chip states (selected, disabled, etc.)
- `AmountKeypad.stories.tsx` - Keypad interactions
- `TransactionRow.stories.tsx` - List item variants

**Integration:**
- Dev-only entry point (`/storybook` route in dev mode)
- CI job to build Storybook static site
- Optional: Chromatic for visual regression

---

## v2+ (AI & Advanced)

| Feature | Description | Complexity |
|---------|-------------|------------|
| Receipt OCR | Photo → extract amount, merchant, date | High |
| AI Insights | Pattern detection, spending suggestions | High |
| Bill Reminders | Push notifications for due dates | Medium |
| Multi-Currency | Per-account currency, exchange rates | High |
| Per-Category Budgets | Budget limits by category | Medium |

---

## Not Planned

| Feature | Reason |
|---------|--------|
| Bank Sync | Privacy-first philosophy |
| Public Social Features | Financial privacy concerns (family-only messaging OK) |
| Tax Categorization | Requires CPA expertise |
| Cryptocurrency | Too complex/volatile |

---

*Extracted from prd-v2.md and backlog.md*
