# Add Transaction Flow

## Overview

The Add Transaction modal allows users to record expenses, income, and transfers. Transactions can be saved as complete or as drafts for later completion.

---

## Field Requirements

### Required Fields (Non-negotiable)

These fields MUST be filled to save a transaction as complete. Without ALL of these, the transaction is considered a "draft":

| Field | Description | Default |
|-------|-------------|---------|
| **Amount** | Transaction value in cents | None (required) |
| **Date** | When the transaction occurred | Today |
| **Account** | Payment method (Paid with) | Default account |
| **Type** | expense / income / transfer | expense |

### Optional Fields

| Field | Description |
|-------|-------------|
| Item | What the transaction is for |
| Merchant | Who/where (store, person, etc.) |
| Category | Expense/income category |
| Subcategory | More specific categorization |
| Note | Additional details |
| Tags | User-defined labels |
| Receipt | Photo attachment |

---

## Validation Rules

### Complete Transaction
```
canSave = hasAmount && hasDate && hasAccount && hasType
```

### Draft Transaction
```
canSaveDraft = hasAmount || hasItem
```
A draft needs at least an amount OR item name to be identifiable.

---

## Save Flow

### "Add" Button
1. Validates all required fields
2. Shows error alert if validation fails
3. Creates transaction in database
4. Removes draft if editing existing draft
5. Navigates to transactions list

### "Save as draft" Button
1. Validates draft minimum (amount OR item)
2. Creates/updates draft in store
3. Closes modal
4. Draft appears in Notifications > Drafts

### Close (X) Button
1. If no data entered → Close immediately
2. If data entered → Prompt: "Save as draft?" | "Discard"

---

## Draft Editing

1. Navigate to Notifications > Drafts tab
2. Tap edit icon on draft row
3. Opens Add Transaction modal with pre-filled data
4. User completes missing fields
5. "Add" saves as complete transaction and removes draft

---

## UI States

### Empty State
- "Add" button disabled
- "Save as draft" button disabled
- X closes without prompt

### Partial Data (Draft-eligible)
- "Add" button disabled (missing required fields)
- "Save as draft" button enabled
- X prompts "Save as draft?" | "Discard"

### Complete Data
- "Add" button enabled
- "Save as draft" button enabled
- X prompts "Save as draft?" | "Discard"

---

## Related Files

- `src/features/transactions/add/AddTransactionScreen.tsx`
- `src/store/drafts.store.ts`
- `src/domain/transaction/transaction.usecase.ts`
