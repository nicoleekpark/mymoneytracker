# Product Specs

> Living documentation of expected behavior for each screen, modal, and component.

## Purpose

- **Reference** - Know exactly how each feature should work
- **Testing** - Checklist for manual QA after changes
- **Onboarding** - Understand the product quickly
- **AI Context** - Claude can reference specs when making changes

## Structure

```
docs/specs/
├── README.md              # This file
├── _template.spec.md      # Template for new specs
├── screens/               # Full-page screens
├── modals/                # Bottom sheets, dialogs, overlays
└── components/            # Reusable components (if needed)
```

## Screens

| Screen | Status | Description |
|--------|--------|-------------|
| [Add Transaction](screens/add-transaction.spec.md) | ✅ | Add/edit expense or income |
| [Drafts](screens/drafts.spec.md) | ✅ | Saved draft transactions |
| [Dashboard](screens/dashboard.spec.md) | ✅ | Overview, Accounts, Insights tabs |
| Transactions List | 🔲 | Transaction history |
| Accounts | 🔲 | Account management |
| Settings | 🔲 | App preferences |

## Modals

| Modal | Status | Description |
|-------|--------|-------------|
| [Transaction Detail](modals/transaction-detail.spec.md) | ✅ | View transaction details |
| [Category Selection](modals/category-selection.spec.md) | ✅ | Choose category |
| [Quick Chips Edit](modals/quick-chips-edit.spec.md) | ✅ | Customize quick actions |
| [Payment Chips Reorder](modals/payment-chips-reorder.spec.md) | ✅ | Reorder payment methods |
| Amount Keypad | 🔲 | Enter amount |
| Date/Time Picker | 🔲 | Select date and time |
| Account Selection | 🔲 | Choose account |
| Filter Sheet | 🔲 | Filter transactions |

## Components

| Component | Status | Description |
|-----------|--------|-------------|
| Quick Chips | 🔲 | Horizontal scrollable chips |
| CTA Container | 🔲 | Fixed bottom action bar |
| Toast | 🔲 | Feedback notifications |

## Legend

- ✅ Documented
- 🔲 Not yet documented
- 🚧 In progress

## Writing Specs

1. Copy `_template.spec.md`
2. Fill in each section
3. Use checkboxes `- [ ]` for testable items
4. Link related specs
5. Update this README index

## Using Specs

### For Testing
1. Open relevant spec file
2. Go through Test Checklist section
3. Check off each item as verified

### For Development
1. Reference spec before making changes
2. Update spec if behavior changes
3. Add new checklist items for new features

### For Claude
Reference specs in prompts:
```
"Based on docs/specs/modals/transaction-detail.spec.md,
the CTA should be positioned at bottom:0 inside BottomSheetModal"
```
