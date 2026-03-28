# Testing Guide

> How to write and run tests in HoH Ledger.

---

## Overview

The project uses **Jest** with `jest-expo` for testing. Current status:
- **260 tests** across **25 test suites**
- Covers mappers, schemas, models, services, and utilities

---

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

---

## Test Structure

```
__tests__/
├── unit/                           # Pure function tests
│   ├── mapper/                     # DB ↔ domain conversion
│   │   ├── account.mapper.test.ts
│   │   ├── asset.mapper.test.ts
│   │   ├── transaction.mapper.test.ts
│   │   ├── draft.mapper.test.ts
│   │   ├── notification.mapper.test.ts
│   │   └── price-tracker.mapper.test.ts
│   ├── model/                      # Domain model logic
│   │   ├── account.model.test.ts
│   │   ├── asset.model.test.ts
│   │   └── money.test.ts
│   ├── schema/                     # Zod validation tests
│   │   ├── account.schema.test.ts
│   │   ├── asset.schema.test.ts
│   │   ├── category.schema.test.ts
│   │   ├── notification.schema.test.ts
│   │   ├── price-tracker.schema.test.ts
│   │   ├── tag.schema.test.ts
│   │   └── transaction.schema.test.ts
│   ├── services/                   # Service layer tests
│   │   ├── account.service.test.ts
│   │   ├── asset.service.test.ts
│   │   ├── notification.service.test.ts
│   │   ├── transaction.aggregations.test.ts
│   │   ├── transaction.insights.test.ts
│   │   └── transaction.projections.test.ts
│   ├── format.currency.test.ts
│   ├── format.date.test.ts
│   └── transaction.utils.test.ts
├── integration/                    # Tests with DB or multiple modules
│   └── *.test.ts
├── setup.ts                        # Jest setup (mocks, globals)
└── README.md
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

Test multiple modules together, may include database.

**Location**: `__tests__/integration/`

**What to test**:
- Repository + database interactions
- Full use case flows
- Data consistency across layers

### E2E Tests (Future)

Full user flow testing with Detox or Maestro.

**Location**: `e2e/`

---

## Writing Tests

### Basic Pattern

```typescript
// __tests__/unit/example.test.ts
import { myFunction } from '@/core/domain/example'

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction(input)
    expect(result).toBe(expected)
  })

  it('should handle edge case', () => {
    expect(() => myFunction(null)).toThrow()
  })
})
```

### Path Aliases

Use `@/` for src imports (configured in `jest.config.js`):

```typescript
// Correct - use path alias
import { isExpense } from '@/core/domain/transaction/transaction.utils'

// Avoid - relative paths
import { isExpense } from '../../../src/core/domain/transaction/transaction.utils'
```

---

## Testing Patterns by Layer

### Mapper Tests

Test DB row ↔ domain model conversion:

```typescript
// __tests__/unit/mapper/account.mapper.test.ts
import { AccountMapper } from '@/infrastructure/mappers/account.mapper'

describe('AccountMapper', () => {
  describe('toDomain', () => {
    it('converts DB row to domain model', () => {
      const row = {
        id: 'uuid-123',
        name: 'Checking',
        type: 'checking',
        balance_cents: 10050,
        is_archived: 0,
        created_at: '2026-01-15T10:00:00Z',
      }

      const account = AccountMapper.toDomain(row)

      expect(account.id).toBe('uuid-123')
      expect(account.name).toBe('Checking')
      expect(account.balanceCents).toBe(10050)
      expect(account.isArchived).toBe(false)
      expect(account.createdAt).toBeInstanceOf(Date)
    })
  })

  describe('toDatabase', () => {
    it('converts domain model to DB row', () => {
      const account = {
        id: 'uuid-123',
        name: 'Checking',
        type: 'checking',
        balanceCents: 10050,
        isArchived: false,
        createdAt: new Date('2026-01-15T10:00:00Z'),
      }

      const row = AccountMapper.toDatabase(account)

      expect(row.balance_cents).toBe(10050)
      expect(row.is_archived).toBe(0)
      expect(row.created_at).toBe('2026-01-15T10:00:00.000Z')
    })
  })
})
```

### Schema Tests

Test Zod validation rules:

```typescript
// __tests__/unit/schema/account.schema.test.ts
import { AccountSchema } from '@/core/domain/account/account.schema'

describe('AccountSchema', () => {
  it('validates correct account', () => {
    const valid = {
      id: 'uuid-123',
      name: 'Checking',
      type: 'checking',
      balanceCents: 10050,
    }

    expect(() => AccountSchema.parse(valid)).not.toThrow()
  })

  it('rejects empty name', () => {
    const invalid = {
      id: 'uuid-123',
      name: '',
      type: 'checking',
      balanceCents: 0,
    }

    expect(() => AccountSchema.parse(invalid)).toThrow()
  })

  it('rejects invalid account type', () => {
    const invalid = {
      id: 'uuid-123',
      name: 'Account',
      type: 'invalid-type',
      balanceCents: 0,
    }

    expect(() => AccountSchema.parse(invalid)).toThrow()
  })
})
```

### Service Tests

Test service functions with mocked repositories:

```typescript
// __tests__/unit/services/account.service.test.ts
import { getActiveAccounts } from '@/core/services/account/account.service'

// Mock the repository
jest.mock('@/infrastructure/repositories', () => ({
  accountRepository: {
    listActive: jest.fn(),
  },
}))

import { accountRepository } from '@/infrastructure/repositories'

describe('getActiveAccounts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns active accounts from repository', () => {
    const mockAccounts = [
      { id: '1', name: 'Checking', isArchived: false },
      { id: '2', name: 'Savings', isArchived: false },
    ]

    ;(accountRepository.listActive as jest.Mock).mockReturnValue(mockAccounts)

    const result = getActiveAccounts()

    expect(result).toEqual(mockAccounts)
    expect(accountRepository.listActive).toHaveBeenCalledTimes(1)
  })
})
```

### Model Tests

Test domain model factories and validation:

```typescript
// __tests__/unit/model/account.model.test.ts
import { createAccount } from '@/core/domain/account/account.model'

describe('createAccount', () => {
  it('creates account with generated ID', () => {
    const account = createAccount({
      name: 'Checking',
      type: 'checking',
    })

    expect(account.id).toBeDefined()
    expect(account.name).toBe('Checking')
    expect(account.balanceCents).toBe(0)
    expect(account.isArchived).toBe(false)
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

### Mock Dates

```typescript
beforeEach(() => {
  jest.useFakeTimers()
  jest.setSystemTime(new Date('2026-03-15'))
})

afterEach(() => {
  jest.useRealTimers()
})
```

### Mock UUID Generation

```typescript
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-123',
}))
```

---

## Best Practices

1. **Test behavior, not implementation** - Focus on what the function does, not how
2. **One assertion per test** (when reasonable) - Makes failures easier to diagnose
3. **Use descriptive test names** - Should read like requirements
4. **Arrange-Act-Assert pattern** - Clear test structure
5. **Keep tests independent** - Each test should run in isolation
6. **Clean up after tests** - Reset mocks, clear timers

---

## Common Issues

### Path Alias Not Working

Ensure `jest.config.js` has `moduleNameMapper`:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

### Async Test Timeout

Increase timeout for slow tests:

```typescript
it('handles slow operation', async () => {
  // test code
}, 10000)  // 10 second timeout
```

### Mock Not Resetting

Always clear mocks in `beforeEach`:

```typescript
beforeEach(() => {
  jest.clearAllMocks()
})
```

---

**Last Updated**: March 2026
