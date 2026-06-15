# Development Guide

## Prerequisites

```bash
node --version   # v22.14.0+
npm --version    # 10.9.2+
git --version    # 2.39+
```

For iOS development:
- Xcode 15+
- iOS Simulator

---

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/nicoleekpark/hoh_ledger
cd hoh_ledger
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 3. Run the App

```bash
# iOS with dev-client (required for SQLite)
npm run dev

# Android with dev-client
npm run dev:android
```

---

## Common Commands

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Run iOS with dev-client (SQLite) |
| `npm run dev:android` | Run Android with dev-client |
| `npm run build:ios` | Build native iOS project |
| `npm run build:android` | Build native Android project |

### Database

| Command | Description |
|---------|-------------|
| `npm run db:migrate:new <name>` | Create new migration |
| `npm run db:migrate:regen` | Regenerate migrations index |
| `npm run db:pull` | Export simulator database |
| `npm run db:reset` | Reset database (uninstall app) |

### Testing

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | Run with coverage report |

### Code Quality

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix lint issues |
| `npm run format` | Format with Prettier |
| `npm run typecheck` | TypeScript check |

---

## Database Migrations

### Creating a Migration

```bash
npm run db:migrate:new add_tags_table
```

This creates `src/infrastructure/db/migrations/YYYYMMDDHHMMSS_add_tags_table.ts`:

```typescript
export const migration_20260101120000_add_tags_table = {
  id: 20260101120000,
  name: 'add_tags_table',
  up: () => {
    exec(`
      CREATE TABLE tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
      )
    `)
  }
}
```

After creating, regenerate the index:

```bash
npm run db:migrate:regen
```

### Resetting the Database

```bash
# Method 1: Delete app from simulator
npm run ios:uninstall

# Method 2: Full reset script
npm run db:reset
```

---

## Project Structure

```
hoh_ledger/
├── src/
│   ├── app/                    # Expo Router screens
│   │   ├── (tabs)/             # Tab navigation
│   │   └── (modal)/            # Modal screens
│   ├── core/
│   │   ├── domain/             # Pure types, models, schemas
│   │   └── services/           # Business logic
│   ├── features/               # Feature modules
│   ├── infrastructure/
│   │   ├── db/                 # SQLite setup, migrations
│   │   ├── repositories/       # Data access
│   │   └── mappers/            # DB ↔ Domain conversion
│   └── shared/
│       ├── components/         # Reusable UI
│       ├── hooks/              # Custom hooks
│       ├── store/              # Zustand stores
│       └── theme/              # Design tokens
├── __tests__/                  # Test files
├── e2e/                        # Maestro E2E tests (planned)
└── docs/                       # Documentation
```

---

## Rebuilding Native Code

When you add or update native modules:

```bash
# Full rebuild
npm run build:ios && npm run dev
```

---

## Debugging

### SQLite Database

Export the database from simulator:

```bash
npm run db:pull
# Database exported to db_exports/
```

Use a SQLite viewer (e.g., DB Browser for SQLite) to inspect.

### React Native Debugger

1. Shake device or press `Cmd+D` in simulator
2. Select "Debug with Chrome" or use Flipper

---

## Troubleshooting

### "Cannot connect to Metro bundler"

```bash
# Clear cache and restart
npx expo start -c
```

### "Native module not found" (SQLite)

Make sure you're using dev-client, not Expo Go:

```bash
npm run dev
```

### Database migration errors

Reset the database:

```bash
npm run ios:uninstall
npm run dev
```
