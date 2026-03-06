---
globs: ["src/features/**/*.ts", "src/features/**/*.tsx"]
---

# Feature Rules

Structure:
```
features/
└── dashboard/
    ├── index.ts              # Public exports
    ├── components/           # Feature-specific components
    ├── hooks/                # Feature-specific hooks
    └── monthly/              # Sub-feature modules
        ├── index.ts
        └── useMonthlySummary.ts
```

Guidelines:
- Keep feature code private until needed elsewhere
- If used by multiple features → move to `shared/`
- Export public API through `index.ts`
- Co-locate hooks with their feature

Hook naming:
- `use{Feature}{Action}` (e.g., `useMonthlySummary`, `useTransactionsData`)
