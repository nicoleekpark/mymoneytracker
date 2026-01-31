import { useHoHTheme } from '@/providers'
import { Divider } from '@/shared/components'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'

import type { DateTimeState } from '../hooks/useDateTime'

type Props = {
  dateTime: DateTimeState
}

export function DateTimeSection({ dateTime }: Props) {
  const theme = useHoHTheme()

  return (
    <View style={[styles.card, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}>
      <Pressable onPress={dateTime.openDatePicker} style={styles.row}>
        <Text style={[styles.rowLabel, { color: theme.semantic.textSecondary }]}>Date</Text>
        <Text style={{ color: theme.semantic.text, fontWeight: '800' }}>{dateTime.dateDisplay}</Text>
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
        <Text style={{ color: theme.semantic.text, fontWeight: '800' }}>{dateTime.timeDisplay}</Text>
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
    borderRadius: 18,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    width: 80,
    fontWeight: '800',
  },
  pickerWrap: {
    marginTop: 10,
  },
})
