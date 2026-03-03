import { useCallback, useMemo, useState } from 'react'
import { Keyboard } from 'react-native'

export type DateTimeState = Readonly<{
  occurredAt: Date
  setOccurredAt: (date: Date) => void
  dateDisplay: string
  timeDisplay: string
  // Combined modal state
  showDateTimeModal: boolean
  openDateTimeModal: () => void
  closeDateTimeModal: () => void
  onDateTimeConfirm: (date: Date) => void
  // Legacy - for inline pickers if still needed
  showDatePicker: boolean
  showTimePicker: boolean
  openDatePicker: () => void
  closeDatePicker: () => void
  openTimePicker: () => void
  closeTimePicker: () => void
  onDateChange: (date: Date | undefined) => void
  onTimeChange: (date: Date | undefined) => void
}>

export function useDateTime(initialDate?: Date): DateTimeState {
  const [occurredAt, setOccurredAt] = useState<Date>(initialDate ?? new Date())
  const [showDateTimeModal, setShowDateTimeModal] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  const dateDisplay = useMemo(() => {
    const today = new Date()
    const isToday = occurredAt.toDateString() === today.toDateString()

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = occurredAt.toDateString() === yesterday.toDateString()

    if (isToday) return 'Today'
    if (isYesterday) return 'Yesterday'
    return occurredAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }, [occurredAt])

  const timeDisplay = useMemo(
    () => occurredAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    [occurredAt]
  )

  // Combined modal handlers
  const openDateTimeModal = useCallback(() => {
    Keyboard.dismiss()
    setShowDateTimeModal(true)
  }, [])

  const closeDateTimeModal = useCallback(() => {
    setShowDateTimeModal(false)
  }, [])

  const onDateTimeConfirm = useCallback((date: Date) => {
    setOccurredAt(date)
    setShowDateTimeModal(false)
  }, [])

  // Legacy handlers for inline pickers
  const openDatePicker = useCallback(() => {
    Keyboard.dismiss()
    setShowDatePicker((v) => !v)
  }, [])

  const closeDatePicker = useCallback(() => {
    setShowDatePicker(false)
  }, [])

  const openTimePicker = useCallback(() => {
    Keyboard.dismiss()
    setShowTimePicker((v) => !v)
  }, [])

  const closeTimePicker = useCallback(() => {
    setShowTimePicker(false)
  }, [])

  const onDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      setOccurredAt((prev) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate(), prev.getHours(), prev.getMinutes(), 0, 0)
      )
    }
    setShowDatePicker(false)
  }, [])

  const onTimeChange = useCallback((date: Date | undefined) => {
    if (date) {
      setOccurredAt((prev) =>
        new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), date.getHours(), date.getMinutes(), 0, 0)
      )
    }
    setShowTimePicker(false)
  }, [])

  return {
    occurredAt,
    setOccurredAt,
    dateDisplay,
    timeDisplay,
    // Combined modal
    showDateTimeModal,
    openDateTimeModal,
    closeDateTimeModal,
    onDateTimeConfirm,
    // Legacy
    showDatePicker,
    showTimePicker,
    openDatePicker,
    closeDatePicker,
    openTimePicker,
    closeTimePicker,
    onDateChange,
    onTimeChange,
  }
}
