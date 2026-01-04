import type { Transaction } from '@/domain/transaction/transaction'
import { getThisMonthExpenseTotal, listTransactions } from '@/domain/transaction/transaction.usecase'
import { useHoHTheme } from '@/providers'
import { useFocusEffect } from '@react-navigation/native'
import { router } from 'expo-router'
import { useCallback, useState } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function TransactionsScreen() {
  const theme = useHoHTheme()
  const [items, setItems] = useState<Transaction[]>([])
  const [thisMonthTotal, setThisMonthTotal] = useState(0)

  const load = useCallback(async () => {
    try {
      const [txs, total] = await Promise.all([
        listTransactions(200),
        getThisMonthExpenseTotal()
      ])
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

  return (
    <View style={[styles.container, { backgroundColor: theme.semantic.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.semantic.text }]}>
          Transactions
        </Text>

        <TouchableOpacity onPress={() => router.push('/add')} style={[styles.addBtn, { borderColor: theme.semantic.border }]}>
          <Text style={{ color: theme.semantic.primary }}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.summary, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}>
        <Text style={{ color: theme.semantic.textSecondary }}>
          This month expense
        </Text>
        <Text style={{ color: theme.semantic.text, fontSize: 18 }}>
          ${thisMonthTotal.toFixed(2)}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}>
            <Text style={{ color: theme.semantic.text }}>${item.money.amount}</Text>
            {item.memo ? (
              <Text style={{ color: theme.semantic.textSecondary }}>{item.memo}</Text>
            ) : null}
            <Text style={{ color: theme.semantic.textSecondary, marginTop: 6 }}>
              {item.occurredAt.toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: theme.semantic.textSecondary }}>
            No transactions yet
          </Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: 'bold' },
  addBtn: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 12 },
  summary: { padding: 12, borderWidth: 1, borderRadius: 12, marginBottom: 12 },
  card: { padding: 12, borderWidth: 1, borderRadius: 12 },
  separator: { height: 10 }
})
