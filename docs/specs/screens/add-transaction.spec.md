# Add Transaction Screen Spec

> Last updated: 2026-06-10

## Overview

Primary screen for adding new expense or income transactions. Supports quick entry via chips and detailed entry via form fields.

## Entry Points

- Tap **+** button on bottom tab bar
- Edit existing transaction (edit mode)
- Continue editing draft

## Layout

### Header
- [ ] Drag handle (grabber) - modal indicator
- [ ] Cancel button (left) - dismisses without saving
- [ ] Type tabs: Expense | Income | Transfer (disabled)
  - [ ] Selected tab has bottom border (primary color)
  - [ ] Switching tabs resets category selection

### Hero Amount
- [ ] Large amount display (displaySize.xl, heavy weight)
- [ ] Tappable - opens amount keypad
- [ ] Shows `~` prefix when estimated
- [ ] Estimated badge appears below when toggled

### Quick Chips Section
- [ ] Horizontal scrollable row
- [ ] Category chips (customizable via edit modal)
- [ ] "Repeat Last" chip (if last transaction exists)
- [ ] Edit button (pencil icon) - opens QuickChipsEditModal
- [ ] Selected chip has primary color background/border
- [ ] Auto-scrolls to selected chip

### Payment Methods Row
- [ ] Horizontal scrollable row (expense only)
- [ ] Account chips ordered by frequency/custom order
- [ ] Edit button - opens PaymentChipsReorderModal
- [ ] Selected chip highlighted

### Form Fields
- [ ] **Description** - Item/what was purchased
  - Animated placeholder when empty
  - Suggestions dropdown (from history)
- [ ] **Merchant** - Where purchased
  - Suggestions dropdown (from history)
- [ ] **Date/Time** - Tappable, opens DateTimePicker
- [ ] **Category** - Tappable, opens CategorySelectionModal
  - Shows selected category with icon
  - Chevron indicator
- [ ] **Account** - Tappable (if not selected via chips)

### More Details (Expandable)
- [ ] Collapsed: Shows badge with count of filled optional fields
- [ ] Expanded reveals:
  - [ ] Items section (itemized purchases)
  - [ ] Tags section
  - [ ] Note field
  - [ ] Receipt attachment

### Items Section
- [ ] Header: "Items" with "+ Add items" or count/total
- [ ] Tappable to expand/collapse
- [ ] Each item row: Name | Price | Delete button
- [ ] Ghost row at bottom for adding new items
- [ ] Price keypad for entering item prices
- [ ] Suggestions for item names (from tracked items)

### CTA Bar (Fixed Bottom)
- [ ] Primary button: amount display + "Add"
- [ ] Disabled when amount = 0
- [ ] Secondary actions: "Save & Add Another" | "Save Draft"

## States

### Default State
- Amount: $0.00
- Type: Expense
- Date: Now
- All other fields empty

### Edit Mode
- Pre-fills all fields from existing transaction
- CTA changes to "Save Changes"
- No "Save Draft" option

### Draft Mode
- Pre-fills from saved draft
- Shows draft indicator
- Can update or delete draft

## Interactions

| Action | Result |
|--------|--------|
| Tap amount | Opens AmountKeypadSheet |
| Tap category chip | Sets category, auto-scrolls |
| Long-press category chip | Opens QuickChipsEditModal |
| Tap payment chip | Sets account |
| Tap "Edit" on chips | Opens respective edit modal |
| Tap Date field | Opens DateTimePickerModal |
| Tap Category field | Opens CategorySelectionModal |
| Tap "More details" | Expands/collapses section |
| Tap "Add" | Validates and saves transaction |
| Tap "Cancel" | Dismisses (confirms if has changes) |

## Validation Rules

- **Amount** > 0 (required to save)
- **Account** - Required for expense (warning if missing)
- **Items** - Either name OR price required per item (not both)
- **Category** - Optional but recommended

## Test Checklist

### Visual
- [ ] Type tabs show correct selected state
- [ ] Amount shows correct formatting ($X.XX)
- [ ] Estimated badge appears when toggled
- [ ] Quick chips scroll horizontally
- [ ] Selected chip has correct highlight
- [ ] CTA bar anchored at bottom above safe area
- [ ] Keyboard doesn't cover inputs

### Functional
- [ ] Amount keypad updates display correctly
- [ ] Backspace and clear work in keypad
- [ ] Category selection persists after modal close
- [ ] Date/time picker updates field
- [ ] "Repeat Last" fills all fields from last transaction
- [ ] Save creates transaction in database
- [ ] Save & Add Another resets form but keeps type
- [ ] Draft saves and can be resumed

### Edge Cases
- [ ] Very long description text truncates properly
- [ ] Many items in itemized list scrolls
- [ ] Switching type clears incompatible fields
- [ ] Keyboard dismiss on scroll
- [ ] Back gesture/button prompts if unsaved changes

## Related Screens

- [Transaction Detail](../modals/transaction-detail.spec.md)
- [Category Selection](../modals/category-selection.spec.md)
- [Quick Chips Edit](../modals/quick-chips-edit.spec.md)
- [Amount Keypad](../modals/amount-keypad.spec.md)

## Notes

- Quick chips are user-customizable and persisted in local storage
- Payment method order is based on usage frequency + custom ordering
- Suggestions come from SuggestionsStore (item/merchant history)
