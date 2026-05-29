# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyMoneyTracker is a cross-platform personal finance app built with Expo/React Native and Tamagui. It supports iOS, Android, and web. The app uses expo-sqlite for local data persistence with a custom migration system.

## Common Commands

```bash
# Development
npm run start:ios              # Run with Expo Go (UI-only, no native modules)
npm run start:dev:ios          # Run with dev-client (required for SQLite)
npm run ios:run                # Rebuild native iOS project

# Database
npm run db:migration:new <name>   # Create a new migration
npm run db:migration:regen        # Regenerate migrations index
npm run db:dev:pull               # Export simulator database for inspection
npm run db:reset                  # Reset database (uninstall app)

# Full rebuild (when adding/updating native modules)
npm run ios:run && npm run start:dev:ios
```

## Architecture

The codebase follows **Clean Architecture** with 5 top-level folders:

```
src/
├── app/                    # Expo Router screens (file-based routing)
│
├── core/                   # Business logic layer
│   ├── domain/             # Pure types, models, schemas (NO external deps)
│   │   ├── */types.ts      # Type definitions
│   │   ├── */model.ts      # Domain models and factories
│   │   ├── */schema.ts     # Zod schemas for runtime validation
│   │   └── */repository.ts # Repository interfaces (NOT implementations)
│   └── services/           # Application services (orchestrates domain + infrastructure)
│       └── */service.ts    # Service functions (e.g., getActiveAccounts)
│
├── features/               # Feature-specific components and hooks
│   └── dashboard/          # Example: monthly/yearly/all-time views
│
├── infrastructure/         # External integrations
│   ├── db/                 # SQLite utilities and migrations
│   ├── repositories/       # Repository implementations (Sqlite*)
│   └── mappers/            # Data transformation (DB row ↔ domain model)
│
└── shared/                 # Cross-cutting concerns
    ├── components/         # Reusable UI components
    ├── config/             # App configuration (categories, currencies)
    ├── format/             # Formatting utilities (currency, date)
    ├── hooks/              # Shared React hooks
    ├── layout/             # Layout components (Screen, etc.)
    ├── providers/          # React context providers
    ├── store/              # Zustand state management
    ├── theme/              # Tamagui design system
    └── utils/              # Utility functions
```

### Layer Dependencies

```
features/ ──────► core/services/ ──────► infrastructure/
                       │
                       ▼
                 core/domain/
                 (pure types)
```

### Key Architectural Rules

1. **Domain layer is pure**: `core/domain/` NEVER imports from `infrastructure/` - only defines types, models, interfaces
2. **Services orchestrate**: `core/services/` imports from both `core/domain/` (types) and `infrastructure/` (repos)
3. **Features import services**: `features/` imports functions from `core/services/`, types from `core/domain/`
4. **Repository pattern**: Domain defines interfaces, infrastructure implements them
5. **Feature-first**: Code used by one feature stays in `features/xyz/`
6. **Shared code**: Code used by multiple features goes in `shared/`

### File Naming by Layer

| Layer | Pattern | Purpose |
|-------|---------|---------|
| `core/domain/` | `*.types.ts` | Type definitions |
| `core/domain/` | `*.model.ts` | Factory functions, validation |
| `core/domain/` | `*.schema.ts` | Zod schemas for runtime validation |
| `core/domain/` | `*.repository.ts` | Repository interfaces |
| `core/services/` | `*.service.ts` | Orchestrates domain + infrastructure |
| `infrastructure/` | `Sqlite*.ts` | Repository implementations |
| `infrastructure/` | `*.mapper.ts` | DB row ↔ domain conversion |

## Database Migrations

Migrations live in `src/infrastructure/db/migrations/`. Each migration exports:
- `id`: Timestamp-based unique identifier (e.g., `20260106121718`)
- `name`: Descriptive name
- `up()`: Function that executes SQL

After creating a migration, run `npm run db:migration:regen` to update the index.

## Tech Stack

- **Framework**: Expo SDK 54 with expo-router
- **UI**: Tamagui + React Native
- **Database**: expo-sqlite (synchronous API)
- **State**: Zustand
- **Navigation**: expo-router (file-based)

## Design System

All views and components MUST follow these universal design rules. See `src/shared/theme/tokens/viewStyles.ts` for pre-composed styles.

### Color Token Rules

1. **NEVER use `textMuted`** - Always use `textSecondary`
2. **Use standard color types** from `viewStyles.ts`:
   - `BaseViewColors` - minimal (text, textSecondary, border, surface, surfaceAlt)
   - `StandardViewColors` - with semantic colors (primary, success, danger, warning)
3. **Pass colors from parent** - DashboardScreen creates colors, child views receive them

```tsx
// CORRECT - use StandardViewColors
import { StandardViewColors } from '@/shared/theme/tokens/viewStyles'
type Props = { colors: StandardViewColors }

// WRONG - don't create custom types with textMuted
type BadColors = { textMuted: string } // NEVER
```

### Typography Rules

1. **Numeric amounts in columns** - Always use `fontVariant: ['tabular-nums']`
2. **Field labels** - Use `fontSize.xs` + `letterSpacing: 0.5`
3. **Category names in lists** - Use `fontWeight.semibold`
4. **Row amounts** - Use `fontWeight.semibold` + `fontVariant: ['tabular-nums']`

```tsx
// Import pre-composed styles
import { componentStyles, numericStyles } from '@/shared/theme/tokens/viewStyles'

// Use for list rows
<Text style={[componentStyles.listRow.amount, { color: colors.text }]}>
  {formatUsdInt(amount)}
</Text>

// Use for category labels
<Text style={[componentStyles.categoryRow.label, { color: colors.text }]}>
  {category.name}
</Text>
```

### Section Structure

1. **Section gap** - Use `SECTION_GAP` from viewStyles (spacing['2xl'])
2. **Section header** - Divider above + title with `fontSize.lg` + `fontWeight.semibold`
3. **Hero sections** - Centered, use `displaySize.xl` for primary value

### Component Style Reference

| Component | Font Size | Font Weight | Letter Spacing | Notes |
|-----------|-----------|-------------|----------------|-------|
| Hero label | xs (12) | medium | 0.5 | Uppercase optional |
| Hero value | displaySize.xl (48) | heavy | -1 | Main amount |
| Section title | lg (18) | semibold | normal | With divider above |
| List row title | sm (14) | semibold | normal | |
| List row amount | sm (14) | semibold | normal | + tabular-nums |
| Field label | xs (12) | medium | 0.5 | Forms only |
| Chart axis | xs (12) | normal | normal | opacity: 0.7 |
| Empty state title | lg (18) | semibold | normal | Centered |
