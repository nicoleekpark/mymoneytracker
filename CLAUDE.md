# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HoH Finance Tracker is a cross-platform personal finance app built with Expo/React Native and Tamagui. It supports iOS, Android, and web. The app uses expo-sqlite for local data persistence with a custom migration system.

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

The codebase follows **Clean Architecture** with explicit layer separation:

```
src/
├── app/                    # Expo Router screens (file-based routing)
├── features/               # Feature-specific components and hooks
│   └── dashboard/          # Example: monthly/yearly/all-time views
├── shared/                 # Cross-feature shared code
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Shared React hooks
│   ├── layout/             # Layout components (Screen, etc.)
│   └── format/             # Formatting utilities (currency, date)
├── domain/                 # Pure business logic (NO external dependencies)
│   ├── */types.ts          # Type definitions
│   ├── */model.ts          # Domain models and factories
│   ├── */repository.ts     # Repository interfaces (NOT implementations)
│   └── */usecase.ts        # Business logic operations
├── infrastructure/         # External integrations
│   ├── db/                 # SQLite utilities and migrations
│   ├── repositories/       # Repository implementations (Sqlite*)
│   └── mappers/            # Data transformation (DB row ↔ domain model)
├── store/                  # Zustand state management
├── providers/              # React context providers
├── theme/                  # Tamagui design system
└── config/                 # App configuration (categories, currencies)
```

### Key Architectural Rules

1. **Domain layer is pure**: `domain/` NEVER imports from `infrastructure/` - only defines interfaces
2. **Repository pattern**: Domain defines interfaces, infrastructure implements them
3. **Feature-first**: Code used by one feature stays in `features/xyz/`
4. **Shared code**: Code used by multiple features goes in `shared/`

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

All views and components MUST follow these universal design rules. See `src/theme/tokens/viewStyles.ts` for pre-composed styles.

### Color Token Rules

1. **NEVER use `textMuted`** - Always use `textSecondary`
2. **Use standard color types** from `viewStyles.ts`:
   - `BaseViewColors` - minimal (text, textSecondary, border, surface, surfaceAlt)
   - `StandardViewColors` - with semantic colors (primary, success, danger, warning)
3. **Pass colors from parent** - DashboardScreen creates colors, child views receive them

```tsx
// CORRECT - use StandardViewColors
import { StandardViewColors } from '@/theme/tokens/viewStyles'
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
import { componentStyles, numericStyles } from '@/theme/tokens/viewStyles'

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
