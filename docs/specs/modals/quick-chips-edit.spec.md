# Quick Chips Edit Modal Spec

> Last updated: 2026-06-10

## Overview

Modal for customizing quick action chips on Add Transaction screen. Users can add, remove, and reorder category/payment/special chips.

## Entry Points

- Tap edit (pencil) button on quick chips row in Add Transaction
- Long-press on quick chips area

## Layout

### Header
- [ ] Title: "Edit Quick Actions"
- [ ] Done button (right)
- [ ] No cancel - changes are immediate

### YOUR QUICK ACTIONS Section
- [ ] Section title: "YOUR QUICK ACTIONS"
- [ ] Hint text: "Hold and drag to reorder"
- [ ] DraggableChipList component
- [ ] Each chip shows:
  - Icon (category icon or payment icon)
  - Label
  - Remove button (X)
- [ ] Drag handles for reordering

### ADD MORE Section
- [ ] Section title: "ADD MORE"
- [ ] List of available items not yet in quick actions:
  - Special chips (Repeat Last)
  - Categories + Subcategories (for current transaction type)
- [ ] Each row shows:
  - Icon
  - Label
  - Type badge (Special/Category/Subcategory)
  - Plus button (+)

## States

### Default State
- Shows current chips in YOUR QUICK ACTIONS
- Shows available items in ADD MORE

### Empty Current Chips
- YOUR QUICK ACTIONS section shows empty state
- All items available in ADD MORE

### All Items Added
- ADD MORE section hidden
- Only YOUR QUICK ACTIONS visible

### Dragging State
- Dragged chip elevated with shadow
- Other chips shift to show drop position

## Interactions

| Action | Result |
|--------|--------|
| Tap Done | Closes modal |
| Tap X on chip | Removes from quick actions |
| Tap + on available | Adds to quick actions |
| Long-press + drag | Reorders chip position |
| Release drag | Chip snaps to new position |

## Validation Rules

- Quick chips are persisted per transaction type (expense vs income)
- Maximum chips: No hard limit, but scroll if many
- Minimum chips: 0 (empty is allowed)

## Test Checklist

### Visual
- [ ] Section titles uppercase with proper spacing
- [ ] Chips show correct icons and colors
- [ ] Remove button (X) visible on current chips
- [ ] Add button (+) visible on available items
- [ ] Type badges show correct text
- [ ] Dragged chip has elevation/shadow

### Functional
- [ ] Remove chip updates list immediately
- [ ] Add chip appears in YOUR QUICK ACTIONS
- [ ] Drag and drop reorders correctly
- [ ] Changes persist after closing modal
- [ ] Changes reflect in Add Transaction screen
- [ ] Expense/Income have separate chip lists

### Edge Cases
- [ ] All chips removed - empty state
- [ ] All items added - ADD MORE hidden
- [ ] Very long chip labels truncate
- [ ] Rapid add/remove doesn't break state
- [ ] Reorder with only 1 chip (no-op)

## Related Screens

- [Add Transaction](../screens/add-transaction.spec.md)
- [Payment Chips Reorder](../modals/payment-chips-reorder.spec.md)

## Notes

- Uses `useQuickChipsStore` for state persistence
- Expense and income have separate chip configurations
- Special chips (Repeat Last) are type-agnostic
- **Payment methods are NOT managed here** - use PaymentChipsReorderModal instead
- DraggableChipList uses react-native-gesture-handler for smooth animations
