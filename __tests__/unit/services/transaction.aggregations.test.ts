import {
  getThisMonthExpenseTotalDollar,
  getMonthlyExpenseTotalsDollar,
  getMonthlySummaryDollar,
  getDailyFlowDollarForMonth,
  getMonthlyFlowDollarForYear,
  getAllTimeSummaryDollar,
} from '@/core/services/transaction'

// Mock the repository
jest.mock('@/infrastructure/repositories', () => ({
  transactionRepository: {
    getExpenseTotalForMonth: jest.fn(),
    getIncomeTotalForMonth: jest.fn(),
    listMonthlyExpenseTotals: jest.fn(),
    listDailyFlowTotalsWithCountForMonth: jest.fn(),
    listDailyVariableExpenseForMonth: jest.fn(),
    listMonthlyFlowTotalsForYear: jest.fn(),
    getAllTimeExpenseTotal: jest.fn(),
    getAllTimeIncomeTotal: jest.fn(),
  },
}))

import { transactionRepository } from '@/infrastructure/repositories'

const mockGetExpenseTotal = transactionRepository.getExpenseTotalForMonth as jest.MockedFunction<typeof transactionRepository.getExpenseTotalForMonth>
const mockGetIncomeTotal = transactionRepository.getIncomeTotalForMonth as jest.MockedFunction<typeof transactionRepository.getIncomeTotalForMonth>
const mockListMonthlyExpense = transactionRepository.listMonthlyExpenseTotals as jest.MockedFunction<typeof transactionRepository.listMonthlyExpenseTotals>
const mockListDailyFlow = transactionRepository.listDailyFlowTotalsWithCountForMonth as jest.MockedFunction<typeof transactionRepository.listDailyFlowTotalsWithCountForMonth>
const mockListDailyVariable = transactionRepository.listDailyVariableExpenseForMonth as jest.MockedFunction<typeof transactionRepository.listDailyVariableExpenseForMonth>
const mockListMonthlyFlow = transactionRepository.listMonthlyFlowTotalsForYear as jest.MockedFunction<typeof transactionRepository.listMonthlyFlowTotalsForYear>
const mockGetAllTimeExpense = transactionRepository.getAllTimeExpenseTotal as jest.MockedFunction<typeof transactionRepository.getAllTimeExpenseTotal>
const mockGetAllTimeIncome = transactionRepository.getAllTimeIncomeTotal as jest.MockedFunction<typeof transactionRepository.getAllTimeIncomeTotal>

describe('transaction.aggregations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getThisMonthExpenseTotalDollar', () => {
    it('converts cents to dollars correctly', async () => {
      mockGetExpenseTotal.mockReturnValue(123456) // $1234.56

      const result = await getThisMonthExpenseTotalDollar()

      expect(result).toBe(1234.56)
    })

    it('handles zero', async () => {
      mockGetExpenseTotal.mockReturnValue(0)

      const result = await getThisMonthExpenseTotalDollar()

      expect(result).toBe(0)
    })
  })

  describe('getMonthlyExpenseTotalsDollar', () => {
    it('converts all month totals to dollars', async () => {
      mockListMonthlyExpense.mockReturnValue([
        { month: '2026-01', totalCents: 100000 },
        { month: '2026-02', totalCents: 150000 },
        { month: '2026-03', totalCents: 200000 },
      ])

      const result = await getMonthlyExpenseTotalsDollar()

      expect(result).toEqual([
        { month: '2026-01', totalDollar: 1000 },
        { month: '2026-02', totalDollar: 1500 },
        { month: '2026-03', totalDollar: 2000 },
      ])
    })
  })

  describe('getMonthlySummaryDollar', () => {
    it('calculates net cash flow correctly', async () => {
      mockGetExpenseTotal.mockReturnValue(300000) // $3000
      mockGetIncomeTotal.mockReturnValue(500000) // $5000

      const result = await getMonthlySummaryDollar('2026-03')

      expect(result).toEqual({
        month: '2026-03',
        expenseTotalDollar: 3000,
        incomeTotalDollar: 5000,
        netCashFlowDollar: 2000, // 5000 - 3000
      })
    })

    it('handles negative net cash flow', async () => {
      mockGetExpenseTotal.mockReturnValue(500000) // $5000
      mockGetIncomeTotal.mockReturnValue(300000) // $3000

      const result = await getMonthlySummaryDollar('2026-03')

      expect(result.netCashFlowDollar).toBe(-2000)
    })
  })

  describe('getDailyFlowDollarForMonth', () => {
    it('aggregates income and expense by day', async () => {
      mockListDailyFlow.mockReturnValue([
        { day: '2026-03-01', type: 'income', totalCents: 100000, txCount: 1 },
        { day: '2026-03-01', type: 'expense', totalCents: 50000, txCount: 2 },
        { day: '2026-03-02', type: 'expense', totalCents: 30000, txCount: 1 },
      ])
      mockListDailyVariable.mockReturnValue([
        { day: '2026-03-01', totalCents: 40000 },
        { day: '2026-03-02', totalCents: 25000 },
      ])

      const result = await getDailyFlowDollarForMonth('2026-03')

      expect(result).toEqual([
        { day: '2026-03-01', incomeDollar: 1000, expenseDollar: 500, variableExpenseDollar: 400, txCount: 3 },
        { day: '2026-03-02', incomeDollar: 0, expenseDollar: 300, variableExpenseDollar: 250, txCount: 1 },
      ])
    })

    it('sorts results chronologically', async () => {
      mockListDailyFlow.mockReturnValue([
        { day: '2026-03-15', type: 'expense', totalCents: 10000, txCount: 1 },
        { day: '2026-03-01', type: 'expense', totalCents: 20000, txCount: 1 },
        { day: '2026-03-10', type: 'expense', totalCents: 30000, txCount: 1 },
      ])
      mockListDailyVariable.mockReturnValue([])

      const result = await getDailyFlowDollarForMonth('2026-03')

      expect(result[0].day).toBe('2026-03-01')
      expect(result[1].day).toBe('2026-03-10')
      expect(result[2].day).toBe('2026-03-15')
    })
  })

  describe('getMonthlyFlowDollarForYear', () => {
    it('aggregates by month correctly', async () => {
      mockListMonthlyFlow.mockReturnValue([
        { month: '2026-01', type: 'income', totalCents: 500000 },
        { month: '2026-01', type: 'expense', totalCents: 300000 },
        { month: '2026-02', type: 'income', totalCents: 600000 },
        { month: '2026-02', type: 'expense', totalCents: 350000 },
      ])

      const result = await getMonthlyFlowDollarForYear(2026)

      expect(result).toEqual([
        { month: '2026-01', incomeDollar: 5000, expenseDollar: 3000 },
        { month: '2026-02', incomeDollar: 6000, expenseDollar: 3500 },
      ])
    })
  })

  describe('getAllTimeSummaryDollar', () => {
    it('calculates all-time totals correctly', async () => {
      mockGetAllTimeExpense.mockReturnValue(10000000) // $100,000
      mockGetAllTimeIncome.mockReturnValue(15000000) // $150,000

      const result = await getAllTimeSummaryDollar()

      expect(result).toEqual({
        expenseTotalDollar: 100000,
        incomeTotalDollar: 150000,
        netCashFlowDollar: 50000,
      })
    })
  })
})
