/**
 * Transaction repository - delegates to infrastructure layer.
 * This file is kept as a thin shim for backward compatibility.
 */
import { transactionRepository } from '@/infrastructure/repositories'
import type { UUID } from '@/domain/common/uuid'
import type { Transaction } from './transaction.types'

// Re-export types from repository interface for backward compatibility
export type {
  MonthlyExpenseTotal,
  DailyExpenseTotal,
  MonthlyExpenseByCategory,
  DailyFlowTotal,
  DailyFlowTotalWithCount,
} from './transaction.repository'

export function insertTransaction(tx: Transaction): void {
  transactionRepository.insert(tx)
}

export function listTransactions(limit = 200): Transaction[] {
  return transactionRepository.list(limit)
}

export function deleteTransaction(id: UUID): void {
  transactionRepository.delete(id)
}

export function getExpenseTotalForMonth(monthYYYYMM: string): number {
  return transactionRepository.getExpenseTotalForMonth(monthYYYYMM)
}

export function getIncomeTotalForMonth(monthYYYYMM: string): number {
  return transactionRepository.getIncomeTotalForMonth(monthYYYYMM)
}

export function listMonthlyExpenseTotals(limitMonths = 24) {
  return transactionRepository.listMonthlyExpenseTotals(limitMonths)
}

export function listDailyExpenseTotalsForMonth(monthYYYYMM: string) {
  return transactionRepository.listDailyExpenseTotalsForMonth(monthYYYYMM)
}

export function listMonthlyExpenseByCategory(monthYYYYMM: string) {
  return transactionRepository.listMonthlyExpenseByCategory(monthYYYYMM)
}

export function listTransfersForMonth(monthYYYYMM: string, limit = 500): Transaction[] {
  return transactionRepository.listTransfersForMonth(monthYYYYMM, limit)
}

export function listDailyFlowTotalsForMonth(monthYYYYMM: string) {
  return transactionRepository.listDailyFlowTotalsForMonth(monthYYYYMM)
}

export function listDailyFlowTotalsWithCountForMonth(monthYYYYMM: string) {
  return transactionRepository.listDailyFlowTotalsWithCountForMonth(monthYYYYMM)
}
