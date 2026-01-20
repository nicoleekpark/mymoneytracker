import React, { useMemo } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import type { Period, Scope } from '../dashboard.model'
import type { DashboardStyles } from '../dashboard.styles'

type YearMonth = { year: number; month: number }

function getMaxYearMonth(now = new Date()): YearMonth {
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

function monthLabel(m: number): string {
  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return labels[m - 1] ?? `${m}`
}

export function DashboardPeriodPicker(props: {
  visible: boolean
  scope: Scope
  period: Period
  onClose: () => void
  onSelect: (p: Period) => void
  styles: DashboardStyles
}) {
  const { visible, scope, onClose, onSelect } = props
  const maxYM = getMaxYearMonth()

  const yearsDesc = useMemo(() => {
    const maxY = maxYM.year
    const minY = maxY - 10
    const out: number[] = []
    for (let y = maxY; y >= minY; y--) out.push(y)
    return out
  }, [maxYM.year])

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), [])

  if (!visible) return null

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }}
        onPress={onClose}
      />

      <View style={{ backgroundColor: 'white', padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '700', fontSize: 16 }}>Select period</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close picker">
            <Text style={{ fontWeight: '700' }}>Close</Text>
          </Pressable>
        </View>

        <View style={{ height: 10 }} />

        {scope === 'all' ? (
          <Text>All time has no picker</Text>
        ) : (
          <ScrollView style={{ maxHeight: 420 }}>
            {scope === 'year' ? (
              yearsDesc.map((y) => (
                <Pressable
                  key={y}
                  onPress={() => onSelect({ year: y })}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(0,0,0,0.08)',
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Select year ${y}`}
                >
                  <Text style={{ fontSize: 15 }}>{y}</Text>
                </Pressable>
              ))
            ) : (
              yearsDesc.map((y) => {
                const isMaxYear = y === maxYM.year
                const allowedMonths = isMaxYear ? months.filter((m) => m <= maxYM.month) : months

                // 미래 연도는 yearsDesc에 없어서 여기서는 따로 처리 필요 없음
                return (
                  <View key={y} style={{ paddingBottom: 14 }}>
                    <Text style={{ fontWeight: '700', paddingVertical: 8 }}>{y}</Text>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {allowedMonths.map((m) => (
                        <Pressable
                          key={`${y}-${m}`}
                          onPress={() => onSelect({ year: y, month: m })}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                            borderWidth: 1,
                            borderRadius: 10,
                            borderColor: 'rgba(0,0,0,0.15)',
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Select ${monthLabel(m)} ${y}`}
                        >
                          <Text>{monthLabel(m)}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )
              })
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  )
}
