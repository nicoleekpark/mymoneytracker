import { useCallback, useMemo, useState } from 'react'
import { Keyboard } from 'react-native'
import { formatCentsForDisplay } from '@/shared/format/currency'

function digitsOnly(s: string): string {
  return s.replace(/[^\d]/g, '')
}

function formatCentsDisplay(centsText: string): string {
  const digits = digitsOnly(centsText)
  const cents = digits ? Number(digits) : 0
  return formatCentsForDisplay(cents)
}

function centsNumber(centsText: string): number {
  const digits = digitsOnly(centsText)
  const n = digits ? Number(digits) : 0
  return Number.isFinite(n) ? n : NaN
}

export type AmountKeypadState = Readonly<{
  amountCentsText: string
  amountCents: number
  amountDisplay: string
  amountDollars: number
  showAmountKeypad: boolean
  openAmountKeypad: () => void
  closeAmountKeypad: () => void
  appendAmountDigit: (d: string) => void
  backspaceAmount: () => void
  clearAmount: () => void
  setAmountCents: (cents: number) => void
}>

export function useAmountKeypad(): AmountKeypadState {
  const [amountCentsText, setAmountCentsText] = useState('')
  const [showAmountKeypad, setShowAmountKeypad] = useState(false)

  const amountCents = useMemo(() => centsNumber(amountCentsText), [amountCentsText])
  const amountDisplay = useMemo(() => formatCentsDisplay(amountCentsText), [amountCentsText])

  const amountDollars = useMemo(() => {
    if (!Number.isFinite(amountCents) || amountCents < 0) return NaN
    return amountCents / 100
  }, [amountCents])

  const openAmountKeypad = useCallback(() => {
    Keyboard.dismiss()
    setShowAmountKeypad(true)
  }, [])

  const closeAmountKeypad = useCallback(() => {
    setShowAmountKeypad(false)
  }, [])

  const appendAmountDigit = useCallback((d: string) => {
    setAmountCentsText((prev) => {
      const next = digitsOnly(`${prev}${d}`)
      return next.length > 12 ? next.slice(0, 12) : next
    })
  }, [])

  const backspaceAmount = useCallback(() => {
    setAmountCentsText((prev) => prev.slice(0, -1))
  }, [])

  const clearAmount = useCallback(() => {
    setAmountCentsText('')
  }, [])

  const setAmountCents = useCallback((cents: number) => {
    if (Number.isFinite(cents) && cents >= 0) {
      setAmountCentsText(String(cents))
    }
  }, [])

  return {
    amountCentsText,
    amountCents,
    amountDisplay,
    amountDollars,
    showAmountKeypad,
    openAmountKeypad,
    closeAmountKeypad,
    appendAmountDigit,
    backspaceAmount,
    clearAmount,
    setAmountCents,
  }
}
