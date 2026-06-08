// Application layer - Account services
// Orchestrates domain types + infrastructure repositories

export {
  getActiveAccounts,
  resolveAccountIdByKey,
  getAccountById,
  createAccount
} from './account.service'

export type { AddAccountInput } from './account.service'
