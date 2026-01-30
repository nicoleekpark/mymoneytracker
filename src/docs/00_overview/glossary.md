# Glossary

This document defines key terms, conventions, and domain concepts used throughout the HoH Finance Tracker codebase.

*Last updated: January 2026*
---

## File Naming Conventions

| Suffix | Purpose | Examples |
|--------|---------|----------|
| `*Screen` | Top-level routable screen | `DashboardScreen`, `TransactionsScreen` |
| `*Body` | Content container for view modes | `MonthlyBody`, `YearlyBody` |
| `*Section` | Logical section within a Body | `MonthlyCategorySection`, `DateTimeSection` |
| `*Card` | Card-style UI component | `BudgetSummaryCard` |
| `*Modal` | Modal dialog | `AccountSelectionModal`, `AmountKeypadModal` |
| `*.types.ts` | Type definitions | `transaction.types.ts` |
| `*.model.ts` | Domain model factories | `transaction.model.ts` |
| `*.repository.ts` | Data access interface | `transaction.repository.ts` |
| `*.usecase.ts` | Business logic operations | `transaction.usecase.ts` |
| `use*.ts` | React hook | `useMonthlyDailyFlow.ts` |

---

## Domain Terms

### Transaction

A financial record representing money movement.

| Term | Type | Description |
|------|------|-------------|
| **Transaction** | Union | `IncomeExpenseTransaction \| TransferTransaction` |
| **TransactionType** | `'income' \| 'expense' \| 'transfer'` | Classification of transaction |
| **Income** | Type | Money received (salary, gifts, refunds) |
| **Expense** | Type | Money spent (purchases, bills, fees) |
| **Transfer** | Type | Money moved between accounts (not income/expense) |
| **occurredAt** | `Date` | When the transaction happened |
| **item** | `string` | What was bought/received (e.g., "Coffee", "Salary") |
| **merchant** | `string?` | Where the transaction occurred (e.g., "Starbucks") |

### Account

A financial account that holds or owes money.

| Term | Type | Description |
|------|------|-------------|
| **Account** | Entity | A wallet, bank account, or credit card |
| **AccountNature** | `'asset' \| 'liability'` | Whether account holds money (asset) or owes money (liability) |
| **AccountKind** | Enum | `cash`, `checking`, `savings`, `credit_card`, `loan`, `investment`, `other` |
| **key** | `string` | Unique identifier (e.g., `acct:cash_wallet`) |

### Category

Classification system for transactions.

| Term | Type | Description |
|------|------|-------------|
| **CategoryRef** | Object | Reference to a category `{ type, categoryKey, subCategoryKey? }` |
| **CategoryType** | `'expense' \| 'income' \| 'transfer'` | Which transaction type this category applies to |
| **categoryKey** | `string` | Top-level category (e.g., `food`, `housing`, `transportation`) |
| **subCategoryKey** | `string?` | Sub-category (e.g., `eating_out`, `rent`, `gas`) |

### Money

| Term | Type | Description |
|------|------|-------------|
| **Money** | `{ amount, currency }` | Value object representing monetary amount |
| **amount** | `number` | Numeric value (stored as dollars, not cents) |
| **currency** | `string` | ISO currency code (e.g., `USD`, `KRW`) |

---

## Architecture Terms

### Layers

| Term | Location | Description |
|------|----------|-------------|
| **Domain** | `src/domain/` | Pure business logic, no React/UI dependencies |
| **Infrastructure** | `src/infrastructure/` | External I/O (database, APIs) |
| **Features** | `src/features/` | Feature-specific screens and components |
| **Shared** | `src/shared/` | Cross-feature reusable code |

### Patterns

| Term | Description |
|------|-------------|
| **Repository** | Interface defining data access contract (domain layer) |
| **UseCase** | Business logic operations that orchestrate repositories |
| **Model** | Factory functions for creating domain entities |
| **Mapper** | Converts between database rows and domain entities |

### Data Flow

```
UI (Screen/Body/Section)
    ↓ calls
UseCase (business logic)
    ↓ uses
Repository Interface (contract)
    ↓ implemented by
Infrastructure Repository (SQLite)
    ↓ uses
Mapper (row → entity)
```

---

## UI/Design Terms

### Component Hierarchy

| Term | Description | Examples |
|------|-------------|----------|
| **Screen** | Full-page component, corresponds to a route | DashboardScreen, TransactionsScreen |
| **Body** | Main content area within a screen (switchable views) | MonthlyBody, YearlyBody |
| **Section** | Distinct area/Logical section within a Body | MonthlyCategorySection, DateTimeSection |
| **Card** | Self-contained, bordered UI block | BudgetSummaryCard |
| **Modal** | Overlay dialog that requires user action | AccountSelectionModal |

### Theme

| Term | Description |
|------|-------------|
| **semantic** | Context-aware colors (e.g., `text`, `background`, `primary`) |
| **finance** | Finance-specific colors (e.g., `income`, `expense`) |
| **tokens** | Design primitives (`spacing`, `fontSize`, `fontWeight`) |

### Header Variants

| Variant | fontSize | fontWeight | Use Case |
|---------|----------|------------|----------|
| `screen` | 20 | 900 (black) | Top of screen titles |
| `section` | 16 | 800 (heavy) | Section titles within body |
| `card` | 14 | 700 (bold) | Card titles |

---

## Abbreviations

| Abbr | Full | Description |
|------|------|-------------|
| **ADR** | Architecture Decision Record | Document recording architectural decisions |
| **PRD** | Product Requirements Document | Document defining what to build |
| **UUID** | Universally Unique Identifier | 36-char unique ID |
| **YYYYMM** | Year-Month format | e.g., `2026-01` |
| **YMD** | Year-Month-Day format | e.g., `2026-01-30` |

---

## Key Identifiers

| Pattern | Example | Description |
|---------|---------|-------------|
| `acct:*` | `acct:cash_wallet` | Account key |
| `tx:*` | `tx:abc123` | Transaction key |
| `cat:*` | `cat:food:eating_out` | Category reference (type:key:subkey) |

---
