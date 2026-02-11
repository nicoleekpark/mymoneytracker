import type { FinanceColors } from '../types'
import { PALETTE } from './base'

// Finance colors need mode-specific variants for proper contrast

export const financeColorsLight: FinanceColors = {
  income: PALETTE.income.light,
  expense: PALETTE.expense.light,
  transfer: PALETTE.neutral.light,
  gain: PALETTE.income.light,
  loss: PALETTE.expense.light,
}

export const financeColorsDark: FinanceColors = {
  income: PALETTE.income.dark,
  expense: PALETTE.expense.dark,
  transfer: PALETTE.neutral.dark,
  gain: PALETTE.income.dark,
  loss: PALETTE.expense.dark,
}
