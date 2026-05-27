# HoH Finance Tracker

A personal finance app built with React Native that helps you track expenses, manage budgets, and gain insights into your spending habits.

---

## Features

### Transaction Management
- **Quick Entry** - Add expenses, income, and transfers in seconds
- **Smart Categories** - 20+ expense categories with subcategories (Housing, Food, Lifestyle, Health, etc.)
- **Multiple Accounts** - Track checking, savings, credit cards, and cash
- **Drafts** - Save incomplete transactions and finish them later
- **Tags** - Add custom tags for detailed filtering

### Dashboard & Analytics
- **Monthly View** - Calendar heatmap showing daily spending patterns
- **Yearly View** - Month-by-month cash flow comparison
- **All-Time View** - Cumulative net worth tracking
- **Insights** - Category breakdowns, spending trends, and budget alerts

### Budget Tracking
- **Monthly Budget** - Set spending limits and track progress
- **Budget Alerts** - Get notified when approaching budget limits
- **Category Analysis** - See where your money goes

### Additional Features
- **Price Tracker** - Track grocery and item prices over time
- **Asset Tracking** - Monitor savings, investments, and property
- **Offline-First** - All data stored locally on device
- **Dark Mode** - Full dark mode support

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 54 |
| UI | Tamagui Design System |
| Database | SQLite (expo-sqlite) |
| State | Zustand |
| Validation | Zod |
| Navigation | Expo Router (file-based) |

---

## Screenshots

> *Screenshots coming soon*

---

## Project Structure

```
src/
├── app/                # Screens (Expo Router)
├── core/               # Business logic
│   ├── domain/         # Models, types, schemas
│   └── services/       # Application services
├── features/           # Feature modules
│   ├── dashboard/      # Dashboard views
│   ├── transactions/   # Add/Edit/List transactions
│   └── price-tracker/  # Price tracking feature
├── infrastructure/     # Database, repositories, mappers
└── shared/             # Reusable components, hooks, utils
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Development Guide](docs/guides/development.md) | Setup, commands, and development workflow |
| [Architecture](docs/architecture/overview.md) | Technical architecture and design decisions |
| [Testing](docs/guides/testing.md) | Test suite documentation and coverage |
| [All Docs](docs/README.md) | Full documentation index |

---

## Quality

| Metric | Value |
|--------|-------|
| Test Suites | 36 |
| Tests | 553 |
| Code Coverage | ~78% |
| TypeScript | Strict mode |

---

## License

Private project - All rights reserved.
