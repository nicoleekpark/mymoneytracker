# Design QA Test Plan

Visual and design consistency checks for MyMoneyTracker.

---

## Test ID Prefixes

| Prefix | Meaning | Description |
|--------|---------|-------------|
| **DQ** | Design QA | Visual consistency, tokens, typography, spacing |

*For functional test prefixes (OV, AS, AC, IN, AT, TR, ET, NV, ST, OB, EC), see [QA_TEST_PLAN.md](./QA_TEST_PLAN.md).*

---

## 1. Global Consistency

### 1.1 Screen Margins
| Check | Expected | Status |
|-------|----------|--------|
| Horizontal padding on all screens | `spacing.xl` (20px) | |
| Bottom padding on scrollable content | `spacing['3xl']` (32px) | |
| Safe area insets respected | Top/bottom on iOS | |

### 1.2 Section Structure
| Check | Expected | Status |
|-------|----------|--------|
| Section gap between major sections | `spacing['2xl']` (24px) | |
| Section header has divider above | 1px, `colors.border`, 50% opacity | |
| Section header margin below | `spacing.lg` (16px) | |

### 1.3 Color Tokens
| Check | Expected | Status |
|-------|----------|--------|
| No hardcoded color values | Use theme tokens only | |
| `textSecondary` used (never `textMuted`) | Per CLAUDE.md rules | |
| Semantic colors for status | success/danger/warning | |
| Dark mode colors invert properly | All screens | |

---

## 2. Typography

### 2.1 Font Sizes
| Element | Expected Size | Status |
|---------|---------------|--------|
| Hero value (main amount) | `displaySize.xl` (48px) | |
| Hero label | `fontSize.xs` (12px) | |
| Section title | `fontSize.lg` (18px) | |
| List row title | `fontSize.sm` (14px) | |
| List row amount | `fontSize.sm` (14px) | |
| Field labels | `fontSize.xs` (12px) | |
| Chart axis labels | `fontSize.xs` (12px) | |

### 2.2 Font Weights
| Element | Expected Weight | Status |
|---------|-----------------|--------|
| Hero value | `fontWeight.heavy` (800) | |
| Section title | `fontWeight.semibold` (600) | |
| List row title | `fontWeight.semibold` (600) | |
| List row amount | `fontWeight.semibold` (600) | |
| Hero label | `fontWeight.medium` (500) | |
| Field labels | `fontWeight.medium` (500) | |
| Secondary text | `fontWeight.medium` (500) | |

### 2.3 Letter Spacing
| Element | Expected Spacing | Status |
|---------|------------------|--------|
| Hero value | `-1` | |
| Field labels | `0.5` | |
| Hero label | `0.5` | |
| Body text | `0` (default) | |

### 2.4 Numeric Display
| Check | Expected | Status |
|-------|----------|--------|
| All currency amounts | `fontVariant: ['tabular-nums']` | |
| Column-aligned numbers | Tabular nums enabled | |
| Transaction counts | Tabular nums enabled | |

---

## 3. Dashboard Tab Consistency

### 3.1 Overview Tab
| Check | Expected | Status |
|-------|----------|--------|
| Hero section centered | horizontally centered | |
| Hero amount size | `displaySize.xl` | |
| Hero label above amount | `fontSize.xs`, secondary color | |
| Section gaps consistent | `SECTION_GAP` | |

### 3.2 Assets Tab
| Check | Expected | Status |
|-------|----------|--------|
| Hero matches Overview style | Same sizing/spacing | |
| Balance sheet rows aligned | Labels left, amounts right | |
| Indented sub-items | Consistent indent level | |
| Expandable rows have chevron | ▶/▼ indicators | |

### 3.3 Accounts Tab
| Check | Expected | Status |
|-------|----------|--------|
| Summary section styling | Matches other tabs | |
| Account row padding | `spacing.sm` vertical | |
| Chevron alignment | 16px width, left of name | |
| Expanded math breakdown | Indent line 1px, left margin | |
| "Start → End" format | Tabular nums, secondary color | |

### 3.4 Insights Tab
| Check | Expected | Status |
|-------|----------|--------|
| Card styling consistent | Same radius, padding | |
| Chart colors match theme | Use semantic colors | |
| Sparkline stroke width | Consistent across cards | |

---

## 4. Transactions Screen

### 4.1 List Items
| Check | Expected | Status |
|-------|----------|--------|
| Row height consistent | All rows same height | |
| Category icon size | Consistent sizing | |
| Amount alignment | Right-aligned, tabular nums | |
| Date grouping headers | Correct typography | |

### 4.2 Empty States
| Check | Expected | Status |
|-------|----------|--------|
| Empty state centered | Vertically and horizontally | |
| Title size | `fontSize.lg` | |
| Description size | `fontSize.md`, secondary color | |

---

## 5. Add/Edit Transaction

### 5.1 Form Fields
| Check | Expected | Status |
|-------|----------|--------|
| Field label styling | `fontSize.xs`, `letterSpacing: 0.5` | |
| Input text size | `fontSize.md` or `fontSize.lg` | |
| Field spacing | Consistent gaps between fields | |
| Required field indicators | Consistent style | |

### 5.2 Type Selector
| Check | Expected | Status |
|-------|----------|--------|
| Selected state | Clear visual distinction | |
| Unselected state | Secondary/muted appearance | |
| Tap targets | Minimum 44px | |

### 5.3 Buttons
| Check | Expected | Status |
|-------|----------|--------|
| Primary button | Full width, prominent color | |
| Destructive button | Danger color for delete | |
| Disabled state | Reduced opacity | |

---

## 6. Modal/Sheet Styling

### 6.1 Bottom Sheets
| Check | Expected | Status |
|-------|----------|--------|
| Handle indicator | Centered, correct color | |
| Corner radius | Consistent top corners | |
| Background color | `colors.surface` | |
| Backdrop opacity | Consistent dimming | |

### 6.2 Info Sheets
| Check | Expected | Status |
|-------|----------|--------|
| Title styling | Correct size/weight | |
| Content padding | Matches app padding | |
| Close button | Accessible tap target | |

---

## 7. Interactive States

### 7.1 Pressable Feedback
| Check | Expected | Status |
|-------|----------|--------|
| Pressed opacity | 0.7 or similar | |
| Disabled opacity | 0.5 or grayed out | |
| Hit slop on small targets | Minimum 8px extension | |

### 7.2 Focus States (Accessibility)
| Check | Expected | Status |
|-------|----------|--------|
| Focus rings visible | When using keyboard/VoiceOver | |
| Focus order logical | Tab through in order | |

---

## 8. Charts & Visualizations

### 8.1 Bar Charts
| Check | Expected | Status |
|-------|----------|--------|
| Bar colors | Use semantic tokens | |
| Axis labels | `fontSize.xs`, 70% opacity | |
| Grid lines | Subtle, `colors.border` | |
| Bar spacing | Consistent gaps | |

### 8.2 Sparklines
| Check | Expected | Status |
|-------|----------|--------|
| Stroke width | Consistent across app | |
| Line color | Theme-appropriate | |
| Area fill opacity | If used, consistent | |

---

## 9. Dark Mode

### 9.1 Color Inversion
| Check | Expected | Status |
|-------|----------|--------|
| Background colors | Properly inverted | |
| Text colors | Readable contrast | |
| Border colors | Visible but subtle | |
| Chart colors | Still distinguishable | |

### 9.2 Contrast Ratios
| Check | Expected | Status |
|-------|----------|--------|
| Primary text | 4.5:1 minimum (WCAG AA) | |
| Secondary text | 4.5:1 minimum | |
| Interactive elements | 3:1 minimum | |

---

## 10. Cross-Tab Comparison

### 10.1 Visual Rhythm
| Check | Expected | Status |
|-------|----------|--------|
| Hero sections same size | Overview, Assets, Accounts | |
| Section headers match | Same styling all tabs | |
| Empty states match | Same layout/typography | |

### 10.2 Scope Picker
| Check | Expected | Status |
|-------|----------|--------|
| Position consistent | Same location all tabs | |
| Styling matches | Same appearance | |
| Interaction same | Same behavior | |

---

## 11. Platform-Specific

### 11.1 iOS
| Check | Expected | Status |
|-------|----------|--------|
| SF Pro font rendering | Clean and crisp | |
| Safe area handling | Notch/Dynamic Island | |
| Scroll bounce | Native feel | |

### 11.2 Android
| Check | Expected | Status |
|-------|----------|--------|
| Roboto font rendering | Consistent with system | |
| Status bar handling | Correct insets | |
| Navigation bar | Proper spacing | |

---

## How to Use This Checklist

1. **Before release**: Walk through each section
2. **After major UI changes**: Check affected sections
3. **Cross-reference**: Compare adjacent screens side-by-side
4. **Screenshot comparison**: Capture before/after for changes

## Tools for Visual QA

- **Side-by-side screenshots**: Compare tabs for consistency
- **Design file overlay**: Compare implementation to mockups
- **Accessibility inspector**: Check contrast ratios
- **Slow-motion recording**: Check animation smoothness
