/**
 * Account repository - delegates to infrastructure layer.
 * This file is kept as a thin shim for backward compatibility.
 */
import { accountRepository } from '@/infrastructure/repositories'
import type { UUID } from '@/domain/common/uuid'
import type { Account } from './account.types'

// Re-export AccountRow type for backward compatibility
export type { AccountRow } from '@/infrastructure/mappers/account.mapper'

export function listActiveAccounts(): Account[] {
  return accountRepository.listActive()
}

export function getAccountIdByKey(key: string): UUID {
  return accountRepository.getIdByKey(key)
}
