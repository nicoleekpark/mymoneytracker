# Testing Guide

> How to write and run tests in MyMoneyTracker.

---

## Overview

The project uses **Jest** with `jest-expo` for testing. Current status:
- **553 tests** across **36 test suites**
- **~78% code coverage**
- Covers models, services, stores, schemas, mappers, hooks, components, and repositories

---

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# With coverage report
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern="transaction.crud"

# Run specific directory
npm test -- --testPathPattern="__tests__/unit/model"

# Run integration tests only
npm test -- --testPathPattern="__tests__/integration"
```

---

## Test Structure

```
__tests__/
├── setup.ts                          # Jest setup file
├── unit/
│   ├── model/                        # Domain model tests
│   │   ├── account.model.test.ts
│   │   ├── asset.model.test.ts
│   │   ├── category.model.test.ts
│   │   ├── money.test.ts
│   │   └── transaction.model.test.ts
│   ├── services/                     # Service layer tests
│   │   ├── account.service.test.ts
│   │   ├── asset.service.test.ts
│   │   ├── notification.service.test.ts
│   │   ├── transaction.aggregations.test.ts
│   │   ├── transaction.crud.test.ts
│   │   ├── transaction.insights.test.ts
│   │   └── transaction.projections.test.ts
│   ├── store/                        # Zustand store tests
│   │   ├── drafts.store.test.ts
│   │   └── settings.store.test.ts
│   ├── schema/                       # Zod schema tests
│   │   └── *.schema.test.ts
│   ├── mapper/                       # Data mapper tests
│   │   └── *.mapper.test.ts
│   ├── hooks/                        # React hook tests
│   │   ├── useAmountKeypad.test.ts
│   │   └── useAsyncData.test.ts
│   ├── components/                   # Component tests
│   │   ├── CategoryIcon.test.tsx
│   │   ├── ScalePressable.test.tsx
│   │   └── SectionHeader.test.tsx
│   └── format.*.test.ts              # Formatter tests
└── integration/
    ├── setup/
    │   ├── testDatabase.ts           # In-memory SQLite setup
    │   └── testFixtures.ts           # Test data fixtures
    └── repository/
        └── transaction.repository.test.ts

e2e/
└── maestro/
    └── flows/                        # E2E test flows (YAML)
```

---

## Test Types

### Unit Tests

Test pure functions in isolation, no I/O or React.

**Location**: `__tests__/unit/`

**What to test**:
- Domain models and factories
- Mappers (DB row ↔ domain conversion)
- Zod schemas (validation rules)
- Service functions (with mocked repositories)
- Utility functions (formatting, calculations)

### Integration Tests

Test repositories with real SQLite database (in-memory).

**Location**: `__tests__/integration/`

**What to test**:
- Repository CRUD operations
- Aggregation queries
- Data consistency across layers
- Transaction atomicity

### Hook Tests

Test React hooks with `@testing-library/react`.

**Location**: `__tests__/unit/hooks/`

**What to test**:
- State transitions
- Loading/error states
- Refetch behavior
- Cleanup on unmount

### Component Tests

Test React Native components with `@testing-library/react-native`.

**Location**: `__tests__/unit/components/`

**What to test**:
- Rendering with props
- User interactions
- Accessibility

### E2E Tests

Full user flow testing with Maestro.

**Location**: `e2e/maestro/flows/`

**What to test**:
- Add transaction flow
- Edit/delete transactions
- Navigation between screens

---

## Writing Tests

### Service Test Pattern (with mocks)

```typescript
jest.mock('@/infrastructure/repositories', () => ({
  transactionRepository: {
    insertWithTags: jest.fn(),
    getById: jest.fn(),
  },
}))

import { addTransaction } from '@/core/services/transaction'
import { transactionRepository } from '@/infrastructure/repositories'

const mockInsert = transactionRepository.insertWithTags as jest.MockedFunction<
  typeof transactionRepository.insertWithTags
>

describe('addTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates transaction with generated ID', () => {
    const input = { type: 'expense', amountCents: 1000, ... }

    addTransaction(input)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ amountCents: 1000 }),
      []
    )
  })
})
```

### Integration Test Pattern (with real DB)

```typescript
import { createTestDataSource, initTestSchema } from '../setup/testDatabase'
import { seedTestAccounts } from '../setup/testFixtures'

describe('TransactionRepository', () => {
  let ds: TestDataSource

  beforeEach(() => {
    ds = createTestDataSource()
    initTestSchema(ds)
    seedTestAccounts(ds)
  })

  afterEach(() => {
    ds.close()
  })

  it('inserts and retrieves transaction', () => {
    // Test with real SQLite
  })
})
```

### Hook Test Pattern

```typescript
import { renderHook, act, waitFor } from '@testing-library/react'
import { useMyHook } from '@/shared/hooks/useMyHook'

describe('useMyHook', () => {
  it('returns expected state', async () => {
    const { result } = renderHook(() => useMyHook())

    await waitFor(() => {
      expect(result.current.data).toBe(expected)
    })
  })
})
```

### Component Test Pattern

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native'
import { MyComponent } from '@/shared/components/MyComponent'

describe('MyComponent', () => {
  it('handles press', () => {
    const onPress = jest.fn()
    render(<MyComponent onPress={onPress} />)

    fireEvent.press(screen.getByText('Button'))

    expect(onPress).toHaveBeenCalled()
  })
})
```

---

## Mocking Guidelines

### Mock Repositories

```typescript
jest.mock('@/infrastructure/repositories', () => ({
  transactionRepository: {
    getMonthTotals: jest.fn(),
    listByDateRange: jest.fn(),
  },
}))
```

### Mock UUID

```typescript
jest.mock('@/shared/utils/uuid', () => ({
  uuid: () => 'mock-uuid-123',
}))
```

### Mock React Native

```typescript
jest.mock('react-native', () => ({
  Keyboard: { dismiss: jest.fn() },
  Platform: { OS: 'ios' },
}))
```

---

## E2E Tests (Maestro)

### Install Maestro

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Run E2E Tests

```bash
# Run all flows
maestro test e2e/maestro/flows/

# Run specific flow
maestro test e2e/maestro/flows/add-expense.yaml

# Run with recording
maestro record e2e/maestro/flows/add-expense.yaml
```

### Flow Example

```yaml
appId: com.houseofhuynh.finance
---
- launchApp
- tapOn:
    id: "add-transaction-button"
- tapOn:
    text: "Expense"
- tapOn:
    id: "keypad-5"
- tapOn:
    id: "keypad-0"
- assertVisible:
    text: "$0.50"
```

---

## Coverage Targets

| Area | Current | Target |
|------|---------|--------|
| Overall | ~78% | 85%+ |
| Services | ~85% | 90%+ |
| Mappers | 100% | 100% |
| Schemas | 100% | 100% |
| Stores | 100% | 100% |

---

## Common Issues

### "Cannot find module 'react-native'" errors

The jest-expo preset handles React Native mocking. For specific modules:

```typescript
jest.mock('react-native', () => ({
  Keyboard: { dismiss: jest.fn() },
}))
```

### "act() warning" in hook tests

Use `waitFor()` for async operations:

```typescript
await waitFor(() => {
  expect(result.current.loading).toBe(false)
})
```

### Integration tests failing with SQLite errors

Ensure better-sqlite3 is installed:

```bash
npm install --save-dev better-sqlite3 @types/better-sqlite3
```

---

**Last Updated**: May 2026
