import { useCallback, useMemo, useState } from 'react'
import { Keyboard } from 'react-native'

export type DateTimeState = Readonly<{
  occurredAt: Date
  setOccurredAt: (date: Date) => void
  dateDisplay: string
  timeDisplay: string
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
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  const dateDisplay = useMemo(() => occurredAt.toLocaleDateString(), [occurredAt])

  const timeDisplay = useMemo(
    () => occurredAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    [occurredAt]
  )

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
