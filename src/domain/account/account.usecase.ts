import type { UUID } from '@/domain/common/uuid'
import { getAccountIdByKey, listActiveAccounts } from './account.repo'
import type { Account } from './account.types'

export function getActiveAccounts(): Account[] {
  return listActiveAccounts()
}

export function resolveAccountIdByKey(key: string): UUID {
  return getAccountIdByKey(key)
}