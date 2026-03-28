---
globs: ["src/shared/components/**/*.tsx", "src/features/**/components/**/*.tsx"]
---

# Component Rules

Use Tamagui primitives:
- `XStack`, `YStack` for layout (not View)
- `Text` for typography (not RN Text)
- `styled()` for component variants

Pattern:
```tsx
import { XStack, YStack, Text, styled } from 'tamagui'

export function MyComponent({ ... }: Props) {
  return (
    <YStack gap="$3" padding="$4">
      ...
    </YStack>
  )
}
```

Tokens:
- Spacing: `$1`, `$2`, `$3`, `$4` (semantic scale)
- Colors: Use theme tokens (`$background`, `$color`, `$borderColor`)
- Never hardcode colors or pixel values

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
