---
globs: ["src/app/**/*.tsx"]
---

# Screen Rules (Expo Router)

Screens are thin orchestrators:
- Compose feature components
- Handle navigation
- Minimal business logic

Pattern:
```tsx
import { Screen } from '@/shared/layout'
import { DashboardToolbar } from '@/features/dashboard'

export default function DashboardScreen() {
  return (
    <Screen>
      <DashboardToolbar />
      {/* Feature components */}
    </Screen>
  )
}
```

File conventions:
- `(tabs)/` - Tab navigator screens
- `(modal)/` - Modal screens
- `_layout.tsx` - Layout configuration
- `+not-found.tsx` - 404 handling
