import { getActiveAccounts } from '@/domain/account'
import type { Transaction } from '@/domain/transaction'
import { isExpense, safeDate, TransactionType } from '@/domain/transaction'
import { useHoHTheme } from '@/providers'
import { formatDayHeader, formatMonthSectionTitle, monthKey, ymd } from '@/shared/format/date'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect } from '@react-navigation/native'
import { useLocalSearchParams } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useTransactionsData } from './hooks/useTransactionsData'
import {
  LayoutAnimation,
  Platform,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native'

import { formatCurrency } from '@/shared/format/currency'
import { Screen } from '@/shared/layout/Screen'

type MonthSection = {
  key: string
  title: string
  total: number
  data: Transaction[]
}

function displayItem(tx: Transaction): string {
  return tx.item || tx.note || 'Untitled'
}

function buildMonthSections(all: Transaction[], query: string): MonthSection[] {
  const q = query.trim().toLowerCase()

  const filtered = q
    ? all.filter((tx) => {
        const item = displayItem(tx).toLowerCase()
        const note = String(tx.note ?? '').toLowerCase()
        const merchant = String(tx.merchant ?? '').toLowerCase()
        return item.includes(q) || note.includes(q) || merchant.includes(q)
      })
    : all

  const sorted = [...filtered].sort((a, b) => safeDate(b).getTime() - safeDate(a).getTime())
  const map = new Map<string, MonthSection>()

  for (const tx of sorted) {
    const d = safeDate(tx)
    const key = monthKey(d)
    const section =
      map.get(key) ??
      ({
        key,
        title: formatMonthSectionTitle(d),
        total: 0,
        data: []
      } satisfies MonthSection)

    const amt = tx.money.amount
    if (Number.isFinite(amt) && isExpense(tx)) section.total += amt

    section.data.push(tx)
    map.set(key, section)
  }

  return [...map.values()].sort((a, b) => (a.key < b.key ? 1 : -1))
}

function findScrollTarget(sections: MonthSection[], focusDate?: string) {
  if (!focusDate) return null
  if (focusDate.length < 10) return null

  const focusMonth = focusDate.slice(0, 7)
  const sectionIndex = sections.findIndex((s) => s.key === focusMonth)
  if (sectionIndex < 0) return null

  const section = sections[sectionIndex]
  const itemIndex = section.data.findIndex((tx) => ymd(safeDate(tx)) === focusDate)

  if (itemIndex < 0) return { sectionIndex, itemIndex: 0, fallbackToHeader: true as const }
  return { sectionIndex, itemIndex, fallbackToHeader: false as const }
}

export default function TransactionsScreen() {
  const theme = useHoHTheme()

  const params = useLocalSearchParams<{ focusDate?: string }>()
  const focusDate = typeof params.focusDate === 'string' ? params.focusDate : undefined

  const listRef = useRef<SectionList<Transaction, MonthSection>>(null)
  const didAutoScrollRef = useRef(false)

  const { data, refetch } = useTransactionsData()
  const { items, thisMonthExpense, thisMonthIncome, thisMonthNet } = data

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const [highlightDate, setHighlightDate] = useState<string | null>(null)
  const pendingScrollRef = useRef<{ sectionIndex: number; itemIndex: number } | null>(null)

  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true)
    }
  }, [])

  // focusDate로 들어오면 query 자동 초기화
  useEffect(() => {
    if (!focusDate) return
    if (query.length === 0 && debouncedQuery.length === 0) return

    LayoutAnimation.easeInEaseOut()
    setQuery('')
    setDebouncedQuery('')
    didAutoScrollRef.current = false
  }, [focusDate])

  // search debounce (focusDate로 들어온 경우 debouncedQuery를 즉시 ''로 세팅해두므로 정상 동작)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 150)
    return () => clearTimeout(t)
  }, [query])

  // highlight 2초
  useEffect(() => {
    if (!focusDate) return

    LayoutAnimation.easeInEaseOut()
    setHighlightDate(focusDate)

    const t = setTimeout(() => {
      LayoutAnimation.easeInEaseOut()
      setHighlightDate(null)
    }, 2000)

    return () => clearTimeout(t)
  }, [focusDate])

  const accounts = useMemo(() => getActiveAccounts(), [])
  const accountNameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const a of accounts) m.set(a.id, a.name)
    return m
  }, [accounts])

  const stripBgByType = useCallback(
    (t: TransactionType) => {
      if (t === 'income') return theme.semantic.successSoft
      if (t === 'transfer') return theme.semantic.infoSoft
      return theme.semantic.dangerSoft
    },
    [theme.semantic]
  )

  useFocusEffect(
    useCallback(() => {
      refetch()
      didAutoScrollRef.current = false
    }, [refetch])
  )

  const sections = useMemo(() => buildMonthSections(items, debouncedQuery), [items, debouncedQuery])

  // focusDate면 첫 매칭 row로 자동 scrollToLocation
  useEffect(() => {
    if (!focusDate) return
    if (!sections.length) return
    if (didAutoScrollRef.current) return

    const target = findScrollTarget(sections, focusDate)
    if (!target) return

    setTimeout(() => {
      try {
        pendingScrollRef.current = { sectionIndex: target.sectionIndex, itemIndex: target.itemIndex }
        listRef.current?.scrollToLocation({
          sectionIndex: target.sectionIndex,
          itemIndex: target.itemIndex,
          animated: true,
          viewPosition: 0
        })
        didAutoScrollRef.current = true
      } catch (e) {
        console.error(e)
      }
    }, 0)
  }, [focusDate, sections])

  return (
    <Screen topPadding>
      <View style={[styles.searchWrap, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}>
        <FontAwesome name="search" size={14} color={theme.semantic.textSecondary as any} />
        <TextInput
          value={query}
          onChangeText={(t) => {
            didAutoScrollRef.current = false
            setQuery(t)
          }}
          placeholder="Search transactions"
          placeholderTextColor={theme.semantic.textSecondary as any}
          style={[styles.searchInput, { color: theme.semantic.text }]}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          accessibilityLabel="Search transactions"
        />
        <TouchableOpacity
          onPress={() => {
            // Phase 2: open filters
          }}
          style={styles.filterBtn}
          accessibilityLabel="Open filters"
        >
          <FontAwesome name="sliders" size={16} color={theme.semantic.textSecondary as any} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCell}>
          <View style={[styles.summaryPill, { backgroundColor: theme.semantic.successSoft }]}>
            <Text style={[styles.summaryPillText, { color: theme.semantic.success }]}>INFLOW</Text>
          </View>
          <Text style={[styles.summaryValueSm, { color: theme.semantic.success }]}>
            {formatCurrency(thisMonthIncome)}
          </Text>
        </View>

        <View style={styles.summaryCell}>
          <View style={[styles.summaryPill, { backgroundColor: theme.semantic.dangerSoft }]}>
            <Text style={[styles.summaryPillText, { color: theme.semantic.danger }]}>OUTFLOW</Text>
          </View>
          <Text style={[styles.summaryValueSm, { color: theme.semantic.danger }]}>
            {formatCurrency(thisMonthExpense)}
          </Text>
        </View>

        <View style={styles.summaryCell}>
          <View
            style={[
              styles.summaryPill,
              { backgroundColor: thisMonthNet >= 0 ? theme.semantic.success : theme.semantic.danger }
            ]}
          >
            <Text style={[styles.summaryPillText, { color: '#ffffff' }]}>NET</Text>
          </View>
          <Text
            style={[
              styles.summaryValueSm,
              { color: thisMonthNet >= 0 ? theme.semantic.success : theme.semantic.danger }
            ]}
          >
            {formatCurrency(thisMonthNet)}
          </Text>
        </View>
      </View>

      <SectionList
        ref={listRef}
        style={{ flex: 1 }}
        sections={sections}
        keyExtractor={(it) => it.id}
        stickySectionHeadersEnabled
        contentContainerStyle={sections.length ? undefined : styles.emptyContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderSectionHeader={({ section }) => (
          <View style={[styles.monthBar, { backgroundColor: theme.semantic.background, borderColor: theme.semantic.border }]}>
            <Text style={[styles.monthText, { color: theme.semantic.text }]}>{section.title}</Text>
            <Text style={[styles.monthTotal, { color: theme.semantic.textSecondary }]}>{formatCurrency(section.total)}</Text>
          </View>
        )}
        onScrollToIndexFailed={() => {
          const p = pendingScrollRef.current
          if (!p) return

          setTimeout(() => {
            try {
              listRef.current?.scrollToLocation({
                sectionIndex: p.sectionIndex,
                itemIndex: p.itemIndex,
                animated: true,
                viewPosition: 0
              })
            } catch (e) {
              console.error(e)
            }
          }, 120)
        }}

        renderItem={({ item, index, section }) => {
          const amt = item.money.amount

          const t = item.type
          const itemText = item.item || item.note || 'Untitled'

          const merchantRaw = (item.merchant ?? '').trim()
          const merchantText = merchantRaw.length ? merchantRaw : null

          const d = safeDate(item)
          const dayText = Number.isFinite(d.getTime()) ? String(d.getDate()) : '--'
          const rowYmd = Number.isFinite(d.getTime()) ? ymd(d) : null

          const accountId = item.accountId ?? ''
          const accountName = accountNameById.get(accountId) || 'Account'

          const stripBg = stripBgByType(t)

          const amountColor = t === 'income' ? (theme.semantic.success ?? theme.semantic.text) : theme.semantic.text

          // 같은 month section 안에서 날짜가 바뀌는 지점에 day header 추가
          const prev = index > 0 ? section.data[index - 1] : null
          const prevDate = prev ? safeDate(prev) : null
          const showDayHeader =
            index === 0 ||
            !prevDate ||
            ymd(prevDate) !== (rowYmd ?? '')

          const isHighlighted = rowYmd && rowYmd === highlightDate

          return (
            <View>
              {showDayHeader && rowYmd ? (
                <View style={{ paddingTop: 12, paddingBottom: 6 }}>
                  <Text style={{ color: theme.semantic.textSecondary, fontSize: 12, fontWeight: '800' }}>
                    {formatDayHeader(d)}
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  // Phase 2: push detail screen
                }}
                style={[
                  styles.rowCard,
                  {
                    borderColor: isHighlighted ? theme.semantic.primary : theme.semantic.border,
                    backgroundColor: isHighlighted
                      ? (theme.semantic.primarySoft ?? theme.semantic.surfaceAlt)
                      : theme.semantic.surface
                  }
                ]}
                accessibilityLabel={`Transaction ${itemText} ${formatCurrency(amt)}`}
              >
                <View style={[styles.leftStripBg, { backgroundColor: stripBg }]} pointerEvents="none" />

                <View style={styles.rowBody}>
                  <View style={styles.rowTop}>
                    <Text style={[styles.dayText, { color: theme.semantic.textSecondary }]}>{dayText}</Text>

                    <Text style={[styles.itemTextNew, { color: theme.semantic.text }]} numberOfLines={1}>
                      {itemText}
                    </Text>

                    <Text style={[styles.amountTextNew, { color: amountColor }]} numberOfLines={1}>
                      {formatCurrency(amt)}
                    </Text>
                  </View>

                  <View style={styles.rowSecond}>
                    <Text style={[styles.merchantTextNew, { color: theme.semantic.textSecondary }]} numberOfLines={1}>
                      {merchantText ?? ''}
                    </Text>

                    <Text style={[styles.accountTextNew, { color: theme.semantic.textSecondary }]} numberOfLines={1}>
                      {accountName}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )
        }}
        ListEmptyComponent={<Text style={{ color: theme.semantic.textSecondary }}>No transactions yet</Text>}
      />
    </Screen>
  )
}

const DAY_COL_W = 28
const DAY_GAP = 8

const styles = StyleSheet.create({
  header: { justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 18, letterSpacing: 0.6, fontWeight: '700' },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 12
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  filterBtn: { paddingLeft: 6, paddingVertical: 2 },

  monthBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 8,
    borderBottomWidth: 1
  },
  monthText: { fontSize: 12, letterSpacing: 0.8, fontWeight: '700' },
  monthTotal: { fontSize: 12 },

  separator: { height: 10 },
  emptyContainer: { paddingTop: 12 },

  rowCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 50
  },

  leftStripBg: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 10
  },

  rowBody: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingLeft: 12 + 10
  },

  rowTop: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },

  dayText: {
    width: DAY_COL_W,
    fontSize: 18,
    fontWeight: '900',
    marginRight: DAY_GAP
  },

  itemTextNew: {
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
    paddingRight: 10
  },

  amountTextNew: {
    fontSize: 14,
    fontWeight: '900'
  },

  merchantTextNew: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700'
  },

  rowSecond: {
    marginTop: 4,
    marginLeft: DAY_COL_W + DAY_GAP,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },

  accountTextNew: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right'
  },

  summaryRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
    paddingVertical: 10
  },

  summaryCell: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center'
  },

  summaryPill: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },

  summaryPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    justifyContent: 'center'
  },

  summaryValueSm: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '900'
  }
})
