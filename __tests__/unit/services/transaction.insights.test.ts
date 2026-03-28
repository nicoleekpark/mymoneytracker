import { getPersonalBests, getCumulativeNetData } from '@/core/services/transaction'

// Mock the repository
jest.mock('@/infrastructure/repositories', () => ({
  transactionRepository: {
    listMonthlyNetTotals: jest.fn(),
    listYearlyFlowTotals: jest.fn(),
  },
}))

import { transactionRepository } from '@/infrastructure/repositories'

const mockListMonthlyNet = transactionRepository.listMonthlyNetTotals as jest.MockedFunction<typeof transactionRepository.listMonthlyNetTotals>
const mockListYearlyFlow = transactionRepository.listYearlyFlowTotals as jest.MockedFunction<typeof transactionRepository.listYearlyFlowTotals>

describe('transaction.insights', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock to prevent undefined errors
    mockListYearlyFlow.mockReturnValue([])
  })

  describe('getPersonalBests', () => {
    it('finds best savings month', async () => {
      mockListMonthlyNet.mockReturnValue([
        { month: '2026-01', type: 'income', totalCents: 500000 },
        { month: '2026-01', type: 'expense', totalCents: 300000 },
        { month: '2026-02', type: 'income', totalCents: 600000 },
        { month: '2026-02', type: 'expense', totalCents: 200000 }, // Best: $4000 net
        { month: '2026-03', type: 'income', totalCents: 400000 },
        { month: '2026-03', type: 'expense', totalCents: 350000 },
      ])

      const result = await getPersonalBests()

      expect(result.bestSavingsMonth).toEqual({
        month: '2026-02',
        netDollar: 4000, // 6000 - 2000
      })
    })

    it('finds worst month', async () => {
      mockListMonthlyNet.mockReturnValue([
        { month: '2026-01', type: 'income', totalCents: 200000 },
        { month: '2026-01', type: 'expense', totalCents: 500000 }, // Worst: -$3000
        { month: '2026-02', type: 'income', totalCents: 400000 },
        { month: '2026-02', type: 'expense', totalCents: 300000 },
      ])

      const result = await getPersonalBests()

      expect(result.worstMonth).toEqual({
        month: '2026-01',
        netDollar: -3000,
      })
    })

    it('finds peak expense month', async () => {
      mockListMonthlyNet.mockReturnValue([
        { month: '2026-01', type: 'expense', totalCents: 300000 },
        { month: '2026-02', type: 'expense', totalCents: 500000 }, // Peak
        { month: '2026-03', type: 'expense', totalCents: 400000 },
      ])

      const result = await getPersonalBests()

      expect(result.peakExpenseMonth).toEqual({
        month: '2026-02',
        expenseDollar: 5000,
      })
    })

    it('calculates longest positive streak', async () => {
      mockListMonthlyNet.mockReturnValue([
        // Months sorted chronologically
        { month: '2026-01', type: 'income', totalCents: 400000 },
        { month: '2026-01', type: 'expense', totalCents: 300000 }, // +$1000
        { month: '2026-02', type: 'income', totalCents: 500000 },
        { month: '2026-02', type: 'expense', totalCents: 400000 }, // +$1000
        { month: '2026-03', type: 'income', totalCents: 600000 },
        { month: '2026-03', type: 'expense', totalCents: 500000 }, // +$1000
        { month: '2026-04', type: 'income', totalCents: 300000 },
        { month: '2026-04', type: 'expense', totalCents: 400000 }, // -$1000 (breaks streak)
        { month: '2026-05', type: 'income', totalCents: 500000 },
        { month: '2026-05', type: 'expense', totalCents: 400000 }, // +$1000
      ])

      const result = await getPersonalBests()

      expect(result.positiveStreak).toBe(3) // Jan-Feb-Mar
    })

    it('calculates current streak', async () => {
      mockListMonthlyNet.mockReturnValue([
        { month: '2026-01', type: 'income', totalCents: 300000 },
        { month: '2026-01', type: 'expense', totalCents: 400000 }, // -$1000
        { month: '2026-02', type: 'income', totalCents: 500000 },
        { month: '2026-02', type: 'expense', totalCents: 300000 }, // +$2000
        { month: '2026-03', type: 'income', totalCents: 600000 },
        { month: '2026-03', type: 'expense', totalCents: 400000 }, // +$2000
      ])

      const result = await getPersonalBests()

      expect(result.currentStreak).toEqual({
        months: 2, // Feb-Mar
        isPositive: true,
      })
    })

    it('handles negative current streak', async () => {
      mockListMonthlyNet.mockReturnValue([
        { month: '2026-01', type: 'income', totalCents: 500000 },
        { month: '2026-01', type: 'expense', totalCents: 300000 }, // +$2000
        { month: '2026-02', type: 'income', totalCents: 300000 },
        { month: '2026-02', type: 'expense', totalCents: 400000 }, // -$1000
        { month: '2026-03', type: 'income', totalCents: 300000 },
        { month: '2026-03', type: 'expense', totalCents: 500000 }, // -$2000
      ])

      const result = await getPersonalBests()

      expect(result.currentStreak).toEqual({
        months: 2, // Feb-Mar negative
        isPositive: false,
      })
    })

    it('returns null for best savings month if all negative', async () => {
      mockListMonthlyNet.mockReturnValue([
        { month: '2026-01', type: 'expense', totalCents: 500000 },
        { month: '2026-02', type: 'expense', totalCents: 400000 },
      ])

      const result = await getPersonalBests()

      expect(result.bestSavingsMonth).toBeNull()
    })
  })

  describe('getCumulativeNetData', () => {
    it('calculates running cumulative total', async () => {
      mockListMonthlyNet.mockReturnValue([
        { month: '2026-01', type: 'income', totalCents: 500000 },
        { month: '2026-01', type: 'expense', totalCents: 300000 }, // Net +$2000
        { month: '2026-02', type: 'income', totalCents: 400000 },
        { month: '2026-02', type: 'expense', totalCents: 500000 }, // Net -$1000
        { month: '2026-03', type: 'income', totalCents: 600000 },
        { month: '2026-03', type: 'expense', totalCents: 400000 }, // Net +$2000
      ])

      const result = await getCumulativeNetData()

      expect(result).toEqual([
        { month: '2026-01', netDollar: 2000, cumulativeDollar: 2000 },
        { month: '2026-02', netDollar: -1000, cumulativeDollar: 1000 },
        { month: '2026-03', netDollar: 2000, cumulativeDollar: 3000 },
      ])
    })

    it('handles empty data', async () => {
      mockListMonthlyNet.mockReturnValue([])

      const result = await getCumulativeNetData()

      expect(result).toEqual([])
    })

    it('sorts months chronologically', async () => {
      mockListMonthlyNet.mockReturnValue([
        { month: '2026-03', type: 'income', totalCents: 300000 },
        { month: '2026-01', type: 'income', totalCents: 100000 },
        { month: '2026-02', type: 'income', totalCents: 200000 },
      ])

      const result = await getCumulativeNetData()

      expect(result[0].month).toBe('2026-01')
      expect(result[1].month).toBe('2026-02')
      expect(result[2].month).toBe('2026-03')
    })
  })
})
