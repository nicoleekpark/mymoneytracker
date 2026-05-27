# Maestro E2E Tests

End-to-end tests for HoH Finance Tracker using [Maestro](https://maestro.mobile.dev/).

## Prerequisites

Install Maestro CLI:
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

## Running Tests

### Run All Flows
```bash
maestro test e2e/maestro/flows/
```

### Run Individual Flow
```bash
maestro test e2e/maestro/flows/add-expense.yaml
```

### Run with Recording
```bash
maestro record e2e/maestro/flows/add-expense.yaml
```

## Test Flows

| Flow | Description |
|------|-------------|
| `app-launch.yaml` | Tests basic app launch and initial screen rendering |
| `add-expense.yaml` | Tests adding a new expense transaction |
| `add-income.yaml` | Tests adding a new income transaction |
| `add-transfer.yaml` | Tests adding a transfer between accounts |
| `view-dashboard.yaml` | Tests navigating through dashboard views |
| `edit-transaction.yaml` | Tests editing an existing transaction |
| `delete-transaction.yaml` | Tests deleting a transaction |
| `navigate-accounts.yaml` | Tests viewing and navigating accounts |
| `view-categories.yaml` | Tests viewing category breakdowns |
| `manage-drafts.yaml` | Tests creating and managing drafts |

## Notes

- Tests use `optional: true` for UI elements that may vary
- Update selectors (`id`, `text`) to match actual app implementation
- Run against a dev build with `clearState: true` for clean test runs
