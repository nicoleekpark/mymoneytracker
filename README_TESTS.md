# Test Suite Documentation

This document provides an overview of the test suite for HoH Finance Tracker.

## Overview

The test suite consists of **553 tests** across **36 test suites**, achieving **~78% code coverage**. Tests are organized into five categories:

| Category | Tests | Description |
|----------|-------|-------------|
| Unit Tests | ~460 | Domain models, services, stores, formatters, mappers, schemas |
| Integration Tests | 27 | Repository tests with real SQLite (in-memory) |
| Hook Tests | 56 | React hooks with @testing-library/react |
| Component Tests | 34 | React Native components with @testing-library/react-native |
| E2E Tests | 10 flows | Maestro mobile automation flows |

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Jest](https://jestjs.io/) | Test runner and assertion library |
| [jest-expo](https://docs.expo.dev/develop/unit-testing/) | Expo preset for Jest configuration |
| [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) | Hook testing utilities |
| [@testing-library/react-native](https://callstack.github.io/react-native-testing-library/) | Component testing utilities |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | In-memory SQLite for integration tests |
| [Maestro](https://maestro.mobile.dev/) | Mobile E2E test automation |

## Directory Structure

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
│   │   ├── account.schema.test.ts
│   │   ├── asset.schema.test.ts
│   │   ├── category.schema.test.ts
│   │   ├── notification.schema.test.ts
│   │   ├── price-tracker.schema.test.ts
│   │   ├── tag.schema.test.ts
│   │   └── transaction.schema.test.ts
│   ├── mapper/                       # Data mapper tests
│   │   ├── account.mapper.test.ts
│   │   ├── asset.mapper.test.ts
│   │   ├── draft.mapper.test.ts
│   │   ├── notification.mapper.test.ts
│   │   ├── price-tracker.mapper.test.ts
│   │   └── transaction.mapper.test.ts
│   ├── hooks/                        # React hook tests
│   │   ├── useAmountKeypad.test.ts
│   │   └── useAsyncData.test.ts
│   ├── components/                   # Component tests
│   │   ├── CategoryIcon.test.tsx
│   │   ├── ScalePressable.test.tsx
│   │   └── SectionHeader.test.tsx
│   ├── format.currency.test.ts       # Currency formatting tests
│   ├── format.date.test.ts           # Date formatting tests
│   └── transaction.utils.test.ts     # Transaction utility tests
└── integration/
    ├── setup/
    │   ├── testDatabase.ts           # In-memory SQLite setup
    │   └── testFixtures.ts           # Test data fixtures
    └── repository/
        └── transaction.repository.test.ts

e2e/
└── maestro/
    ├── README.md
    └── flows/
        ├── add-expense.yaml
        ├── add-income.yaml
        ├── add-transfer.yaml
        ├── app-launch.yaml
        ├── delete-transaction.yaml
        ├── edit-transaction.yaml
        ├── manage-drafts.yaml
        ├── navigate-accounts.yaml
        ├── view-categories.yaml
        └── view-dashboard.yaml
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (development)
```bash
npm run test:watch
```

### With Coverage Report
```bash
npm run test:coverage
```

### Specific Test File
```bash
npm test -- --testPathPattern="transaction.crud"
```

### Specific Test Directory
```bash
npm test -- --testPathPattern="__tests__/unit/model"
```

### Integration Tests Only
```bash
npm test -- --testPathPattern="__tests__/integration"
```

### E2E Tests (Maestro)

First, install Maestro:
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

Run all E2E flows:
```bash
maestro test e2e/maestro/flows/
```

Run a specific flow:
```bash
maestro test e2e/maestro/flows/add-expense.yaml
```

## What's Covered

### Domain Models (`core/domain/`)
- ✅ Transaction creation and validation
- ✅ Category reference validation
- ✅ Account type guards and sorting
- ✅ Asset model functions
- ✅ Money utilities

### Services (`core/services/`)
- ✅ Transaction CRUD operations (100% coverage)
- ✅ Transaction aggregations
- ✅ Transaction insights
- ✅ Transaction projections
- ✅ Notification triggers
- ✅ Account service
- ✅ Asset service

### Stores (`shared/store/`)
- ✅ Drafts store - load, add, update, remove, toggle star
- ✅ Settings store - budget alerts, thresholds, hydration

### Infrastructure
- ✅ All mappers (account, asset, draft, notification, price-tracker, transaction)
- ✅ All schemas (Zod validation)
- ✅ Transaction repository (integration tests)

### Formatters (`shared/format/`)
- ✅ Currency formatting (all functions)
- ✅ Date formatting

### Hooks (`shared/hooks/`)
- ✅ useAsyncData - loading states, error handling, refetch, skip
- ✅ useAmountKeypad - digit input, backspace, clear, conversion

### Components (`shared/components/`)
- ✅ SectionHeader
- ✅ CategoryIcon
- ✅ ScalePressable

## Coverage Targets

| Area | Current | Target |
|------|---------|--------|
| Overall | ~78% | 85%+ |
| Services | ~85% | 90%+ |
| Mappers | 100% | 100% |
| Schemas | 100% | 100% |
| Stores | 100% | 100% |

## Writing New Tests

### Unit Test Pattern
```typescript
// Mock dependencies at the top
jest.mock('@/infrastructure/repositories', () => ({
  someRepository: {
    method: jest.fn(),
  },
}))

import { functionToTest } from '@/core/services/module'
import { someRepository } from '@/infrastructure/repositories'

const mockMethod = someRepository.method as jest.MockedFunction<typeof someRepository.method>

describe('functionToTest', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does something expected', () => {
    mockMethod.mockReturnValue(expectedValue)

    const result = functionToTest(input)

    expect(result).toBe(expected)
    expect(mockMethod).toHaveBeenCalledWith(expectedArgs)
  })
})
```

### Integration Test Pattern
```typescript
import { createTestDataSource, initTestSchema } from '../setup/testDatabase'
import { seedTestAccounts, seedTestCategories } from '../setup/testFixtures'

describe('Repository', () => {
  let ds: TestDataSource

  beforeEach(() => {
    ds = createTestDataSource()
    initTestSchema(ds)
    seedTestAccounts(ds)
  })

  afterEach(() => {
    ds.close()
  })

  it('performs database operation', () => {
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

  it('handles actions', () => {
    const { result } = renderHook(() => useMyHook())

    act(() => {
      result.current.doAction()
    })

    expect(result.current.state).toBe(newState)
  })
})
```

### Component Test Pattern
```typescript
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { MyComponent } from '@/shared/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent prop="value" />)

    expect(screen.getByText('Expected Text')).toBeTruthy()
  })

  it('handles user interaction', () => {
    const onPress = jest.fn()
    render(<MyComponent onPress={onPress} />)

    fireEvent.press(screen.getByText('Button'))

    expect(onPress).toHaveBeenCalled()
  })
})
```

## Troubleshooting

### "Cannot find module 'react-native'" errors
The jest-expo preset handles React Native mocking. If you need to mock specific RN modules in a test file:
```typescript
jest.mock('react-native', () => ({
  Keyboard: { dismiss: jest.fn() },
  Platform: { OS: 'ios' },
}))
```

### "act() warning" in hook tests
Wrap state-changing operations in `act()` or use `waitFor()` for async operations:
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

### Maestro tests not finding elements
- Use `optional: true` for elements that may not exist
- Check that `testID` or `accessibilityLabel` props are set on components
- Run `maestro studio` to interactively find selectors

## CI/CD Integration

Add to your CI pipeline:
```yaml
# GitHub Actions example
- name: Run Tests
  run: npm test

- name: Run Coverage
  run: npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Docs](https://testing-library.com/docs/)
- [Expo Testing Guide](https://docs.expo.dev/develop/unit-testing/)
- [Maestro Documentation](https://maestro.mobile.dev/getting-started/installing-maestro)
