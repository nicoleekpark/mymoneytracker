import { getMonthlyProjection, getYearlyProjection } from '@/core/services/transaction'

// Mock the repository
jest.mock('@/infrastructure/repositories', () => ({
  transactionRepository: {
    getMonthTotals: jest.fn(),
    getYearTotals: jest.fn(),
  },
}))

import { transactionRepository } from '@/infrastructure/repositories'

const mockGetMonthTotals = transactionRepository.getMonthTotals as jest.MockedFunction<typeof transactionRepository.getMonthTotals>
const mockGetYearTotals = transactionRepository.getYearTotals as jest.MockedFunction<typeof transactionRepository.getYearTotals>

describe('transaction.projections', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getMonthlyProjection', () => {
    it('projects month-end based on daily average', async () => {
      // Mock: Day 15 of a 30-day month, $1500 expense so far
      mockGetMonthTotals.mockReturnValue({
        expenseCents: 150000, // $1500
        incomeCents: 300000,  // $3000
      })

      // Day 15 of a 30-day month
      const mockDate = new Date(2026, 3, 15) // April 15, 2026

      const result = await getMonthlyProjection(mockDate)

      // Daily avg expense: $1500 / 15 = $100
      // Projected: $100 * 30 = $3000
      expect(result.projectedExpense).toBe(3000)

      // Daily avg income: $3000 / 15 = $200
      // Projected: $200 * 30 = $6000
      expect(result.projectedIncome).toBe(6000)

      // Projected savings: $6000 - $3000 = $3000
      expect(result.projectedSavings).toBe(3000)

      // Savings rate: 3000/6000 = 50%
      expect(result.projectedSavingsRate).toBe(50)
    })

    it('handles beginning of month', async () => {
      mockGetMonthTotals.mockReturnValue({
        expenseCents: 0,
        incomeCents: 0,
      })

      // Day 0 (edge case for start of month)
      const mockDate = new Date(2026, 3, 1) // April 1 (will have daysElapsed = 1)
      // For testing day 0 scenario, we need to construct carefully

      const result = await getMonthlyProjection(mockDate)

      // Day 1 of month - with no spending, projections based on 0/1 day
      expect(result.currentExpense).toBe(0)
      expect(result.currentIncome).toBe(0)
    })

    it('returns current values correctly', async () => {
      mockGetMonthTotals.mockReturnValue({
        expenseCents: 250000, // $2500
        incomeCents: 400000,  // $4000
      })

      const mockDate = new Date(2026, 3, 20)

      const result = await getMonthlyProjection(mockDate)

      expect(result.currentExpense).toBe(2500)
      expect(result.currentIncome).toBe(4000)
      expect(result.daysElapsed).toBe(20)
    })
  })

  describe('getYearlyProjection', () => {
    it('projects year-end from monthly averages', async () => {
      // 6 months elapsed (round number for easier calculation)
      mockGetYearTotals.mockReturnValue({
        incomeCents: 3000000, // $30,000 in 6 months
        expenseCents: 1800000, // $18,000 in 6 months
      })

      // July 1st (6 completed months + ~0 days = 6.0 months)
      const mockDate = new Date(2026, 6, 1)

      const result = await getYearlyProjection(2026, mockDate)

      // At July 1: 6 completed months + 1/31 day = ~6.03 months
      // Avg monthly income: $30,000 / 6.03 ≈ $4975
      // Projected annual: ~$4975 * 12 ≈ $59,700
      // Due to rounding, we check approximate values
      expect(result.projectedIncome).toBeGreaterThan(59000)
      expect(result.projectedIncome).toBeLessThan(60500)

      // Avg monthly expense: $18,000 / 6.03 ≈ $2985
      // Projected annual: ~$2985 * 12 ≈ $35,820
      expect(result.projectedExpense).toBeGreaterThan(35000)
      expect(result.projectedExpense).toBeLessThan(36500)

      // Projected savings rate should be ~40%
      expect(result.projectedSavingsRate).toBeGreaterThanOrEqual(38)
      expect(result.projectedSavingsRate).toBeLessThanOrEqual(42)
    })

    it('returns zero projections early in January', async () => {
      mockGetYearTotals.mockReturnValue({
        incomeCents: 1000,
        expenseCents: 500,
      })

      // January 1st (nearly 0 months elapsed)
      const mockDate = new Date(2026, 0, 1)

      const result = await getYearlyProjection(2026, mockDate)

      // Not enough data for reliable projection
      expect(result.projectedIncome).toBe(0)
      expect(result.projectedExpense).toBe(0)
      expect(result.monthsElapsed).toBe(0)
    })

    it('calculates year-over-year comparison', async () => {
      // Current year YTD
      mockGetYearTotals.mockImplementation((year: number) => {
        if (year === 2026) {
          return { incomeCents: 1500000, expenseCents: 900000 }
        }
        // Last year full year
        return { incomeCents: 4800000, expenseCents: 3600000 }
      })

      const mockDate = new Date(2026, 3, 1)

      const result = await getYearlyProjection(2026, mockDate)

      expect(result.vsLastYear).not.toBeNull()
      expect(result.vsLastYear!.lastYearIncome).toBe(48000)
      expect(result.vsLastYear!.lastYearExpense).toBe(36000)
      expect(result.vsLastYear!.lastYearSavings).toBe(12000) // 48000 - 36000
    })

    it('returns null vsLastYear when no prior year data', async () => {
      mockGetYearTotals.mockImplementation((year: number) => {
        if (year === 2026) {
          return { incomeCents: 1500000, expenseCents: 900000 }
        }
        return { incomeCents: 0, expenseCents: 0 }
      })

      const mockDate = new Date(2026, 3, 1)

      const result = await getYearlyProjection(2026, mockDate)

      expect(result.vsLastYear).toBeNull()
    })

    it('handles zero income gracefully', async () => {
      mockGetYearTotals.mockReturnValue({
        incomeCents: 0,
        expenseCents: 100000,
      })

      const mockDate = new Date(2026, 5, 1)

      const result = await getYearlyProjection(2026, mockDate)

      expect(result.projectedSavingsRate).toBe(0)
    })
  })
})
