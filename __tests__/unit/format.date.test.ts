import {
  formatYearMonth,
  formatTrackingSince,
  getDaysInMonth,
  getMonthsElapsed
} from '@/shared/format/date'

describe('date formatting', () => {
  describe('formatYearMonth', () => {
    it('formats YYYY-MM to readable string', () => {
      expect(formatYearMonth('2026-01')).toBe('Jan 2026')
      expect(formatYearMonth('2026-12')).toBe('Dec 2026')
    })

    it('handles invalid input gracefully', () => {
      expect(formatYearMonth('invalid')).toBe('invalid')
    })
  })

  describe('formatTrackingSince', () => {
    it('formats date as "Tracking since Month Year"', () => {
      const date = new Date(2025, 0, 15) // Jan 2025
      expect(formatTrackingSince(date)).toBe('Tracking since Jan 2025')
    })

    it('returns "No data yet" for null', () => {
      expect(formatTrackingSince(null)).toBe('No data yet')
    })
  })

  describe('getDaysInMonth', () => {
    it('returns correct days for various months', () => {
      expect(getDaysInMonth(2026, 1)).toBe(31) // January
      expect(getDaysInMonth(2026, 2)).toBe(28) // February (non-leap)
      expect(getDaysInMonth(2024, 2)).toBe(29) // February (leap year)
      expect(getDaysInMonth(2026, 4)).toBe(30) // April
    })
  })

  describe('getMonthsElapsed', () => {
    it('calculates months between dates', () => {
      const start = new Date(2025, 0, 1) // Jan 2025
      const end = new Date(2025, 5, 1) // Jun 2025
      expect(getMonthsElapsed(start, end)).toBe(6)
    })

    it('handles same month', () => {
      const date = new Date(2025, 0, 15)
      expect(getMonthsElapsed(date, date)).toBe(1)
    })

    it('handles year boundaries', () => {
      const start = new Date(2025, 11, 1) // Dec 2025
      const end = new Date(2026, 1, 1) // Feb 2026
      expect(getMonthsElapsed(start, end)).toBe(3)
    })
  })
})
