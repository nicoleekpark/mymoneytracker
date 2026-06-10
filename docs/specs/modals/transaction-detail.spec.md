# Transaction Detail Sheet Spec

> Last updated: 2026-06-10

## Overview

Bottom sheet displaying full details of a transaction. Allows viewing all transaction data and provides Edit/Delete actions.

## Entry Points

- Tap any transaction row in Transactions list
- Tap transaction in Calendar day detail

## Layout

### Handle & Close
- [ ] Drag handle at top (modalStyles.dragHandle)
- [ ] X close button (top-left)
- [ ] Corner radius: 40px (radius.sheet) - matches iOS native

### Hero Section
- [ ] Amount (large, colored by type)
  - Expense: text color (default)
  - Income: success color with + prefix
  - Transfer: info color
- [ ] Primary text (item > merchant > category > type)
- [ ] Secondary text (merchant if item exists)

### Details Section
- [ ] **Date** - Formatted: "Wed, Jun 10, 2026 · 2:30 PM"
- [ ] **Account** - "Paid with" (expense) or "Account" (income)
- [ ] **Category** - Icon + "Category › Subcategory"
- [ ] **Tags** - Pill badges (if any)
- [ ] **Status** - "Estimated" badge (if applicable)

### Items Section (if has items)
- [ ] Section header: "Items" with count and total
- [ ] Each item row: emoji + name + quantity + price
- [ ] Tappable items open price history (if tracked)
- [ ] Chevron indicator on trackable items

### Note Section (if has note)
- [ ] "Note" label
- [ ] Full note text

### CTA Container (Fixed Bottom)
- [ ] **Edit** button (primary, full width)
- [ ] **Delete Transaction** text button (danger color)
- [ ] Positioned at bottom: 0 (inside BottomSheetModal)

## States

### Default State
- Shows all available transaction data
- Scrollable if content exceeds viewport

### Loading State
- N/A (data passed in)

### With Items
- Items section visible
- Each item tappable for price history

### With Price History (nested sheet)
- ItemPriceHistorySheet opens on top
- Shows price comparison across stores

## Interactions

| Action | Result |
|--------|--------|
| Tap X button | Dismisses sheet |
| Swipe down | Dismisses sheet |
| Tap Edit | Opens AddTransactionScreen in edit mode |
| Tap Delete | Dismisses sheet, triggers delete confirmation |
| Tap item row | Opens ItemPriceHistorySheet (if tracked) |
| Scroll | Content scrolls, CTA stays fixed |

## Validation Rules

- N/A (read-only view)

## Test Checklist

### Visual
- [ ] Corner radius matches iOS native (~40px)
- [ ] Amount color correct for transaction type
- [ ] Category icon and color display correctly
- [ ] Tags wrap properly if many
- [ ] Estimated badge shows when applicable
- [ ] Items section formatted correctly
- [ ] Note section shows full text

### Functional
- [ ] Edit button navigates to edit screen with data
- [ ] Delete button triggers confirmation flow
- [ ] Item tap opens price history for tracked items
- [ ] Price history sheet stacks on top correctly
- [ ] Scroll works for long content
- [ ] Content scrolls past CTA buttons

### Edge Cases
- [ ] Very long item/merchant name truncates
- [ ] Many tags wrap to multiple lines
- [ ] Many items scrolls properly
- [ ] Long note displays fully
- [ ] No items section if transaction has no items
- [ ] No note section if transaction has no note

## Related Screens

- [Add Transaction](../screens/add-transaction.spec.md) (Edit mode)
- [Item Price History](../modals/item-price-history.spec.md)
- [Transactions List](../screens/transactions-list.spec.md)

## Notes

- Sheet snaps to 90% height
- CTA uses `insideBottomSheet` prop for correct positioning
- Scroll padding accounts for CTA height via `getScrollContentWithCTAPadding(0)`
