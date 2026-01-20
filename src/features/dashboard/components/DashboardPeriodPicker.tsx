import React, { useMemo } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import type { Period, Scope } from '../dashboard.model'
import { getMaxYearMonth } from '../dashboard.model'
import type { DashboardStyles } from '../dashboard.styles'

export function DashboardPeriodPicker(props: {
  visible: boolean
  scope: Scope
  onClose: () => void
  onSelect: (p: Period) => void
  styles: DashboardStyles
}) {
  const { visible, scope, onClose, onSelect } = props
  const max = getMaxYearMonth()

  const years = useMemo(() => {
    const out: number[] = []
    for (let y = max.year; y >= max.year - 10; y--) out.push(y)
    return out
  }, [max.year])

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), [])

  if (!visible) return null

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={onClose} />
      <View style={{ backgroundColor: 'white', padding: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '700' }}>Select period</Text>
          <Pressable onPress={onClose}>
            <Text style={{ fontWeight: '700' }}>Close</Text>
          </Pressable>
        </View>

        <View style={{ height: 10 }} />

        {scope === 'all' ? (
          <Text>All time has no picker</Text>
        ) : (
          <ScrollView style={{ maxHeight: 420 }}>
            {scope === 'year'
              ? years.map((y) => (
                  <Pressable
                    key={y}
                    onPress={() => onSelect({ year: y })}
                    style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.08)' }}
                  >
                    <Text style={{ fontSize: 15 }}>{y}</Text>
                  </Pressable>
                ))
              : years.map((y) => {
                  const allowedMonths = y === max.year ? months.filter((m) => m <= max.month) : months
                  return (
                    <View key={y} style={{ paddingBottom: 14 }}>
                      <Text style={{ fontWeight: '700', paddingVertical: 8 }}>{y}</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {allowedMonths.map((m) => (
                          <Pressable
                            key={`${y}-${m}`}
                            onPress={() => onSelect({ year: y, month: m })}
                            style={{ paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderRadius: 10, borderColor: 'rgba(0,0,0,0.15)' }}
                          >
                            <Text>{String(m).padStart(2, '0')}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )
                })}
          </ScrollView>
        )}
      </View>
    </Modal>
  )
}
