---
globs: ["src/features/**/*.ts", "src/features/**/*.tsx"]
---

# Feature Rules

## Structure

```
features/
└── dashboard/
    ├── index.ts              # Public exports only
    ├── DashboardScreen.tsx   # Main screen component
    ├── types/                # Feature-specific types
    │   └── dashboard.types.ts
    ├── store/                # Zustand store for feature state
    │   └── dashboard.store.ts
    ├── shared/               # Shared across sub-features
    │   ├── index.ts
    │   ├── DashboardHeader.tsx
    │   └── DashboardScreen.styles.ts
    ├── utils/                # Pure utility functions
    │   └── periodToYYYYMM.ts
    └── monthly/              # Sub-feature module
        ├── index.ts
        ├── MonthlyBody.tsx
        └── useMonthlySummary.ts
```

## Guidelines

- Keep feature code private until needed elsewhere
- If used by multiple features → move to `shared/`
- Export public API through `index.ts`
- Co-locate hooks with their feature

## Sub-feature Organization

Complex features can have sub-features (e.g., dashboard has monthly/, yearly/, all/):
- Each sub-feature has its own `index.ts` for exports
- Sub-features share code via parent's `shared/` folder
- Each sub-feature can have its own hooks and components

## File Patterns

| Pattern | Location | Example |
|---------|----------|---------|
| Main screen | `Feature.tsx` or `FeatureScreen.tsx` | `DashboardScreen.tsx` |
| Sub-screen | `subfeature/SubfeatureBody.tsx` | `monthly/MonthlyBody.tsx` |
| Styles | `*.styles.ts` in `shared/` | `DashboardScreen.styles.ts` |
| Store | `store/*.store.ts` | `dashboard.store.ts` |
| Types | `types/*.types.ts` | `dashboard.types.ts` |
| Hooks | Co-located or in `hooks/` | `useMonthlySummary.ts` |

## Hook Naming

- `use{Feature}{Action}` for feature-specific: `useMonthlySummary`, `useTransactionsData`
- `use{Feature}Navigation` for navigation helpers: `useAssetsNavigation`
- `use{Feature}Store` for Zustand stores: `useDashboardStore`

## Index Exports

Only export what other features need:
```tsx
// features/dashboard/index.ts
export { DashboardScreen } from './DashboardScreen'
export type { DashboardMode } from './types'
// Don't export internal components, hooks, or utils
```
