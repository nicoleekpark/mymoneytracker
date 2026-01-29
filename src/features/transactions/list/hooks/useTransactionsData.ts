import type { Transaction } from '@/domain/transaction'
import {
  getThisMonthExpenseTotalDollar,
  getTransactions,
  isExpense,
  isIncome,
  isTransfer,
  safeDate,
} from '@/domain/transaction'
import { isSameMonth } from '@/shared/format/date'
import { useAsyncDataWithDefault } from '@/shared/hooks'

export type TransactionsPageData = Readonly<{
  items: Transaction[]
  thisMonthExpense: number
  thisMonthIncome: number
  thisMonthNet: number
}>

function sumThisMonthIncomeAndNet(all: Transaction[], now: Date) {
  let income = 0
  let expense = 0

  for (const tx of all) {
    const d = safeDate(tx)
    if (!isSameMonth(d, now)) continue

    const amt = tx.money.amount
    if (!Number.isFinite(amt) || amt <= 0) continue

    if (isTransfer(tx)) continue

    if (isIncome(tx)) income += amt
    else if (isExpense(tx)) expense += amt
  }

  return { income, net: income - expense }
}

async function fetchTransactionsData(): Promise<TransactionsPageData> {
  const [txs, expense] = await Promise.all([
    getTransactions(200),
    getThisMonthExpenseTotalDollar(),
  ])

  const items = Array.isArray(txs) ? txs : []
  const thisMonthExpense = Number(expense ?? 0)
  const { income, net } = sumThisMonthIncomeAndNet(items, new Date())

  return {
    items,
    thisMonthExpense,
    thisMonthIncome: income,
    thisMonthNet: net,
  }
}

const DEFAULT_DATA: TransactionsPageData = {
  items: [],
  thisMonthExpense: 0,
  thisMonthIncome: 0,
  thisMonthNet: 0,
}

export function useTransactionsData() {
  return useAsyncDataWithDefault(
    fetchTransactionsData,
    [],
    { defaultValue: DEFAULT_DATA }
  )
}
