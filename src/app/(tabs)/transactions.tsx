import type { Transaction } from '@/domain/transaction/transaction'
import { getThisMonthExpenseTotal, listTransactions } from '@/domain/transaction/transaction.usecase'
import { useHoHTheme } from '@/providers'
import { formatTransactionRowDate } from '@/ui/format/date'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

type MonthSection = {
  key: string
  title: string
  total: number
  data: Transaction[]
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`
}

function monthTitle(d: Date) {
  const month = d.toLocaleString(undefined, { month: 'long' }).toUpperCase()
  return `${month} ${d.getFullYear()}`
}

function formatCurrency(amount: number) {
  // Keep it simple and stable across RN environments
  return `$${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}`
}

function safeDate(tx: Transaction): Date {
  const d = tx.occurredAt instanceof Date ? tx.occurredAt : new Date(tx.occurredAt as any)
  return Number.isNaN(d.getTime()) ? new Date(0) : d
}

function isExpense(tx: Transaction): boolean {
  const t = (tx as any).type
  if (typeof t === 'string') return t === 'expense'
  return true
}

function displayItem(tx: Transaction): string {
  return (
    (tx as any).item ||
    (tx as any).note ||
    (tx as any).memo ||
    'Untitled'
  )
}

function categoryBadgeText(tx: Transaction): string {
  const cat = (tx as any).category
  const label = (cat?.subCategoryId || cat?.categoryId || cat?.type) as string | undefined
  if (!label || typeof label !== 'string') return '•'
  return label.trim().slice(0, 1).toUpperCase()
}

function formatRowDate(d: Date): string {
  // "JAN 9 10:12 AM"
  // Uses user's locale but forces month short in English-like format if available
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const day = d.getDate()

  let hours = d.getHours()
  const minutes = pad2(d.getMinutes())
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12

  return `${month} ${day} ${hours}:${minutes} ${ampm}`
}

function buildMonthSections(all: Transaction[], query: string): MonthSection[] {
  const q = query.trim().toLowerCase()

  const filtered = q
    ? all.filter((tx) => {
        const item = displayItem(tx).toLowerCase()
        const note = ((tx as any).note || (tx as any).memo || '').toString().toLowerCase()
        return item.includes(q) || note.includes(q)
      })
    : all

  const sorted = [...filtered].sort((a, b) => safeDate(b).getTime() - safeDate(a).getTime())

  const map = new Map<string, MonthSection>()

  for (const tx of sorted) {
    const d = safeDate(tx)
    const key = monthKey(d)
    const section = map.get(key) ?? {
      key,
      title: monthTitle(d),
      total: 0,
      data: []
    }

    const amt = Number((tx as any).money?.amount ?? 0)
    if (Number.isFinite(amt) && isExpense(tx)) section.total += amt

    section.data.push(tx)
    map.set(key, section)
  }

  return [...map.values()].sort((a, b) => (a.key < b.key ? 1 : -1))
}

export default function TransactionsScreen() {
  const theme = useHoHTheme()
  const [items, setItems] = useState<Transaction[]>([])
  const [thisMonthTotal, setThisMonthTotal] = useState(0)

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 150)
    return () => clearTimeout(t)
  }, [query])

  const load = useCallback(async () => {
    try {
      const [txs, total] = await Promise.all([listTransactions(200), getThisMonthExpenseTotal()])
      setItems(txs)
      setThisMonthTotal(total)
    } catch (e) {
      console.error(e)
      setItems([])
      setThisMonthTotal(0)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  )

  const sections = useMemo(() => buildMonthSections(items, debouncedQuery), [items, debouncedQuery])

  return (
    <View style={[styles.container, { backgroundColor: theme.semantic.background }]}>
      {/* Title row */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.semantic.text }]}>TRANSACTIONS</Text>
      </View>

      {/* Search bar */}
      <View style={[styles.searchWrap, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}>
        <FontAwesome name="search" size={14} color={theme.semantic.textSecondary as any} />
        <TextInput
          value={query}
          onChangeText={setQuery}
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

      {/* Summary */}
      <View style={[styles.summary, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}>
        <Text style={[styles.summaryLabel, { color: theme.semantic.textSecondary }]}>
          This month expense
        </Text>
        <Text style={[styles.summaryValue, { color: theme.semantic.text }]}>
          {formatCurrency(thisMonthTotal)}
        </Text>
      </View>

      {/* Month-grouped list with sticky month header */}
      <SectionList
        sections={sections}
        keyExtractor={(it) => it.id}
        stickySectionHeadersEnabled
        contentContainerStyle={sections.length ? undefined : styles.emptyContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderSectionHeader={({ section }) => (
          <View
            style={[
              styles.monthBar,
              { backgroundColor: theme.semantic.background, borderColor: theme.semantic.border }
            ]}
          >
            <Text style={[styles.monthText, { color: theme.semantic.text }]}>{section.title}</Text>
            <Text style={[styles.monthTotal, { color: theme.semantic.textSecondary }]}>
              {formatCurrency(section.total)}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const amt = Number((item as any).money?.amount ?? 0)
          const d = safeDate(item)
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                // Phase 2: push detail screen
                // router.push(`/transaction/${item.id}`)
              }}
              style={[
                styles.row,
                { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }
              ]}
              accessibilityLabel={`Transaction ${displayItem(item)} ${formatCurrency(amt)}`}
            >
              <View style={[styles.badge, { borderColor: theme.semantic.border }]}>
                <Text style={{ color: theme.semantic.textSecondary, fontSize: 12 }}>
                  {categoryBadgeText(item)}
                </Text>
              </View>

              <View style={styles.rowMain}>
                <View style={styles.rowTop}>
                  <Text
                    style={[styles.itemText, { color: theme.semantic.text }]}
                    numberOfLines={1}
                  >
                    {displayItem(item)}
                  </Text>
                  <Text style={[styles.amountText, { color: theme.semantic.text }]}>
                    {formatCurrency(amt)}
                  </Text>
                </View>

                <Text style={[styles.dateText, { color: theme.semantic.textSecondary }]}>
                  {formatTransactionRowDate(safeDate(item))}
                </Text>

              </View>
            </TouchableOpacity>
          )
        }}
        ListEmptyComponent={
          <Text style={{ color: theme.semantic.textSecondary }}>No transactions yet</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
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

  summary: { padding: 12, borderWidth: 1, borderRadius: 12, marginBottom: 12 },
  summaryLabel: { fontSize: 12, fontWeight: '600' },
  summaryValue: { fontSize: 22, fontWeight: '900', marginTop: 4 },

  monthBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 8,
    borderBottomWidth: 1
  },
  monthText: { fontSize: 12, letterSpacing: 0.8, fontWeight: '700' },
  monthTotal: { fontSize: 12 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  rowMain: { flex: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  itemText: { flex: 1, fontSize: 14, fontWeight: '600', paddingRight: 10 },
  amountText: { fontSize: 14, fontWeight: '700' },
  dateText: { marginTop: 6, fontSize: 12 },

  separator: { height: 10 },
  emptyContainer: { paddingTop: 12 }
})
