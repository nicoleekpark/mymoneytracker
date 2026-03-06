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

Shared components export from `shared/components/index.ts`.
