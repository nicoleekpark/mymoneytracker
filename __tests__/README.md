# Tests

## Setup

```bash
npm install   # Install jest-expo and dependencies
```

## Structure

```
__tests__/
├── unit/           # Pure function tests (no React, no DB)
│   └── *.test.ts
├── integration/    # Tests with DB or multiple modules
│   └── *.test.ts
├── setup.ts        # Jest setup (mocks, globals)
└── README.md

e2e/                # End-to-end tests (Detox/Maestro) - future
```

## Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

## Conventions

| Type | Location | What to test |
|------|----------|--------------|
| Unit | `__tests__/unit/` | Pure functions, domain models |
| Integration | `__tests__/integration/` | Repository + DB, use cases |
| E2E | `e2e/` | Full user flows |

## Writing Tests

```typescript
// __tests__/unit/example.test.ts
import { myFunction } from '@/domain/example'

describe('myFunction', () => {
  it('does something', () => {
    expect(myFunction(input)).toBe(expected)
  })
})
```

## Path Aliases

Use `@/` for src imports (configured in jest.config.js):

```typescript
import { isExpense } from '@/domain/transaction/transaction.utils'
```
