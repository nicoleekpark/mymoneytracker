# Performance Tracking

> Tracking actual performance improvements from refactoring.

*Started: March 2026*

---

## How to Measure

Paste this inline temporarily, measure, then **remove**:

```typescript
const start = performance.now()
const result = transactionRepository.list(100)
console.log(`list(100): ${(performance.now() - start).toFixed(2)}ms, ${result.length} items`)
```

---

## Measurements

### Phase 1: Critical Performance Fixes (2026-03-06)

**Device**: _______________
**Build**: Debug / Release
**Total Transactions**: _______

| Method | Limit | Before (N+1) | After (JOIN) | Speedup |
|--------|-------|--------------|--------------|---------|
| `list` | 50 | ___ms | ___ms | ___x |
| `list` | 100 | ___ms | ___ms | ___x |
| `list` | 200 | ___ms | ___ms | ___x |

---

## Measuring "Before" (Old N+1)

To get baseline numbers, temporarily change `list()` to old approach:

```typescript
// In SqliteTransactionRepository.list():
return rows.map((r) => {
  const tags = this.getTagsForTransaction(r.id)
  const categoryResolver = (id: UUID) => this.categoryRepo.resolveCategoryRefFromDbId(id)
  return rowToTransaction(r, categoryResolver, tags)
})
```

Measure, then revert.

---

## Related

- [Refactoring Tracker](./refactoring.md)
