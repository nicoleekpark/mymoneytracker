domain core (pure business logic)

category/category.type.ts: single source of truth for category type
category/category.ref.ts: domain-safe reference only
category/category.validate.ts: pure domain rule, injected index

transaction/transaction.ts: domain rule enforced via injected index