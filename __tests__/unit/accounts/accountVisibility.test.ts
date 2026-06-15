/**
 * Account Period Visibility Tests
 *
 * Tests for the confirmed model:
 * - Account is visible from min(addedDate, earliestTxnDate) onwards
 * - Shows in every period after start date, including empty ones
 * - Hidden in periods before start date
 */

// Re-create the helper functions for testing (they're not exported from the hook)
function getAccountStartDate(
  createdAt: string | undefined,
  firstTxnDate: string | undefined
): string | undefined {
  if (!createdAt) {
    return firstTxnDate
  }
  const createdDate = createdAt.slice(0, 10)
  if (!firstTxnDate) {
    return createdDate
  }
  return createdDate <= firstTxnDate ? createdDate : firstTxnDate
}

function getLastDayOfMonth(year: number, month: number): string {
  const lastDay = new Date(year, month, 0).getDate()
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

function isAccountVisibleInPeriod(
  startDate: string | undefined,
  scope: 'month' | 'year' | 'all',
  year: number,
  month: number
): boolean {
  if (!startDate) {
    return true
  }
  if (scope === 'all') {
    return true
  }
  if (scope === 'year') {
    const endOfYear = `${year}-12-31`
    return startDate <= endOfYear
  }
  const endOfMonth = getLastDayOfMonth(year, month)
  return startDate <= endOfMonth
}

describe('Account Period Visibility', () => {
  describe('getAccountStartDate', () => {
    it('returns firstTxnDate when createdAt is undefined (legacy account)', () => {
      const result = getAccountStartDate(undefined, '2026-04-15')
      expect(result).toBe('2026-04-15')
    })

    it('returns createdAt when firstTxnDate is undefined (no transactions)', () => {
      const result = getAccountStartDate('2026-06-13T10:00:00.000Z', undefined)
      expect(result).toBe('2026-06-13')
    })

    it('returns undefined when both are undefined', () => {
      const result = getAccountStartDate(undefined, undefined)
      expect(result).toBeUndefined()
    })

    it('returns createdAt when it is earlier than firstTxnDate', () => {
      const result = getAccountStartDate('2026-04-01T10:00:00.000Z', '2026-06-15')
      expect(result).toBe('2026-04-01')
    })

    it('returns firstTxnDate when it is earlier than createdAt', () => {
      // Scenario: Account added in June, but has a transaction from April
      const result = getAccountStartDate('2026-06-13T10:00:00.000Z', '2026-04-15')
      expect(result).toBe('2026-04-15')
    })

    it('returns createdAt when both are the same day', () => {
      const result = getAccountStartDate('2026-06-15T10:00:00.000Z', '2026-06-15')
      expect(result).toBe('2026-06-15')
    })
  })

  describe('isAccountVisibleInPeriod', () => {
    describe('all time scope', () => {
      it('always shows account regardless of start date', () => {
        expect(isAccountVisibleInPeriod('2026-06-15', 'all', 2025, 1)).toBe(true)
        expect(isAccountVisibleInPeriod('2030-12-31', 'all', 2025, 1)).toBe(true)
      })
    })

    describe('monthly scope', () => {
      // Test case: Account added June 2026 + transaction April 2026
      // Start date = April 2026
      const startDate = '2026-04-15'

      it('shows account in the start month (April 2026)', () => {
        expect(isAccountVisibleInPeriod(startDate, 'month', 2026, 4)).toBe(true)
      })

      it('shows account in empty months after start (May 2026)', () => {
        expect(isAccountVisibleInPeriod(startDate, 'month', 2026, 5)).toBe(true)
      })

      it('shows account in June 2026 (when it was created)', () => {
        expect(isAccountVisibleInPeriod(startDate, 'month', 2026, 6)).toBe(true)
      })

      it('shows account in future months (December 2026)', () => {
        expect(isAccountVisibleInPeriod(startDate, 'month', 2026, 12)).toBe(true)
      })

      it('hides account in months before start (March 2026)', () => {
        expect(isAccountVisibleInPeriod(startDate, 'month', 2026, 3)).toBe(false)
      })

      it('hides account in previous years (2025)', () => {
        expect(isAccountVisibleInPeriod(startDate, 'month', 2025, 12)).toBe(false)
      })
    })

    describe('yearly scope', () => {
      const startDate = '2026-04-15'

      it('shows account in the start year', () => {
        expect(isAccountVisibleInPeriod(startDate, 'year', 2026, 1)).toBe(true)
      })

      it('shows account in future years', () => {
        expect(isAccountVisibleInPeriod(startDate, 'year', 2027, 1)).toBe(true)
      })

      it('hides account in previous years', () => {
        expect(isAccountVisibleInPeriod(startDate, 'year', 2025, 1)).toBe(false)
      })
    })

    describe('edge cases', () => {
      it('shows account when start date is last day of month', () => {
        // Account starts on June 30 - should be visible in June
        expect(isAccountVisibleInPeriod('2026-06-30', 'month', 2026, 6)).toBe(true)
      })

      it('hides account when start date is first day of next month', () => {
        // Account starts on July 1 - should NOT be visible in June
        expect(isAccountVisibleInPeriod('2026-07-01', 'month', 2026, 6)).toBe(false)
      })

      it('shows legacy accounts with no start date (undefined)', () => {
        expect(isAccountVisibleInPeriod(undefined, 'month', 2020, 1)).toBe(true)
      })
    })
  })

  describe('confirmed model scenarios', () => {
    it('scenario: account added June 2026 with April 2026 transaction', () => {
      const createdAt = '2026-06-13T10:00:00.000Z' // Added in June
      const firstTxnDate = '2026-04-15' // Transaction in April

      const startDate = getAccountStartDate(createdAt, firstTxnDate)
      expect(startDate).toBe('2026-04-15') // Should use earlier date

      // Visible in April (start month)
      expect(isAccountVisibleInPeriod(startDate, 'month', 2026, 4)).toBe(true)
      // Visible in May (empty month)
      expect(isAccountVisibleInPeriod(startDate, 'month', 2026, 5)).toBe(true)
      // Visible in June (created month)
      expect(isAccountVisibleInPeriod(startDate, 'month', 2026, 6)).toBe(true)
      // NOT visible in March (before start)
      expect(isAccountVisibleInPeriod(startDate, 'month', 2026, 3)).toBe(false)
      // NOT visible in 2025
      expect(isAccountVisibleInPeriod(startDate, 'year', 2025, 1)).toBe(false)
    })
  })
})
