import { renderHook, act } from '@testing-library/react'

// Mock react-native before importing the hook
jest.mock('react-native', () => ({
  Keyboard: {
    dismiss: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeAllListeners: jest.fn(),
  },
  Platform: { OS: 'ios', select: jest.fn((obj: Record<string, unknown>) => obj.ios) },
}))

// Import after mock is set up
import { useAmountKeypad } from '@/features/transactions/add/hooks/useAmountKeypad'
import { Keyboard } from 'react-native'

describe('useAmountKeypad', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('starts with empty amount text', () => {
      const { result } = renderHook(() => useAmountKeypad())

      expect(result.current.amountCentsText).toBe('')
    })

    it('starts with amountCents = 0', () => {
      const { result } = renderHook(() => useAmountKeypad())

      expect(result.current.amountCents).toBe(0)
    })

    it('starts with amountDisplay = "0.00"', () => {
      const { result } = renderHook(() => useAmountKeypad())

      expect(result.current.amountDisplay).toBe('0.00')
    })

    it('starts with amountDollars = 0', () => {
      const { result } = renderHook(() => useAmountKeypad())

      expect(result.current.amountDollars).toBe(0)
    })

    it('starts with keypad closed', () => {
      const { result } = renderHook(() => useAmountKeypad())

      expect(result.current.showAmountKeypad).toBe(false)
    })
  })

  describe('appendAmountDigit', () => {
    it('appends single digit', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.appendAmountDigit('5')
      })

      expect(result.current.amountCentsText).toBe('5')
      expect(result.current.amountCents).toBe(5)
    })

    it('appends multiple digits in sequence', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.appendAmountDigit('1')
        result.current.appendAmountDigit('2')
        result.current.appendAmountDigit('3')
      })

      expect(result.current.amountCentsText).toBe('123')
      expect(result.current.amountCents).toBe(123)
    })

    it('updates amountDisplay correctly', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.appendAmountDigit('1')
        result.current.appendAmountDigit('2')
        result.current.appendAmountDigit('3')
        result.current.appendAmountDigit('4')
        result.current.appendAmountDigit('5')
      })

      // 12345 cents = $123.45
      expect(result.current.amountDisplay).toBe('123.45')
    })

    it('updates amountDollars correctly', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.appendAmountDigit('5')
        result.current.appendAmountDigit('0')
        result.current.appendAmountDigit('0')
      })

      // 500 cents = $5.00
      expect(result.current.amountDollars).toBe(5)
    })

    it('limits to 12 digits maximum', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        // Append 15 digits
        for (let i = 0; i < 15; i++) {
          result.current.appendAmountDigit('9')
        }
      })

      expect(result.current.amountCentsText).toBe('999999999999')
      expect(result.current.amountCentsText.length).toBe(12)
    })

    it('ignores non-digit characters', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.appendAmountDigit('1')
        result.current.appendAmountDigit('a')
        result.current.appendAmountDigit('.')
        result.current.appendAmountDigit('2')
      })

      expect(result.current.amountCentsText).toBe('12')
    })
  })

  describe('backspaceAmount', () => {
    it('removes last digit', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.appendAmountDigit('1')
        result.current.appendAmountDigit('2')
        result.current.appendAmountDigit('3')
        result.current.backspaceAmount()
      })

      expect(result.current.amountCentsText).toBe('12')
    })

    it('handles backspace on empty amount', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.backspaceAmount()
      })

      expect(result.current.amountCentsText).toBe('')
      expect(result.current.amountCents).toBe(0)
    })

    it('can backspace to empty', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.appendAmountDigit('5')
        result.current.backspaceAmount()
      })

      expect(result.current.amountCentsText).toBe('')
      expect(result.current.amountCents).toBe(0)
      expect(result.current.amountDisplay).toBe('0.00')
    })
  })

  describe('clearAmount', () => {
    it('clears all digits', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.appendAmountDigit('1')
        result.current.appendAmountDigit('2')
        result.current.appendAmountDigit('3')
        result.current.clearAmount()
      })

      expect(result.current.amountCentsText).toBe('')
      expect(result.current.amountCents).toBe(0)
    })

    it('resets display to "0.00"', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.appendAmountDigit('9')
        result.current.appendAmountDigit('9')
        result.current.appendAmountDigit('9')
        result.current.clearAmount()
      })

      expect(result.current.amountDisplay).toBe('0.00')
    })

    it('works on already empty amount', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.clearAmount()
      })

      expect(result.current.amountCentsText).toBe('')
    })
  })

  describe('setAmountCents', () => {
    it('sets amount from cents value', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.setAmountCents(1234)
      })

      expect(result.current.amountCents).toBe(1234)
      expect(result.current.amountCentsText).toBe('1234')
    })

    it('handles zero', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.setAmountCents(0)
      })

      expect(result.current.amountCents).toBe(0)
      expect(result.current.amountCentsText).toBe('0')
    })

    it('ignores negative values', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.appendAmountDigit('5')
        result.current.setAmountCents(-100)
      })

      // Should not change - negative ignored
      expect(result.current.amountCentsText).toBe('5')
    })

    it('ignores NaN', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.appendAmountDigit('5')
        result.current.setAmountCents(NaN)
      })

      // Should not change - NaN ignored
      expect(result.current.amountCentsText).toBe('5')
    })

    it('ignores Infinity', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.appendAmountDigit('5')
        result.current.setAmountCents(Infinity)
      })

      // Should not change - Infinity ignored
      expect(result.current.amountCentsText).toBe('5')
    })
  })

  describe('keypad visibility', () => {
    it('openAmountKeypad shows keypad', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.openAmountKeypad()
      })

      expect(result.current.showAmountKeypad).toBe(true)
    })

    it('openAmountKeypad dismisses keyboard', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.openAmountKeypad()
      })

      expect(Keyboard.dismiss).toHaveBeenCalled()
    })

    it('closeAmountKeypad hides keypad', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.openAmountKeypad()
        result.current.closeAmountKeypad()
      })

      expect(result.current.showAmountKeypad).toBe(false)
    })
  })

  describe('amountDisplay formatting', () => {
    it('formats 0 as "0.00"', () => {
      const { result } = renderHook(() => useAmountKeypad())

      expect(result.current.amountDisplay).toBe('0.00')
    })

    it('formats single digit with padding', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.appendAmountDigit('5')
      })

      // 5 cents = $0.05
      expect(result.current.amountDisplay).toBe('0.05')
    })

    it('formats two digits with padding', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.appendAmountDigit('5')
        result.current.appendAmountDigit('0')
      })

      // 50 cents = $0.50
      expect(result.current.amountDisplay).toBe('0.50')
    })

    it('formats three digits correctly', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.appendAmountDigit('1')
        result.current.appendAmountDigit('2')
        result.current.appendAmountDigit('5')
      })

      // 125 cents = $1.25
      expect(result.current.amountDisplay).toBe('1.25')
    })

    it('formats large amounts correctly', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.setAmountCents(12345678)
      })

      // 12345678 cents = $123,456.78 (with thousand separator)
      expect(result.current.amountDisplay).toBe('123,456.78')
    })
  })

  describe('amountDollars conversion', () => {
    it('converts cents to dollars', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.setAmountCents(500)
      })

      expect(result.current.amountDollars).toBe(5)
    })

    it('handles fractional dollars', () => {
      const { result } = renderHook(() => useAmountKeypad())

      act(() => {
        result.current.setAmountCents(550)
      })

      expect(result.current.amountDollars).toBe(5.5)
    })

    it('handles zero', () => {
      const { result } = renderHook(() => useAmountKeypad())

      expect(result.current.amountDollars).toBe(0)
    })
  })
})
