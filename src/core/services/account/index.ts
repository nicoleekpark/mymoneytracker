// Application layer - Account services
// Orchestrates domain types + infrastructure repositories

export {
  getActiveAccounts,
  resolveAccountIdByKey,
  getAccountById,
  createAccount,
  updateAccount,
  archiveAccount
} from './account.service'

export type { AddAccountInput } from './account.service'
