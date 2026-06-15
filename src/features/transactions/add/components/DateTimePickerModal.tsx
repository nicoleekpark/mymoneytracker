import { useHoHTheme } from '@/shared/providers'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { getSheetBottomPadding } from '@/shared/theme/tokens/modal'
import { BACKDROP } from '@/shared/theme/tokens/backdrop'
import DateTimePicker from '@react-native-community/datetimepicker'
import React, { useState } from 'react'
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = Readonly<{
  visible: boolean
  value: Date
  onClose: () => void
  onConfirm: (date: Date) => void
}>

export function DateTimePickerModal({
  visible,
  value,
  onClose,
  onConfirm,
}: Props) {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()

  // Local state for editing before confirm
  const [tempDate, setTempDate] = useState(value)
  const [showTimePicker, setShowTimePicker] = useState(false)

  // Reset temp date when modal opens
  React.useEffect(() => {
    if (visible) {
      setTempDate(value)
      setShowTimePicker(false)
    }
  }, [visible, value])

  const handleDateChange = (_event: unknown, date: Date | undefined) => {
    if (date) {
      // Preserve the time when changing date
      const newDate = new Date(date)
      newDate.setHours(tempDate.getHours(), tempDate.getMinutes(), 0, 0)
      setTempDate(newDate)
    }
  }

  const handleTimeChange = (_event: unknown, date: Date | undefined) => {
    if (date) {
      // Preserve the date when changing time
      const newDate = new Date(tempDate)
      newDate.setHours(date.getHours(), date.getMinutes(), 0, 0)
      setTempDate(newDate)
    }
    // On iOS spinner, don't auto-close
    if (Platform.OS === 'android') {
      setShowTimePicker(false)
    }
  }

  const handleConfirm = () => {
    onConfirm(tempDate)
    onClose()
  }

  const handleCancel = () => {
    setTempDate(value) // Reset to original
    setShowTimePicker(false)
    onClose()
  }

  const timeDisplay = tempDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
      {/* Backdrop - tap to dismiss */}
      <Pressable style={styles.backdrop} onPress={handleCancel} />

      {/* Sheet */}
      <View style={[styles.sheet, { backgroundColor: theme.semantic.surface, borderColor: theme.semantic.border, paddingBottom: getSheetBottomPadding(insets.bottom) }]}>
        {/* Drag Handle */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: theme.semantic.border }]} />
        </View>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.semantic.border }]}>
          <Pressable onPress={handleCancel} hitSlop={10}>
            <Text style={[styles.headerLink, { color: theme.semantic.primary }]}>Cancel</Text>
          </Pressable>

          <Text style={[styles.headerTitle, { color: theme.semantic.text }]}>Date & Time</Text>

          <Pressable onPress={handleConfirm} hitSlop={10}>
            <Text style={[styles.headerLink, { color: theme.semantic.primary }]}>Done</Text>
          </Pressable>
        </View>

        {/* Calendar Container */}
        <View style={[styles.calendarContainer, { backgroundColor: theme.semantic.surfaceAlt }]}>
          {/* Date Picker - Calendar */}
          {/*
           * iOS: display="inline" shows full calendar (iOS 14+)
           * Android: display="calendar" shows calendar picker
           */}
          <View style={styles.calendarWrapper}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
              themeVariant={theme.mode}
              onChange={handleDateChange}
            />
          </View>

          {/* Time Row */}
          <View style={[styles.timeRow, { borderTopColor: theme.semantic.border }]}>
            <Text style={[styles.timeLabel, { color: theme.semantic.text }]}>Time</Text>
            <Pressable onPress={() => setShowTimePicker(!showTimePicker)}>
              <Text style={[styles.timeValue, { color: theme.semantic.primary }]}>{timeDisplay}</Text>
            </Pressable>
          </View>

          {/* Time Picker - Spinner (shown when time row tapped) */}
          {showTimePicker && (
            <View style={[styles.timePickerWrapper, { borderTopColor: theme.semantic.border }]}>
              <DateTimePicker
                value={tempDate}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                themeVariant={theme.mode}
                onChange={handleTimeChange}
                style={styles.timePicker}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: BACKDROP.dark,
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  handleContainer: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: radius.full,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerLink: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.heavy,
  },
  calendarContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  calendarWrapper: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
  },
  timeLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  timeValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  timePickerWrapper: {
    borderTopWidth: 1,
    alignItems: 'center',
  },
  timePicker: {
    width: '100%',
  },
})
