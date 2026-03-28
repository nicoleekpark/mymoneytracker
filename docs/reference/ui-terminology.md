# UI Terminology

Standard naming for UI elements to ensure clear communication.

*Last updated: March 2026*

---

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  AppBar                                          [Bell]     │
│  HoH Logo                                    (notifications)│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DashboardModeTabs                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Overview │ │  Assets  │ │ Accounts │ │ Insights │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MemberTabs                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │ Everyone │ │  Marge   │ │  Homer   │  ...                │
│  └──────────┘ └──────────┘ └──────────┘                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DashboardToolbar                                           │
│  ┌─────────────────────────┐    ┌─────────────────────────┐ │
│  │  ‹  January 2026  ›     │    │ Monthly │ Yearly │ All  │ │
│  │     PeriodPicker        │    │       ScopeChips        │ │
│  └─────────────────────────┘    └─────────────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│                         Body                                │
│              (MonthlyBody, YearlyBody,                      │
│               AllBody, AssetsBody, etc.)                    │
│                                                             │
│     ┌─────────────────────────────────────────────┐         │
│     │              Section                        │         │
│     │   (MonthlyCategorySection, etc.)            │         │
│     └─────────────────────────────────────────────┘         │
│                                                             │
│     ┌─────────────────────────────────────────────┐         │
│     │              Card                           │         │
│     │   (BudgetSummaryCard, etc.)                 │         │
│     └─────────────────────────────────────────────┘         │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TabBar (Bottom Navigation)                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐    │
│  │   Dashboard   │  │      (+)      │  │  Transactions │    │
│  │               │  │   AddButton   │  │               │    │
│  └───────────────┘  └───────────────┘  └───────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Pages / Screens

| Screen | Route | Description |
|--------|-------|-------------|
| **DashboardScreen** | `/(tabs)/` (index) | Main screen with ModeTabs, MemberTabs, and Body content |
| **TransactionsScreen** | `/(tabs)/transactions` | Searchable list of all transactions grouped by month |
| **AddTransactionScreen** | `/(modal)/add-transaction` | Modal form to create new transaction |
| **EditTransactionScreen** | `/(modal)/edit-transaction` | Modal form to edit existing transaction |
| **NotificationsScreen** | `/notifications` | List of system and user notifications |
| **SettingsScreen** | `/settings` | App settings and preferences |

---

## Terminology Reference

### Navigation

| Term | Component | Location | Description |
|------|-----------|----------|-------------|
| **TabBar** | `(tabs)/_layout.tsx` | Bottom of screen | Main app navigation (Dashboard, +, Transactions) |
| **AddButton** | `(tabs)/add.tsx` | Center of TabBar | Opens AddTransactionScreen modal |
| **DashboardModeTabs** | `DashboardModeTabs.tsx` | Top of Dashboard | Horizontal tabs: Overview, Assets, Accounts, Insights |
| **MemberTabs** | `MemberTabs.tsx` | Below ModeTabs | Filter by household member: Everyone, Marge, Homer, etc. |

### Dashboard Controls

| Term | Component | Location | Description |
|------|-----------|----------|-------------|
| **DashboardToolbar** | `DashboardToolbar.tsx` | Below MemberTabs | Contains PeriodPicker and ScopeChips |
| **PeriodPicker** | `DashboardPeriodPicker.tsx` | Left side of toolbar | Date navigation: ‹ January 2026 › |
| **ScopeChips** | `ScopeChips.tsx` | Right side of toolbar | Time range: Monthly / Yearly / All |

### Content Hierarchy

| Term | Suffix | Description | Examples |
|------|--------|-------------|----------|
| **Screen** | `*Screen` | Full-page routable component | `DashboardScreen`, `TransactionsScreen` |
| **Body** | `*Body` | Main content area, switchable by mode/scope | `MonthlyBody`, `YearlyBody`, `AssetsBody` |
| **Section** | `*Section` | Logical grouping within a Body | `MonthlyCategorySection`, `MonthlyIncomeSection` |
| **Card** | `*Card` | Self-contained bordered UI block | `BudgetSummaryCard`, `InsightCard` |
| **Modal** | `*Modal` | Overlay dialog requiring user action | `AccountSelectionModal`, `CategorySelectionModal` |
| **Sheet** | `*Sheet` | Bottom sheet overlay | `DayDetailSheet`, `TransactionDetailSheet` |

---

## Screen Structure

```
Screen
└── Body (determined by DashboardModeTabs + ScopeChips)
    ├── Section
    │   ├── Card
    │   └── Card
    ├── Section
    │   └── Card
    └── Section
```

---

## Quick Reference

| When you mean... | Say... |
|------------------|--------|
| Bottom navigation bar | **TabBar** |
| The + button | **AddButton** |
| Overview/Assets/Accounts/Insights tabs | **DashboardModeTabs** or **ModeTabs** |
| Everyone/Marge/Homer filter | **MemberTabs** |
| Monthly/Yearly/All selector | **ScopeChips** |
| ‹ January 2026 › navigation | **PeriodPicker** |
| The area containing PeriodPicker + ScopeChips | **DashboardToolbar** or **Toolbar** |
| The main scrollable content | **Body** (e.g., MonthlyBody) |
| A bordered block of content | **Card** |
| A logical grouping in the body | **Section** |
| A bottom sheet popup | **Sheet** |
| A centered overlay dialog | **Modal** |

---

## File Locations

### Screens

| Screen | Path |
|--------|------|
| DashboardScreen | `src/features/dashboard/DashboardScreen.tsx` |
| TransactionsScreen | `src/features/transactions/list/TransactionsScreen.tsx` |
| AddTransactionScreen | `src/features/transactions/add/AddTransactionScreen.tsx` |
| NotificationsScreen | `src/features/notifications/NotificationsScreen.tsx` |

### Components

| Component | Path |
|-----------|------|
| TabBar | `src/app/(tabs)/_layout.tsx` |
| DashboardModeTabs | `src/features/dashboard/shared/DashboardModeTabs.tsx` |
| MemberTabs | `src/features/dashboard/shared/MemberTabs.tsx` |
| DashboardToolbar | `src/features/dashboard/shared/DashboardToolbar.tsx` |
| PeriodPicker | `src/features/dashboard/shared/DashboardPeriodPicker.tsx` |
| ScopeChips | `src/features/dashboard/shared/ScopeChips.tsx` |
