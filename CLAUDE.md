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

### Token-First Development (CRITICAL)

**ALWAYS check for existing tokens before creating any component:**

1. **Before writing styles**, check these files:
   - `src/shared/theme/tokens/spacing.ts` - spacing values
   - `src/shared/theme/tokens/radius.ts` - border radius
   - `src/shared/theme/tokens/typography.ts` - font sizes, weights
   - `src/shared/theme/tokens/modal/` - modal-specific styles
   - `src/shared/theme/tokens/viewStyles.ts` - pre-composed styles

2. **If a token exists, USE IT** - Never hardcode values that exist in tokens
   ```tsx
   // ❌ Bad
   paddingHorizontal: 16

   // ✅ Good
   paddingHorizontal: spacing.lg
   ```

3. **Proactively suggest new tokens** when you see:
   - Same magic number used 3+ times
   - Style that matches an existing pattern but isn't tokenized

4. **Proactively suggest shared components** (CRITICAL):
   - **BEFORE implementing**: Search for similar patterns in codebase
   - If same UI/logic exists elsewhere → suggest extracting to `shared/components/`
   - Examples: `TrackingSince`, `SectionHeader`, `EmptyState`
   - Ask: "이 패턴이 다른 곳에서도 사용되나요? 공통 컴포넌트로 만들까요?"

5. **Modal components** - Always use `modalStyles` from `@/shared/theme/tokens/modal`:
   - `modalStyles.dragHandle`, `modalStyles.dragHandleContainer`
   - `modalStyles.modal` for backgroundStyle (includes `radius.sheet`)
   - `modalStyles.ctaPrimaryButton`, `modalStyles.saveButton`
   - Helper functions: `getScrollContentPadding()`, `getSheetBottomPadding()`

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
