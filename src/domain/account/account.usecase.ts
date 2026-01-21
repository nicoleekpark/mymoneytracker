import type { UUID } from '@/domain/common/uuid'
import { accountRepository } from '@/infrastructure/repositories'
import type { Account } from './account.types'

export function getActiveAccounts(): Account[] {
  return accountRepository.listActive()
}

export function resolveAccountIdByKey(key: string): UUID {
  return accountRepository.getIdByKey(key)
}