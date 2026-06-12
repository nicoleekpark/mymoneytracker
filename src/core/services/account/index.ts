// Application layer - Account services
// Orchestrates domain types + infrastructure repositories

export {
  getActiveAccounts,
  getArchivedAccounts,
  resolveAccountIdByKey,
  getAccountById,
  createAccount,
  updateAccount,
  archiveAccount,
  restoreAccount,
  deleteAccount,
  getAccountTransactionCount,
} from './account.service'

export type { AddAccountInput } from './account.service'
