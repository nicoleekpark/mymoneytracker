---
globs: ["src/shared/components/**/*.tsx", "src/features/**/components/**/*.tsx"]
---

# Component Rules

Use React Native primitives with design tokens:
- `View` for layout
- `Text` for typography
- `StyleSheet.create()` for styles

Pattern:
```tsx
import { View, Text, StyleSheet } from 'react-native'
import { useHoHTheme } from '@/shared/providers'
import { spacing } from '@/shared/theme/tokens'

export function MyComponent({ ... }: Props) {
  const theme = useHoHTheme()

  return (
    <View style={[styles.container, { backgroundColor: theme.semantic.surface }]}>
      <Text style={[styles.text, { color: theme.semantic.text }]}>
        ...
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  text: {
    fontSize: 16,
  },
})
```

Tokens:
- Spacing: Use `spacing.*` from `@/shared/theme/tokens`
- Typography: Use `fontSize.*`, `fontWeight.*` from tokens
- Colors: Use `theme.semantic.*` from `useHoHTheme()`
- Never hardcode colors or magic pixel values

## Style Files

When a component needs complex styles, extract to a co-located `*.styles.ts` file:

Pattern:
```tsx
// Component.styles.ts
import { StyleSheet } from 'react-native'
import type { useHoHTheme } from '@/shared/providers'

export function createComponentStyles(theme: ReturnType<typeof useHoHTheme>) {
  return StyleSheet.create({
    container: { ... },
    text: { ... },
  })
}

export type ComponentStyles = ReturnType<typeof createComponentStyles>
```

Usage:
```tsx
// Component.tsx
import { createComponentStyles } from './Component.styles'

export function Component() {
  const theme = useHoHTheme()
  const styles = useMemo(() => createComponentStyles(theme), [theme])
  // ...
}
```

Rules:
- File naming: `ComponentName.styles.ts` (not `styles.ts` or `ComponentName.style.ts`)
- Factory function: `createComponentNameStyles(theme)`
- Export the return type: `export type ComponentStyles = ReturnType<...>`
- Memoize in component: `useMemo(() => createStyles(theme), [theme])`

Shared components export from `shared/components/index.ts`.
