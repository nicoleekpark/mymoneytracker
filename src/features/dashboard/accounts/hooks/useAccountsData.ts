import { useMemo } from 'react'
import { getActiveAccounts } from '@/domain/account'
import type { Account } from '@/domain/account'
import { transactionRepository } from '@/infrastructure/repositories'
import type { AccountActivity, AccountGroup, SectionKey, SectionSummary } from '../accounts.types'
import { getSectionKeyForKind, SECTION_LABELS, SECTION_ORDER } from '../accounts.types'
import type { Period, Scope } from '../../types'
import { clampMonth, getMonthNameFull } from '../../types'

function formatMonthYYYYMM(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

function getPreviousMonthYYYYMM(year: number, month: number): { year: number; month: number } {
  if (month === 1) {
    return { year: year - 1, month: 12 }
  }
  return { year, month: month - 1 }
}

function getFirstDayOfMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}-01`
}

export type AccountsData = {
  groups: AccountGroup[]
  sectionSummaries: SectionSummary[]
  periodLabel: string
}

type UseAccountsDataParams = {
  scope: Scope
  period: Period
}

/**
 * Hook to fetch account activity data grouped by section
 */
export function useAccountsData({ scope, period }: UseAccountsDataParams): AccountsData {
  const data = useMemo((): AccountsData => {
    const accounts = getActiveAccounts()

    // Get activity aggregates based on scope and period
    let activityMap: Map<string, {
      expenseCents: number
      incomeCents: number
      transferOutCents: number
      transferInCents: number
      transactionCount: number
    }>

    let periodLabel: string
    const year = period.year
    const month = 'month' in period ? clampMonth(period.month) : 1

    if (scope === 'month') {
      const monthYYYYMM = formatMonthYYYYMM(year, month)
      const activities = transactionRepository.listAccountActivityForMonth(monthYYYYMM)
      activityMap = new Map(activities.map(a => [a.accountId, {
        expenseCents: a.expenseCents,
        incomeCents: a.incomeCents,
        transferOutCents: a.transferOutCents,
        transferInCents: a.transferInCents,
        transactionCount: a.transactionCount,
      }]))
      periodLabel = `${getMonthNameFull(month)} ${year}`
    } else if (scope === 'year') {
      const activities = transactionRepository.listAccountActivityForYear(year)
      activityMap = new Map(activities.map(a => [a.accountId, {
        expenseCents: a.expenseCents,
        incomeCents: a.incomeCents,
        transferOutCents: a.transferOutCents,
        transferInCents: a.transferInCents,
        transactionCount: a.transactionCount,
      }]))
      periodLabel = String(year)
    } else {
      // All time
      const activities = transactionRepository.listAccountActivityAllTime()
      activityMap = new Map(activities.map(a => [a.accountId, {
        expenseCents: a.expenseCents,
        incomeCents: a.incomeCents,
        transferOutCents: a.transferOutCents,
        transferInCents: a.transferInCents,
        transactionCount: a.transactionCount,
      }]))
      periodLabel = 'All Time'
    }

    // Build account activities with calculated balances
    const accountActivities: AccountActivity[] = accounts.map((account: Account) => {
      const activity = activityMap.get(account.id)

      const expenseCents = activity?.expenseCents ?? 0
      const incomeCents = activity?.incomeCents ?? 0
      const transferOutCents = activity?.transferOutCents ?? 0
      const transferInCents = activity?.transferInCents ?? 0
      const transactionCount = activity?.transactionCount ?? 0

      const hasActivity = transactionCount > 0

      // Calculate balances for monthly view
      let startBalance: number | null = null
      let endBalance = 0

      if (scope === 'month') {
        const monthYYYYMM = formatMonthYYYYMM(year, month)
        const firstDayOfMonth = getFirstDayOfMonth(year, month)

        // Start balance = all transactions before the first day of this month
        const startBalanceCents = transactionRepository.getAccountBalanceBeforeDate(account.id, firstDayOfMonth)
        startBalance = startBalanceCents / 100

        // End balance = all transactions up to and including this month
        const endBalanceCents = transactionRepository.getAccountBalanceAtEndOfMonth(account.id, monthYYYYMM)
        endBalance = endBalanceCents / 100
      } else if (scope === 'year') {
        // For yearly view, show start of year and end of year balances
        const firstDayOfYear = `${year}-01-01`
        const startBalanceCents = transactionRepository.getAccountBalanceBeforeDate(account.id, firstDayOfYear)
        startBalance = startBalanceCents / 100

        const endOfYear = `${year}-12`
        const endBalanceCents = transactionRepository.getAccountBalanceAtEndOfMonth(account.id, endOfYear)
        endBalance = endBalanceCents / 100
      } else {
        // All time - show current balance (end of current month)
        const now = new Date()
        const currentMonth = formatMonthYYYYMM(now.getFullYear(), now.getMonth() + 1)
        const endBalanceCents = transactionRepository.getAccountBalanceAtEndOfMonth(account.id, currentMonth)
        endBalance = endBalanceCents / 100
      }

      return {
        account,
        startBalance,
        endBalance,
        totalOut: expenseCents / 100,
        totalIn: incomeCents / 100,
        transferOut: transferOutCents / 100,
        transferIn: transferInCents / 100,
        transactionCount,
        hasActivity,
      }
    })

    // Group accounts by section
    const sectionMap = new Map<SectionKey, AccountActivity[]>()

    for (const activity of accountActivities) {
      const sectionKey = getSectionKeyForKind(activity.account.kind)
      if (!sectionMap.has(sectionKey)) {
        sectionMap.set(sectionKey, [])
      }
      sectionMap.get(sectionKey)!.push(activity)
    }

    // Build groups in order, skip empty ones
    const groups: AccountGroup[] = []

    for (const key of SECTION_ORDER) {
      const sectionAccounts = sectionMap.get(key)
      if (!sectionAccounts || sectionAccounts.length === 0) continue

      // Sort accounts: active accounts first, inactive accounts at bottom
      const sortedAccounts = [...sectionAccounts].sort((a, b) => {
        if (a.hasActivity === b.hasActivity) return 0
        return a.hasActivity ? -1 : 1
      })

      // Calculate total balance for the section
      // For liabilities (debt), show as negative for proper net worth display
      const totalBalance = sortedAccounts.reduce((sum, a) => {
        const balance = a.endBalance
        // Liabilities are stored as positive but represent debt
        if (a.account.nature === 'liability') {
          return sum - Math.abs(balance)
        }
        return sum + balance
      }, 0)

      groups.push({
        key,
        label: SECTION_LABELS[key],
        accounts: sortedAccounts,
        totalBalance,
      })
    }

    // Build section summaries for the strip
    // Include all 3 main sections, but mark which ones have accounts
    const mainSections: SectionKey[] = ['cashAndSavings', 'debt', 'investments']
    const sectionSummaries: SectionSummary[] = mainSections.map((key) => {
      const sectionAccounts = sectionMap.get(key) ?? []
      const isLiability = key === 'debt'
      const hasAccounts = sectionAccounts.length > 0

      // Calculate section totals
      let startBalance: number | null = null
      let endBalance = 0

      for (const activity of sectionAccounts) {
        // For liabilities, negate to show as negative
        const multiplier = activity.account.nature === 'liability' ? -1 : 1
        endBalance += activity.endBalance * multiplier

        if (activity.startBalance !== null) {
          if (startBalance === null) startBalance = 0
          startBalance += activity.startBalance * multiplier
        }
      }

      const delta = startBalance !== null ? endBalance - startBalance : null

      return {
        key,
        label: SECTION_LABELS[key],
        startBalance,
        endBalance,
        delta,
        isLiability,
        hasAccounts,
      }
    })

    return {
      groups,
      sectionSummaries,
      periodLabel,
    }
  }, [scope, period])

  return data
}
