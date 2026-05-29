# Design System Reference

> Visual design rules and component styling for MyMoneyTracker.

---

## Overview

All views and components MUST follow these universal design rules. The design system is implemented in:

- **Source**: `src/shared/theme/tokens/viewStyles.ts`
- **Tokens**: `src/shared/theme/tokens/` (typography, spacing, radius)

---

## Color Tokens

### Color Types

Use standard color types from `viewStyles.ts`:

| Type | Colors Included | Use Case |
|------|-----------------|----------|
| `BaseViewColors` | text, textSecondary, border, surface, surfaceAlt | Minimal views |
| `StandardViewColors` | Base + primary, success, danger, warning | Most feature views |

### Critical Rules

1. **NEVER use `textMuted`** - Always use `textSecondary`
2. **Pass colors from parent** - Parent screens create colors, child views receive them
3. **Never create custom color types** - Always extend from `BaseViewColors`

### Usage Pattern

```tsx
// CORRECT - use StandardViewColors
import { StandardViewColors } from '@/shared/theme/tokens/viewStyles'

type Props = {
  colors: StandardViewColors
}

function MyComponent({ colors }: Props) {
  return (
    <Text style={{ color: colors.textSecondary }}>
      Secondary text
    </Text>
  )
}

// WRONG - don't create custom types with textMuted
type BadColors = { textMuted: string }  // NEVER
```

### Semantic Colors

| Color | Token | Usage |
|-------|-------|-------|
| Primary text | `colors.text` | Main content |
| Secondary text | `colors.textSecondary` | Labels, hints, captions |
| Primary accent | `colors.primary` | Links, selected states |
| Success | `colors.success` | Income, positive amounts |
| Danger | `colors.danger` | Expenses, negative amounts, errors |
| Warning | `colors.warning` | Alerts, pending states |
| Border | `colors.border` | Dividers, outlines |
| Surface | `colors.surface` | Card backgrounds |
| Surface Alt | `colors.surfaceAlt` | Alternate backgrounds |

---

## Typography

### Font Scale

| Token | Size | Usage |
|-------|------|-------|
| `fontSize.xs` | 12px | Labels, hints, captions |
| `fontSize.sm` | 14px | Body text, list items |
| `fontSize.md` | 16px | Standard text |
| `fontSize.lg` | 18px | Section titles |
| `fontSize.xl` | 20px | Large text |
| `displaySize.xl` | 48px | Hero values |

### Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| `fontWeight.normal` | 400 | Body text |
| `fontWeight.medium` | 500 | Labels, hints |
| `fontWeight.semibold` | 600 | List items, category names |
| `fontWeight.bold` | 700 | Emphasis |
| `fontWeight.heavy` | 800 | Hero values |

### Typography Rules

1. **Numeric amounts in columns** - Always use `fontVariant: ['tabular-nums']`
2. **Field labels** - Use `fontSize.xs` + `letterSpacing: 0.5`
3. **Category names in lists** - Use `fontWeight.semibold`
4. **Row amounts** - Use `fontWeight.semibold` + `fontVariant: ['tabular-nums']`

### Example

```tsx
import { componentStyles, numericStyles } from '@/shared/theme/tokens/viewStyles'

// List row amount - uses tabular nums for alignment
<Text style={[componentStyles.listRow.amount, { color: colors.text }]}>
  {formatUsdInt(amount)}
</Text>

// Category label
<Text style={[componentStyles.categoryRow.label, { color: colors.text }]}>
  {category.name}
</Text>
```

---

## Component Style Reference

Quick reference for all component types:

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

---

## Pre-composed Styles

Import from `viewStyles.ts`:

```tsx
import { componentStyles, numericStyles, SECTION_GAP } from '@/shared/theme/tokens/viewStyles'
```

### Available Styles

| Style | Properties | Usage |
|-------|------------|-------|
| `componentStyles.hero.label` | xs, medium, 0.5 spacing | Hero section label |
| `componentStyles.hero.value` | 48px, heavy, -1 spacing | Hero amount |
| `componentStyles.sectionHeader.title` | lg, semibold | Section headers |
| `componentStyles.listRow.title` | sm, semibold | List item names |
| `componentStyles.listRow.amount` | sm, semibold, tabular-nums | List item amounts |
| `componentStyles.categoryRow.label` | sm, semibold | Category names |
| `componentStyles.categoryRow.amount` | sm, semibold, tabular-nums | Category amounts |
| `componentStyles.formField.label` | xs, medium, 0.5 spacing | Form labels |
| `componentStyles.chartLabel.axis` | xs, opacity 0.7 | Chart axes |
| `componentStyles.emptyState.title` | lg, semibold, centered | Empty state |
| `numericStyles.tabular` | tabular-nums only | Any numeric column |
| `numericStyles.amount` | semibold + tabular-nums | Amount displays |

---

## Section Structure

### Layout Constants

```tsx
import { SECTION_GAP, TAB_BAR_HEIGHT } from '@/shared/theme/tokens/viewStyles'
```

| Constant | Value | Usage |
|----------|-------|-------|
| `SECTION_GAP` | spacing['2xl'] | Gap between major sections |
| `TAB_BAR_HEIGHT` | 72px | Tab navigator height |
| `TAB_BAR_ICON_SIZE` | 20px | Tab bar icon dimensions |

### Section Header Pattern

Every major section should have:
1. Divider line above
2. Title with `fontSize.lg` + `fontWeight.semibold`
3. `SECTION_GAP` margin above

```tsx
<YStack gap={SECTION_GAP}>
  {/* Section 1 */}
  <YStack>
    <View style={[componentStyles.sectionHeader.divider, { backgroundColor: colors.border }]} />
    <Text style={[componentStyles.sectionHeader.title, { color: colors.text }]}>
      Section Title
    </Text>
    {/* Section content */}
  </YStack>

  {/* Section 2 */}
  <YStack>
    {/* ... */}
  </YStack>
</YStack>
```

### Hero Section Pattern

For primary display values (e.g., total balance, monthly spending):

```tsx
<YStack alignItems="center">
  <Text style={[componentStyles.hero.label, { color: colors.textSecondary }]}>
    TOTAL BALANCE
  </Text>
  <Text style={[componentStyles.hero.value, { color: colors.text }]}>
    {formatUsdInt(balance)}
  </Text>
</YStack>
```

---

## Size Constants

### Category Indicators

| Constant | Size | Usage |
|----------|------|-------|
| `CATEGORY_DOT_SIZE` | 10px | Category lists |
| `CATEGORY_DOT_SIZE_SM` | 8px | Transaction rows |

### Badges

| Constant | Value | Usage |
|----------|-------|-------|
| `BADGE_MIN_SIZE` | 16px | Minimum badge size |
| `FONT_SIZE_TINY` | 9px | Tiny indicators |
| `FONT_SIZE_BADGE` | 10px | Badge text |

### Bottom Sheet

| Constant | Value | Usage |
|----------|-------|-------|
| `GRABBER_WIDTH` | 36px | Handle width |
| `GRABBER_HEIGHT` | 4px | Handle height |

---

## Spacing Scale

Use Tamagui tokens for spacing:

| Token | Value | Usage |
|-------|-------|-------|
| `$1` / `spacing.xs` | 4px | Tight spacing |
| `$2` / `spacing.sm` | 8px | Small gaps |
| `$3` / `spacing.md` | 12px | Medium gaps |
| `$4` / `spacing.lg` | 16px | Standard padding |
| `$5` / `spacing.xl` | 20px | Large gaps |
| `$6` / `spacing['2xl']` | 24px | Section gaps |

---

## Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `radius.sm` | 4px | Subtle rounding |
| `radius.md` | 8px | Standard cards |
| `radius.lg` | 12px | Large cards |
| `radius.xl` | 16px | Prominent elements |
| `radius.full` | 9999px | Pills, circles |

---

## Design Principles

From the project's design philosophy:

1. **Information clarity > visual complexity** - Prioritize readability
2. **Fast scanability** - Users should quickly find what they need
3. **Predictable interactions** - Consistent behavior across screens
4. **Semantic tokens only** - Never hardcode colors or sizes
5. **No visual inconsistency** - Use the design system, no exceptions

---

**Last Updated**: March 2026
