import { useHoHTheme } from '@/shared/providers'
import { Divider } from '@/shared/components'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { radius } from '@/shared/theme/tokens/radius'
import { fontWeight } from '@/shared/theme/tokens/typography'

import type { DateTimeState } from '../hooks/useDateTime'

type Props = {
  dateTime: DateTimeState
  /** When true, renders only the pickers without the card wrapper */
  embedded?: boolean
}

export function DateTimeSection({ dateTime, embedded = false }: Props) {
  const theme = useHoHTheme()

  // Embedded mode - just show pickers inline
  if (embedded) {
    return (
      <View style={styles.embeddedWrap}>
        {dateTime.showDatePicker && (
          <DateTimePicker
            value={dateTime.occurredAt}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            themeVariant={theme.mode}
            onChange={(_event, date) => dateTime.onDateChange(date)}
          />
        )}
        {dateTime.showTimePicker && (
          <DateTimePicker
            value={dateTime.occurredAt}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant={theme.mode}
            onChange={(_event, date) => dateTime.onTimeChange(date)}
          />
        )}
      </View>
    )
  }

  // Full card mode (legacy)
  return (
    <View style={[styles.card, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}>
      <Pressable onPress={dateTime.openDatePicker} style={styles.row}>
        <Text style={[styles.rowLabel, { color: theme.semantic.textSecondary }]}>Date</Text>
        <Text style={{ color: theme.semantic.text, fontWeight: fontWeight.heavy }}>{dateTime.dateDisplay}</Text>
      </Pressable>

      {dateTime.showDatePicker && (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={dateTime.occurredAt}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            themeVariant={theme.mode}
            onChange={(_event, date) => dateTime.onDateChange(date)}
          />
        </View>
      )}

      <Divider spacing="md" />

      <Pressable onPress={dateTime.openTimePicker} style={styles.row}>
        <Text style={[styles.rowLabel, { color: theme.semantic.textSecondary }]}>Time</Text>
        <Text style={{ color: theme.semantic.text, fontWeight: fontWeight.heavy }}>{dateTime.timeDisplay}</Text>
      </Pressable>

      {dateTime.showTimePicker && (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={dateTime.occurredAt}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant={theme.mode}
            onChange={(_event, date) => dateTime.onTimeChange(date)}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    width: 80,
    fontWeight: fontWeight.heavy,
  },
  pickerWrap: {
    marginTop: 10,
  },
  embeddedWrap: {
    marginTop: 8,
    marginBottom: 8,
  },
})
