# Duplicate Category Audit

> Generated: 2026-06-15
> Status: **INVESTIGATION ONLY** - No changes made

---

## Summary

Found **3 duplicate subcategory labels** that appear under multiple parent categories:

| Label | Key | Locations |
|-------|-----|-----------|
| Home Insurance | `home_insurance` | `housing`, `insurance` |
| Pet Insurance | `pet_insurance` | `pets`, `insurance` |
| Cash Gift | `cash_gift` | `gifts`, `income` |

---

## Detailed Findings

### 1. Home Insurance (Duplicate)

**Appears in:**
- `housing.home_insurance` (line 205) - icon: `shield`, color: `#3D6F64`
- `insurance.home_insurance` (line 327) - icon: `home`, color: `#6A7A7A`

**Analysis:**
- Same key `home_insurance` in both parent categories
- Different icons and colors
- This creates potential key collision when referencing `categoryKey:subCategoryKey`

**Transaction Risk:**
- Need DB query to check: `SELECT COUNT(*) FROM transactions WHERE category_key IN ('housing', 'insurance') AND sub_category_key = 'home_insurance'`

---

### 2. Pet Insurance (Duplicate)

**Appears in:**
- `pets.pet_insurance` (line 260) - icon: `shield`, color: `#6A5A14`
- `insurance.pet_insurance` (line 330) - icon: `paw`, color: `#7A8A8A`

**Analysis:**
- Same key `pet_insurance` in both parent categories
- Different icons and colors
- This is the issue specifically mentioned by user

**Transaction Risk:**
- Need DB query to check: `SELECT COUNT(*) FROM transactions WHERE category_key IN ('pets', 'insurance') AND sub_category_key = 'pet_insurance'`

---

### 3. Cash Gift (Duplicate)

**Appears in:**
- `gifts.cash_gift` (line 280) - icon: `money`, color: `#5A4A5A` (expense context)
- `income.cash_gift` (line 398) - icon: `gift`, color: `#3F8B76` (income context)

**Analysis:**
- Same key `cash_gift` in both parent categories
- Different icons and colors
- Context is different: `gifts` is expense (giving cash), `income` is receiving cash
- **This may be intentional** as they serve different purposes

**Transaction Risk:**
- Need DB query to check counts for both contexts

---

## No Duplicate Found

The following were checked and have NO duplicates:

- All top-level category keys are unique
- All subcategory labels within the same parent are unique
- No exact label matches beyond the 3 listed above

---

## Recommendations (Pending Approval)

### Option A: Consolidate to Insurance Category
Move all insurance-related items to the `insurance` parent:
- Remove `housing.home_insurance` → use `insurance.home_insurance`
- Remove `pets.pet_insurance` → use `insurance.pet_insurance`

**Pros:** Single source of truth for insurance items
**Cons:** Requires DB migration for existing transactions

### Option B: Rename Keys for Uniqueness
- `housing.home_insurance` → `housing.home_ins_premium` or keep as-is with unique key
- `pets.pet_insurance` → `pets.pet_ins_premium` or keep as-is with unique key

**Pros:** No DB migration needed
**Cons:** Different pattern, may be confusing

### Option C: Keep as Intentional Duplication
- Document that these are intentional overlaps
- Ensure UI allows selection from both contexts

**Pros:** Flexibility for user categorization
**Cons:** Potential confusion, duplicate entries in reports

### Cash Gift: Keep Both
The `cash_gift` duplication appears intentional:
- `gifts.cash_gift` = expense (giving cash to someone)
- `income.cash_gift` = income (receiving cash from someone)

**Recommendation:** Keep both but ensure clear labeling in UI.

---

## Next Steps

1. **Wait for author decision** on merge strategy
2. **Run DB queries** to check transaction counts for affected subcategories
3. **If merging:** Plan migration to update `category_key` in affected transactions
4. **Update UI** if needed to prevent future duplicate selection

---

## Files Involved

- `src/shared/config/categories.config.ts` - Subcategory definitions
- `src/infrastructure/db/migrations/` - May need new migration if merging
- `src/core/services/category/` - May need update if keys change
