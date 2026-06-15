// Domain layer - Account (pure types, models, interfaces)
// Use cases moved to @/application/account

export type { Account, AccountCategory, AccountKind, AccountNature } from './account.types'

export {
  // Sorting
  accountKindSortRank,
  accountNatureSortRank,
  // Type checks
  isAssetAccount,
  isCashAccount,
  isCreditCard,
  isInvestmentAccount,
  isLiabilityAccount,
  isSpendingAccount,
  countsTowardNetWorth,
  // Helpers
  getDefaultCategoryForKind,
  getKindDisplayName,
  // Constants
  INVESTMENT_KINDS,
  SPENDING_KINDS,
  LIABILITY_KINDS,
} from './account.model'

// Zod schemas for runtime validation
export {
  AccountNatureSchema,
  AccountKindSchema,
  AccountCategorySchema,
  AccountSchema,
  parseAccountNature,
  parseAccountKind,
  parseAccountCategory,
} from './account.schema'

// Repository interface
export type { AccountRepository, CreateAccountInput } from './account.repository'
