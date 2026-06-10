// ═══════════════════════════════════════════════════════════════════════════
// DATA FETCHING HOOK: Accounts Data
// Fetches account activity data grouped by section (Cash, Debt, Investments).
// Uses the SYNC pattern: useMemo (not useEffect) because SQLite is synchronous.
// ═══════════════════════════════════════════════════════════════════════════
//
// WHY useMemo INSTEAD OF useEffect:
// ---------------------------------
// This project uses expo-sqlite's synchronous API. Database queries return
// immediately (no await needed). Therefore:
//
//   - Async hooks (useEffect + alive flag) → for API calls, file I/O
//   - Sync hooks (useMemo) → for synchronous DB queries
//
// Since all our SQLite operations are sync, we can compute the entire result
// in a single useMemo call. This is simpler and has no loading state.
//
// WHAT THIS HOOK PROVIDES:
// ------------------------
// - Account activities grouped by section (Cash & Savings, Debt, Investments)
// - Period-specific data (monthly, yearly, or all-time)
// - Start/end balances for each account
// - Section summaries for the header strip
//
// DATA FLOW:
// ----------
// useAccountsData({ scope, period })
//     ↓
// useMemo computes:
//     ↓
// getActiveAccounts() → list of accounts
//     ↓
// transactionRepository.listAccountActivityForMonth/Year/AllTime()
//     ↓
// Group by section → calculate balances → build result
//     ↓
// Returns { groups, sectionSummaries, periodLabel }
//
// NOTE: This hook imports transactionRepository directly, which breaks Clean
// Architecture (should go through domain use-case). This is a known tech debt.
//
// ═══════════════════════════════════════════════════════════════════════════

// ─── React ──────────────────────────────────────────────────────────────────
import { useCallback, useMemo, useState } from 'react'

// ─── Domain Types ─────────────────────────────────────────────────────────────
import type { Account } from '@/core/domain/account'

// ─── Application ──────────────────────────────────────────────────────────────
import { getActiveAccounts } from '@/core/services/account'
import {
  getAccountActivityForMonth,
  getAccountActivityForYear,
  getAccountActivityAllTime,
  getAccountBalanceBeforeDate,
  getAccountBalanceAtEndOfMonth,
} from '@/core/services/transaction'
import { transactionRepository } from '@/infrastructure/repositories'

// ─── Feature Types ──────────────────────────────────────────────────────────
import type { AccountActivity, AccountGroup, SectionKey, SectionSummary } from '../accounts.types'
import { getSectionKeyForKind, SECTION_LABELS, SECTION_ORDER } from '../accounts.types'
import type { Period, Scope } from '../../types'
import { clampMonth, getMonthNameFull } from '../../utils'

// ─── Local Helpers ──────────────────────────────────────────────────────────

function formatMonthYYYYMM(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

function getFirstDayOfMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}-01`
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type AccountsData = {
  /** Account groups organized by section (Cash, Debt, Investments) */
  groups: AccountGroup[]
  /** Summary data for each section (for the header strip) */
  sectionSummaries: SectionSummary[]
  /** Human-readable period label ("March 2024", "2024", "All Time") */
  periodLabel: string
  /** First transaction date (for "All" scope - "Tracking since" display) */
  firstTransactionDate: Date | null
  /** Force re-fetch data */
  refetch: () => void
}

export type UseAccountsDataParams = {
  scope: Scope     // 'month' | 'year' | 'all'
  period: Period   // { year: 2024, month?: 3 }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Fetches account activity data grouped by section.
 *
 * Unlike async hooks, this uses useMemo because SQLite queries are synchronous.
 * No loading/error states - data is computed immediately.
 *
 * @param params.scope - Time scope: 'month', 'year', or 'all'
 * @param params.period - The period to fetch data for
 * @returns { groups, sectionSummaries, periodLabel }
 *
 * @example
 * ```tsx
 * const { groups, sectionSummaries } = useAccountsData({
 *   scope: 'month',
 *   period: { year: 2024, month: 3 }
 * })
 *
 * return groups.map(group => <AccountGroup key={group.key} {...group} />)
 * ```
 */
export function useAccountsData({ scope, period }: UseAccountsDataParams): AccountsData {
  const [refreshKey, setRefreshKey] = useState(0)
  const refetch = useCallback(() => setRefreshKey(k => k + 1), [])

  const data = useMemo((): Omit<AccountsData, 'refetch'> => {
    // refreshKey dependency forces re-computation when refetch() is called
    void refreshKey
    // ─── Step 1: Fetch all active accounts ────────────────────────────────
    const accounts = getActiveAccounts()

    // ─── Step 2: Fetch activity aggregates based on scope ─────────────────
    // Activity = income, expense, transfers for each account in the period
    type ActivityRecord = {
      expenseCents: number
      incomeCents: number
      transferOutCents: number
      transferInCents: number
      transactionCount: number
    }

    let activityMap: Map<string, ActivityRecord>
    let periodLabel: string
    let firstTransactionDate: Date | null = null

    const year = period.year
    const month = 'month' in period ? clampMonth(period.month) : 1

    if (scope === 'month') {
      // Monthly: fetch activity for specific month
      const monthYYYYMM = formatMonthYYYYMM(year, month)
      const activities = getAccountActivityForMonth(monthYYYYMM)
      activityMap = new Map(activities.map(a => [a.accountId, {
        expenseCents: Math.round(a.expenseDollar * 100),
        incomeCents: Math.round(a.incomeDollar * 100),
        transferOutCents: Math.round(a.transferOutDollar * 100),
        transferInCents: Math.round(a.transferInDollar * 100),
        transactionCount: a.transactionCount,
      }]))
      periodLabel = `${getMonthNameFull(month)} ${year}`

    } else if (scope === 'year') {
      // Yearly: fetch activity for entire year
      const activities = getAccountActivityForYear(year)
      activityMap = new Map(activities.map(a => [a.accountId, {
        expenseCents: Math.round(a.expenseDollar * 100),
        incomeCents: Math.round(a.incomeDollar * 100),
        transferOutCents: Math.round(a.transferOutDollar * 100),
        transferInCents: Math.round(a.transferInDollar * 100),
        transactionCount: a.transactionCount,
      }]))
      periodLabel = String(year)

    } else {
      // All time: fetch activity across all time
      const activities = getAccountActivityAllTime()
      activityMap = new Map(activities.map(a => [a.accountId, {
        expenseCents: Math.round(a.expenseDollar * 100),
        incomeCents: Math.round(a.incomeDollar * 100),
        transferOutCents: Math.round(a.transferOutDollar * 100),
        transferInCents: Math.round(a.transferInDollar * 100),
        transactionCount: a.transactionCount,
      }]))
      periodLabel = 'All Time'

      // Get first transaction date for "Tracking since" display
      const firstDateStr = transactionRepository.getFirstTransactionDate()
      firstTransactionDate = firstDateStr ? new Date(firstDateStr) : null
    }

    // ─── Step 3: Build account activities with balances ───────────────────
    // For each account, calculate start/end balances based on scope
    const accountActivities: AccountActivity[] = accounts.map((account: Account) => {
      const activity = activityMap.get(account.id)

      // Extract activity values (default to 0 if no activity)
      const expenseCents = activity?.expenseCents ?? 0
      const incomeCents = activity?.incomeCents ?? 0
      const transferOutCents = activity?.transferOutCents ?? 0
      const transferInCents = activity?.transferInCents ?? 0
      const transactionCount = activity?.transactionCount ?? 0
      const hasActivity = transactionCount > 0

      // Calculate balances (different logic per scope)
      let startBalance: number | null = null
      let endBalance = 0

      if (scope === 'month') {
        // Monthly: start balance = before month, end balance = end of month
        const monthYYYYMM = formatMonthYYYYMM(year, month)
        const firstDayOfMonth = getFirstDayOfMonth(year, month)

        startBalance = getAccountBalanceBeforeDate(account.id, firstDayOfMonth)
        endBalance = getAccountBalanceAtEndOfMonth(account.id, monthYYYYMM)

      } else if (scope === 'year') {
        // Yearly: start balance = before Jan 1, end balance = end of Dec
        const firstDayOfYear = `${year}-01-01`
        startBalance = getAccountBalanceBeforeDate(account.id, firstDayOfYear)

        const endOfYear = `${year}-12`
        endBalance = getAccountBalanceAtEndOfMonth(account.id, endOfYear)

      } else {
        // All time: start balance = 0 (before any transactions), end = current balance
        startBalance = 0
        const now = new Date()
        const currentMonth = formatMonthYYYYMM(now.getFullYear(), now.getMonth() + 1)
        endBalance = getAccountBalanceAtEndOfMonth(account.id, currentMonth)
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

    // ─── Step 4: Group accounts by section ────────────────────────────────
    // Sections: Cash & Savings, Debt, Investments
    const sectionMap = new Map<SectionKey, AccountActivity[]>()

    for (const activity of accountActivities) {
      const sectionKey = getSectionKeyForKind(activity.account.kind)
      if (!sectionMap.has(sectionKey)) {
        sectionMap.set(sectionKey, [])
      }
      sectionMap.get(sectionKey)!.push(activity)
    }

    // ─── Step 5: Build groups in display order ────────────────────────────
    const groups: AccountGroup[] = []

    for (const key of SECTION_ORDER) {
      const sectionAccounts = sectionMap.get(key)
      if (!sectionAccounts || sectionAccounts.length === 0) continue

      // Sort: active accounts first, inactive at bottom
      const sortedAccounts = [...sectionAccounts].sort((a, b) => {
        if (a.hasActivity === b.hasActivity) return 0
        return a.hasActivity ? -1 : 1
      })

      // Calculate total balance for the section
      // Liabilities (debt) are stored positive but represent debt
      const totalBalance = sortedAccounts.reduce((sum, a) => {
        const balance = a.endBalance
        if (a.account.nature === 'liability') {
          return sum - Math.abs(balance)  // Subtract debt
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

    // ─── Step 6: Build section summaries for header strip ─────────────────
    // Always show all 3 main sections, even if empty
    const mainSections: SectionKey[] = ['cashAndSavings', 'debt', 'investments']

    const sectionSummaries: SectionSummary[] = mainSections.map((key) => {
      const sectionAccounts = sectionMap.get(key) ?? []
      const isLiability = key === 'debt'
      const hasAccounts = sectionAccounts.length > 0

      // Calculate section totals
      let startBalance: number | null = null
      let endBalance = 0

      for (const activity of sectionAccounts) {
        // For liabilities, negate to show as negative (debt)
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
      firstTransactionDate,
    }
  }, [scope, period, refreshKey])  // Recompute when scope, period, or refreshKey changes

  return { ...data, refetch }
}
