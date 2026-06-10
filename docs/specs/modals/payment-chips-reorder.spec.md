# Payment Chips Reorder Modal Spec

> Last updated: 2026-06-10

## Overview

Modal for reordering payment method chips on Add Transaction screen. Drag-only interface (no add/remove - all accounts always shown).

## Entry Points

- Tap edit (pencil) button on payment methods row in Add Transaction

## Layout

### Header
- [ ] Title: "Reorder Payment Methods"
- [ ] Done button (right)

### YOUR PAYMENT METHODS Section
- [ ] Section title: "YOUR PAYMENT METHODS"
- [ ] Hint text: "Hold and drag to reorder"
- [ ] DraggableChipList component
- [ ] Each chip shows:
  - Icon (bank/credit-card/money based on account kind)
  - Account name
  - NO remove button (all accounts must be shown)
- [ ] Drag handles for reordering

## States

### Default State
- Shows all active accounts in current order

### Dragging State
- Dragged chip elevated with shadow
- Other chips shift to show drop position

### Single Account
- Only one chip shown
- Drag has no effect (no reorder possible)

## Interactions

| Action | Result |
|--------|--------|
| Tap Done | Closes modal |
| Long-press + drag | Reorders chip position |
| Release drag | Chip snaps to new position |

## Validation Rules

- All active accounts are always displayed
- Order is persisted via `usePaymentChipsOrderStore`
- Cannot remove accounts (manage via Accounts screen)

## Test Checklist

### Visual
- [ ] Section title "YOUR PAYMENT METHODS" displayed
- [ ] Hint text shows drag instructions
- [ ] Account icons match account kind (bank/card/cash)
- [ ] No remove buttons visible
- [ ] Dragged chip has elevation/shadow

### Functional
- [ ] Drag and drop reorders correctly
- [ ] Order persists after closing modal
- [ ] Order reflects in Add Transaction screen
- [ ] New accounts appear at end of list

### Edge Cases
- [ ] Single account - no reorder possible
- [ ] Many accounts - scrolls if needed
- [ ] Account name truncation for long names

## Related Screens

- [Add Transaction](../screens/add-transaction.spec.md)
- [Quick Chips Edit](../modals/quick-chips-edit.spec.md)
- [Accounts Management](../screens/accounts.spec.md)

## Notes

- Different from Quick Chips Edit - no add/remove, only reorder
- Layout matches Quick Chips Edit for consistency
- Uses `usePaymentChipsOrderStore` for persistence
- Account list comes from `getOrderedAccounts()` helper
