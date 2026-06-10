# Category Selection Modal Spec

> Last updated: 2026-06-10

## Overview

Full-screen modal for selecting transaction category. Supports search, recent/frequent shortcuts, and drill-down to subcategories.

## Entry Points

- Tap Category field in Add Transaction screen
- Tap category quick chip edit (indirect)

## Layout

### Header
- [ ] Drag handle
- [ ] Cancel/Back button (left)
- [ ] Title: "Category" or selected category name
- [ ] Empty space (right) for balance

### Search Box
- [ ] Search icon + text input
- [ ] Placeholder: "Search categories + subcategories..."
- [ ] Updates results as you type

### Content (Default View)
- [ ] **RECENT** section - Auto-tracked recent categories (chips)
- [ ] **FREQUENT** section - Most used categories (chips)
- [ ] **ALL CATEGORIES** - Grouped by type:
  - Everyday (food, transport, lifestyle)
  - Monthly Fixed (housing, communication, subscriptions, insurance)
  - Care (health, family, pets)
  - Occasional (social, travel, gifts, donations)
  - Financial (taxes, debt, fees)
  - Professional (education, business)

### Category Row
- [ ] Icon (colored background)
- [ ] Category name
- [ ] Subcategory preview text (e.g., "Groceries • Restaurants • Coffee")
- [ ] Chevron (›) if has subcategories

### Subcategory View (Drill-down)
- [ ] Back button in header
- [ ] "SUBCATEGORIES" section title with parent name
- [ ] List of subcategories with icons
- [ ] "Just [Category]" option at bottom

### Search Results
- [ ] "RESULTS" section with count
- [ ] Mixed list of categories and subcategories
- [ ] Subcategory shows "in [Parent]" label

## States

### Default State
- Shows Recent + Frequent + All Categories
- No search query

### Searching State
- Search results replace default content
- Shows matched categories and subcategories

### Subcategory View State
- Header shows parent category name
- Back button to return to main view
- List of subcategories + "Just X" option

### Empty Search State
- No results message (if no matches)

## Interactions

| Action | Result |
|--------|--------|
| Tap Cancel | Closes modal without selection |
| Type in search | Filters categories/subcategories |
| Tap category chip | Selects or drills down |
| Tap category row (with subs) | Drills down to subcategories |
| Tap category row (no subs) | Selects and closes |
| Tap subcategory | Selects and closes |
| Tap "Just [Category]" | Selects parent only, closes |
| Tap Back | Returns to main category view |

## Validation Rules

- Categories filtered by transaction type (expense/income/transfer)
- Expense: ~19 categories
- Income: 2 categories (income, adjustments)
- Transfer: 2 categories (transfers, savings)

## Test Checklist

### Visual
- [ ] Recent/Frequent chips display correctly
- [ ] Category groups organized correctly
- [ ] Icons and colors match category config
- [ ] Subcategory preview shows first 3 items
- [ ] Search results show correct type labels
- [ ] Chevron indicates drillable categories

### Functional
- [ ] Search filters as you type
- [ ] Drill-down to subcategories works
- [ ] Back returns to main view
- [ ] Selection closes modal and updates parent
- [ ] Recent section reflects actual usage (after implementation)
- [ ] Frequent section reflects actual usage (after implementation)

### Edge Cases
- [ ] Search with no results
- [ ] Category with no subcategories
- [ ] Very long category/subcategory names
- [ ] Switching transaction type resets selection
- [ ] Keyboard dismiss on scroll

## Related Screens

- [Add Transaction](../screens/add-transaction.spec.md)
- [Subcategory Selection](../modals/subcategory-selection.spec.md)

## Notes

- Categories are filtered by `transactionType` from useCategoryPicker hook
- Income type only shows income-specific categories (2 total)
- Recent/Frequent sections use hardcoded defaults currently (TODO: implement tracking)
- Subcategory drill-down preserves search query for filtering
