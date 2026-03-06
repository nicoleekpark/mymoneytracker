---
globs: ["src/store/**/*.ts"]
---

# Zustand Store Rules

Pattern:
```tsx
import { create } from 'zustand'

interface ThemeState {
  mode: 'light' | 'dark'
  setMode: (mode: 'light' | 'dark') => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'light',
  setMode: (mode) => set({ mode }),
}))
```

Guidelines:
- One store per concern (theme, notifications, drafts)
- Keep stores flat, avoid deep nesting
- Actions are methods on the store, not separate functions
- Export from `store/index.ts`
