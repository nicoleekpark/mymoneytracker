# MyMoneyTracker

**A privacy-first personal finance app built with React Native & Clean Architecture.**

Track spending like a paper journal — no bank sync, no cloud, everything on-device.

<!-- <p align="center">
  <img src="https://img.shields.io/badge/Platform-iOS-blue" alt="Platform" />
  <img src="https://img.shields.io/badge/React_Native-Expo-000?logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/Privacy-No_Data_Collected-green" alt="Privacy" />
</p> -->

---

## Demo

<table align="center">
  <tr>
    <td align="center"><img src="assets/videos/dashboard.gif" width="220" alt="Dashboard" /></td>
    <td align="center"><img src="assets/videos/add_transaction.gif" width="220" alt="Add Transaction" /></td>
    <td align="center"><img src="assets/videos/assets.gif" width="220" alt="Assets" /></td>
  </tr>
  <tr>
    <td align="center"><b>Dashboard</b></td>
    <td align="center"><b>Add Transaction</b></td>
    <td align="center"><b>Net Worth</b></td>
  </tr>
</table>

---

## Features

| Feature         | Description                                   |
| --------------- | --------------------------------------------- |
| **Dashboard**   | Monthly, yearly, and all-time spending views  |
| **Calendar**    | Visual spending patterns with daily breakdown |
| **Categories**  | 20+ categories with subcategories             |
| **Accounts**    | Cash, checking, savings, credit cards         |
| **Net Worth**   | Track assets, liabilities, balance sheet      |
| **Quick Entry** | Customizable chips for frequent transactions  |
| **Drafts**      | Save incomplete transactions, finish later    |
| **Dark Mode**   | Full dark theme support                       |

---

## Tech Stack

| Layer            | Technology                 |
| ---------------- | -------------------------- |
| **Framework**    | React Native / Expo SDK 54 |
| **Navigation**   | Expo Router (file-based)   |
| **Database**     | SQLite (expo-sqlite)       |
| **State**        | Zustand                    |
| **Validation**   | Zod                        |
| **Architecture** | Clean Architecture         |

---

## Architecture

```
src/
├── app/                    # Expo Router screens
├── core/
│   ├── domain/             # Pure types, models (no dependencies)
│   └── services/           # Business logic
├── features/               # Feature modules
│   ├── dashboard/          # Monthly, Yearly, All-time views
│   ├── transactions/       # Add, Edit, List
│   └── assets/             # Net worth tracking
├── infrastructure/
│   ├── db/                 # SQLite, migrations
│   ├── repositories/       # Data access layer
│   └── mappers/            # DB ↔ Domain conversion
└── shared/                 # Components, hooks, theme tokens
```

**Key Principles:**

- Domain layer is 100% pure — zero infrastructure imports
- Repository pattern for swappable data layer
- Feature-first organization with co-located hooks
- Design system with semantic tokens

---

## Privacy by Design

|                  |         |
| ---------------- | ------- |
| Bank sync        | ❌ None |
| Cloud storage    | ❌ None |
| Account creation | ❌ None |
| Analytics        | ❌ None |
| Data collection  | ❌ None |

**Everything stays on your device.**

---

## Quick Start

```bash
git clone https://github.com/nicoleekpark/mymoneytracker.git
cd mymoneytracker
npm install
npx expo start
```

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Your money. Your data. Your awareness.</strong>
</p>
