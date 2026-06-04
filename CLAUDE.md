# CLAUDE.md

Guidelines for Claude Code when working with this repository.

## Project Overview

MyMoneyTracker - Privacy-first personal finance app built with Expo/React Native. Offline-first with SQLite.

## Architecture

```
src/
├── app/              # Expo Router screens
├── core/
│   ├── domain/       # Pure types, models (NO external deps)
│   └── services/     # Business logic (orchestrates domain + infra)
├── features/         # Feature modules (dashboard, transactions, etc.)
├── infrastructure/   # SQLite, repositories, mappers
└── shared/           # Reusable components, hooks, theme, store
```

### Layer Rules

```
features/ ──► core/services/ ──► infrastructure/
                    │
                    ▼
              core/domain/
              (pure types)
```

1. **Domain is pure** - `core/domain/` NEVER imports from `infrastructure/`
2. **Services orchestrate** - `core/services/` imports from domain + infrastructure
3. **Features import services** - functions from `core/services/`, types from `core/domain/`
4. **Feature-first** - Code for one feature stays in `features/xyz/`
5. **Shared code** - Code used by multiple features goes in `shared/`

### File Naming

| Layer | Pattern | Purpose |
|-------|---------|---------|
| `core/domain/` | `*.types.ts` | Type definitions |
| `core/domain/` | `*.model.ts` | Factory functions |
| `core/domain/` | `*.repository.ts` | Repository interfaces |
| `core/services/` | `*.service.ts` | Business logic |
| `infrastructure/` | `Sqlite*.ts` | Repository implementations |
| `infrastructure/` | `*.mapper.ts` | DB ↔ domain conversion |

## Design System

See `src/shared/theme/tokens/viewStyles.ts` for pre-composed styles.

### Color Tokens

- **NEVER use `textMuted`** - Always use `textSecondary`
- Use `BaseViewColors` or `StandardViewColors` from `viewStyles.ts`
- Pass colors from parent components

### Typography

| Component | Font Size | Font Weight | Notes |
|-----------|-----------|-------------|-------|
| Hero value | displaySize.xl | heavy | Main amount |
| Section title | lg | semibold | With divider above |
| List row | sm | semibold | + tabular-nums for amounts |
| Field label | xs | medium | letterSpacing: 0.5 |

- **Numeric amounts** - Always use `fontVariant: ['tabular-nums']`
