import { Picker } from '@react-native-picker/picker'
import React, { useMemo, useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'

import { useHoHTheme } from '@/shared/providers'
import { HIT_SLOP_MD } from '@/shared/theme/tokens/buttons'

import type { Period, Scope } from '../types'
import { getMaxYearMonth, getMonthNameFull } from '../utils'
import { createDashboardPeriodPickerStyles } from './DashboardPeriodPicker.styles'

type Props = {
  visible: boolean
  scope: Scope
  currentPeriod: Period
  onClose: () => void
  onSelect: (p: Period) => void
}

export function DashboardPeriodPicker(props: Props) {
  const { visible, scope, currentPeriod, onClose, onSelect } = props
  const theme = useHoHTheme()
  const styles = useMemo(() => createDashboardPeriodPickerStyles(theme), [theme])
  const max = getMaxYearMonth()

  // Local state for picker values
  const initialYear = currentPeriod.year
  const initialMonth = 'month' in currentPeriod ? currentPeriod.month : 1
  const [selectedYear, setSelectedYear] = useState(initialYear)
  const [selectedMonth, setSelectedMonth] = useState(initialMonth)

  // Reset local state when picker opens
  React.useEffect(() => {
    if (visible) {
      setSelectedYear(currentPeriod.year)
      setSelectedMonth('month' in currentPeriod ? currentPeriod.month : 1)
    }
  }, [visible, currentPeriod])

  const years = useMemo(() => {
    const out: number[] = []
    for (let y = max.year; y >= max.year - 10; y--) out.push(y)
    return out
  }, [max.year])

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: getMonthNameFull(i + 1)
    }))
  }, [])

  // Get allowed months for selected year (can't select future months)
  const allowedMonths = useMemo(() => {
    if (selectedYear === max.year) {
      return months.filter((m) => m.value <= max.month)
    }
    return months
  }, [selectedYear, max.year, max.month, months])

  // Clamp month if year changes and current month is not allowed
  React.useEffect(() => {
    if (selectedYear === max.year && selectedMonth > max.month) {
      setSelectedMonth(max.month)
    }
  }, [selectedYear, selectedMonth, max.year, max.month])

  const handleDone = () => {
    if (scope === 'year') {
      onSelect({ year: selectedYear })
    } else {
      onSelect({ year: selectedYear, month: selectedMonth })
    }
    onClose()
  }

  if (!visible || scope === 'all') return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select {scope === 'year' ? 'Year' : 'Month'}</Text>
            <Pressable onPress={handleDone} hitSlop={HIT_SLOP_MD} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Done</Text>
            </Pressable>
          </View>

          {/* Pickers */}
          <View style={styles.pickerContainer}>
            {/* Year Picker */}
            <View style={styles.pickerColumn}>
              <Picker
                selectedValue={selectedYear}
                onValueChange={(value) => setSelectedYear(value)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {years.map((year) => (
                  <Picker.Item key={year} label={String(year)} value={year} />
                ))}
              </Picker>
            </View>

            {/* Month Picker (only for month scope) */}
            {scope === 'month' && (
              <View style={styles.pickerColumn}>
                <Picker
                  selectedValue={selectedMonth}
                  onValueChange={(value) => setSelectedMonth(value)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {allowedMonths.map((month) => (
                    <Picker.Item
                      key={month.value}
                      label={month.label}
                      value={month.value}
                    />
                  ))}
                </Picker>
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
