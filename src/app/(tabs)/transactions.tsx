import { getActiveAccounts } from '@/domain/account'
import type { Transaction } from '@/domain/transaction'
import { getThisMonthExpenseTotal, getTransactions, TransactionType } from '@/domain/transaction'
import { useHoHTheme } from '@/providers'
import { PALETTE } from '@/theme'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

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
  return `$${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}`
}

function safeDate(tx: Transaction): Date {
  const d = tx.occurredAt instanceof Date ? tx.occurredAt : new Date((tx as any).occurredAt)
  return Number.isNaN(d.getTime()) ? new Date(0) : d
}

function isExpense(tx: Transaction): boolean {
  const t = (tx as any).type
  return typeof t === 'string' ? t === 'expense' : true
}

function displayItem(tx: Transaction): string {
  return (tx as any).item || (tx as any).note || (tx as any).memo || 'Untitled'
}

function buildMonthSections(all: Transaction[], query: string): MonthSection[] {
  const q = query.trim().toLowerCase()

  const filtered = q
    ? all.filter(tx => {
        const item = displayItem(tx).toLowerCase()
        const note = String(((tx as any).note || (tx as any).memo || '')).toLowerCase()
        const merchant = String(((tx as any).merchant || '')).toLowerCase()
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
        title: monthTitle(d),
        total: 0,
        data: []
      } satisfies MonthSection)

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

  // debounced search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 150)
    return () => clearTimeout(t)
  }, [query])

  // accounts / id->name map (stable)
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

  const stripColorByType = useCallback(
    (t: TransactionType) => {
      if (t === 'income') return theme.semantic.success ?? PALETTE.green[600]
      if (t === 'transfer') return theme.semantic.info ?? PALETTE.blue[600]
      return theme.semantic.danger ?? PALETTE.red[500]
    },
    [theme.semantic]
  )

  const load = useCallback(() => {
    let alive = true

    try {
      const txsP = Promise.resolve(getTransactions(200) as any)
      const totalP = Promise.resolve(getThisMonthExpenseTotal() as any)

      Promise.all([txsP, totalP])
        .then(([txs, total]) => {
          if (!alive) return
          setItems(Array.isArray(txs) ? txs : [])
          setThisMonthTotal(Number(total ?? 0))
        })
        .catch(e => {
          console.error(e)
          if (!alive) return
          setItems([])
          setThisMonthTotal(0)
        })
    } catch (e) {
      console.error(e)
      if (!alive) return
      setItems([])
      setThisMonthTotal(0)
    }

    return () => {
      alive = false
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      const cleanup = load()
      return () => {
        if (typeof cleanup === 'function') cleanup()
      }
    }, [load])
  )

  const sections = useMemo(() => buildMonthSections(items, debouncedQuery), [items, debouncedQuery])

  return (
    <View style={[styles.container, { backgroundColor: theme.semantic.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.semantic.text }]}>TRANSACTIONS</Text>
      </View>

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

      <View style={[styles.summary, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}>
        <Text style={[styles.summaryLabel, { color: theme.semantic.textSecondary }]}>This month expense</Text>
        <Text style={[styles.summaryValue, { color: theme.semantic.text }]}>{formatCurrency(thisMonthTotal)}</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={it => (it as any).id}
        stickySectionHeadersEnabled
        contentContainerStyle={sections.length ? undefined : styles.emptyContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderSectionHeader={({ section }) => (
          <View style={[styles.monthBar, { backgroundColor: theme.semantic.background, borderColor: theme.semantic.border }]}>
            <Text style={[styles.monthText, { color: theme.semantic.text }]}>{section.title}</Text>
            <Text style={[styles.monthTotal, { color: theme.semantic.textSecondary }]}>{formatCurrency(section.total)}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const tx = item as any

          const amt = Number(tx?.money?.amount ?? 0)

          const t = (String(tx?.type ?? 'expense') as TransactionType) || 'expense'
          const itemText = String(tx?.item ?? tx?.note ?? tx?.memo ?? 'Untitled')

          const merchantRaw = String(tx?.merchant ?? '').trim()
          const merchantText = merchantRaw.length ? merchantRaw : null

          const d = safeDate(item)
          const dayText = Number.isFinite(d.getTime()) ? String(d.getDate()) : '--'
          const timeText = Number.isFinite(d.getTime())
            ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
            : ''

          const accountId = String(tx?.accountId ?? '')
          const accountName = accountNameById.get(accountId) ?? 'Account'

          const stripBg = stripBgByType(t)
          const stripColor = stripColorByType(t)

          // rule: only income amount is slightly green, expense/transfer keep default text
          const amountColor = t === 'income' ? (theme.semantic.success ?? theme.semantic.text) : theme.semantic.text

          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                // Phase 2: push detail screen
              }}
              style={[styles.rowCard, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
              accessibilityLabel={`Transaction ${itemText} ${formatCurrency(amt)}`}
            >
              <View style={[styles.leftStripBg, { backgroundColor: stripBg }]} pointerEvents="none" />
              {/* <View style={[styles.leftStrip, { backgroundColor: stripColor }]} pointerEvents="none" /> */}

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

                {/* second line: merchant (left) + account (right) */}
                <View style={styles.rowSecond}>
                  <Text
                    style={[styles.merchantTextNew, { color: theme.semantic.textSecondary }]}
                    numberOfLines={1}
                  >
                    {merchantText ?? ''}
                  </Text>

                  <Text
                    style={[styles.accountTextNew, { color: theme.semantic.textSecondary }]}
                    numberOfLines={1}
                  >
                    {accountName}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )
        }}
        ListEmptyComponent={<Text style={{ color: theme.semantic.textSecondary }}>No transactions yet</Text>}
      />
    </View>
  )
}

const DAY_COL_W = 28
const DAY_GAP = 8
const LEFT_ALIGN = DAY_COL_W + DAY_GAP

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

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

  strip: {
    width: 4,
    height: '100%',
    borderRadius: 999
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
    marginLeft: 28 + 8, //
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

})
