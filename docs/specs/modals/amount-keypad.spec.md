# Amount Keypad Sheet Spec

> Last updated: 2026-06-10

## Overview

Bottom sheet with numeric keypad for entering transaction amounts. Supports estimated amount toggle and decimal precision.

## Entry Points

- Tap amount display in Add Transaction screen
- Tap item price in ItemizedSection

## Layout

### Handle
- [ ] Drag handle at top
- [ ] Corner radius: 40px (radius.sheet)

### Title (Optional)
- [ ] Item name when editing item price
- [ ] Hidden for main transaction amount

### Amount Display
- [ ] Large amount (displaySize.xl, heavy weight)
- [ ] Format: $X.XX (always 2 decimal places)
- [ ] Shows `~` prefix when estimated

### Estimated Toggle (Optional)
- [ ] Row with "~" icon and "Estimated amount" label
- [ ] Toggle switch
- [ ] Warning color when ON
- [ ] Hidden when `hideEstimated` prop is true (e.g., for item prices)

### Keypad Grid
- [ ] 4x3 grid + action row
- [ ] Row 1: 1, 2, 3
- [ ] Row 2: 4, 5, 6
- [ ] Row 3: 7, 8, 9
- [ ] Row 4: 00, 0, ⌫ (backspace)
- [ ] Row 5: Clear (wide), Done

### Keys
- [ ] Touch feedback (scale animation via ScalePressable)
- [ ] Backspace shows arrow icon
- [ ] Done button in primary color
- [ ] Clear and number keys in surfaceAlt color

## States

### Default State
- Amount: $0.00
- Estimated: OFF
- All keys enabled

### Has Value State
- Amount shows entered value
- Clear resets to $0.00

### Estimated State
- Toggle ON (warning color)
- Amount shows ~ prefix

### Item Price Mode
- Title shows item name
- Estimated toggle hidden
- Used for ItemizedSection

## Interactions

| Action | Result |
|--------|--------|
| Tap digit | Appends to amount (shifts left) |
| Tap 00 | Appends two zeros |
| Tap ⌫ | Removes last digit |
| Tap Clear | Resets to $0.00 |
| Tap Done | Confirms and closes |
| Tap backdrop | Closes without saving |
| Toggle Estimated | Updates estimated state |

## Amount Logic

- Stored as cents (integer)
- Display: `amountCents / 100` formatted as `$X.XX`
- Max digits: 10 (prevents overflow)
- Example: Tap 1,2,3,4 → displays $12.34

## Validation Rules

- Amount must be finite number
- No negative amounts
- Maximum 10 digits

## Test Checklist

### Visual
- [ ] Corner radius matches iOS native
- [ ] Amount display large and centered
- [ ] Keys have proper spacing
- [ ] Estimated toggle shows warning color when ON
- [ ] Done button stands out (primary color)
- [ ] Backspace icon renders correctly

### Functional
- [ ] Digits append correctly (1234 → $12.34)
- [ ] 00 appends two zeros
- [ ] Backspace removes last digit
- [ ] Clear resets to $0.00
- [ ] Done closes and saves value
- [ ] Backdrop tap closes without saving
- [ ] Estimated toggle persists
- [ ] Maximum 10 digits enforced

### Edge Cases
- [ ] Rapid key taps don't miss inputs
- [ ] Very large amounts display correctly
- [ ] Backspace on $0.00 stays at $0.00
- [ ] Clear on $0.00 stays at $0.00
- [ ] Opening with existing value shows correct amount

## Related Screens

- [Add Transaction](../screens/add-transaction.spec.md)
- [Itemized Section](../components/itemized-section.spec.md)

## Notes

- Uses React Native Modal (not BottomSheetModal)
- Animated with reanimated SlideInDown/SlideOutDown
- ScalePressable provides haptic-like feedback
- Amount stored as cents to avoid floating point issues
