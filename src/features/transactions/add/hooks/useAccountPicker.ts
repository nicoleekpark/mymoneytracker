import { useCallback, useMemo, useState } from 'react'
import { Keyboard } from 'react-native'

import type { Account } from '@/domain/account'
import { getActiveAccounts } from '@/domain/account'
import { normalizeForSearch } from '@/shared/utils/search'

export type AccountPickerState = Readonly<{
  accountKey: string | null
  showAccountModal: boolean
  accountQuery: string
  setAccountQuery: (q: string) => void
  setAccountKey: (key: string | null) => void
  accounts: Account[]
  filteredAccounts: Account[]
  selectedAccount: Account | null
  accountDisplay: string
  openAccount: () => void
  closeAccount: () => void
  chooseAccount: (key: string) => void
  clearAccount: () => void
}>

export function useAccountPicker(): AccountPickerState {
  const [accountKey, setAccountKey] = useState<string | null>(null)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [accountQuery, setAccountQuery] = useState('')

  const accounts = useMemo(() => getActiveAccounts(), [])

  const filteredAccounts = useMemo(() => {
    const q = normalizeForSearch(accountQuery)
    if (!q) return accounts
    return accounts.filter((a) => {
      const hay = normalizeForSearch(`${a.key} ${a.name} ${a.nature} ${a.kind}`)
      return hay.includes(q)
    })
  }, [accounts, accountQuery])

  const selectedAccount = useMemo(() => {
    if (!accountKey) return null
    return accounts.find((a) => a.key === accountKey) ?? null
  }, [accounts, accountKey])

  const accountDisplay = useMemo(() => {
    return selectedAccount ? selectedAccount.name : 'Not set'
  }, [selectedAccount])

  const openAccount = useCallback(() => {
    Keyboard.dismiss()
    setAccountQuery('')
    setShowAccountModal(true)
  }, [])

  const closeAccount = useCallback(() => {
    setShowAccountModal(false)
    setAccountQuery('')
  }, [])

  const chooseAccount = useCallback((key: string) => {
    setAccountKey(key)
    setShowAccountModal(false)
    setAccountQuery('')
  }, [])

  const clearAccount = useCallback(() => {
    setAccountKey(null)
  }, [])

  return {
    accountKey,
    showAccountModal,
    accountQuery,
    setAccountQuery,
    setAccountKey,
    accounts,
    filteredAccounts,
    selectedAccount,
    accountDisplay,
    openAccount,
    closeAccount,
    chooseAccount,
    clearAccount,
  }
}
