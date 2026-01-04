import { addTransaction } from '@/domain/transaction/transaction.usecase'
import { useHoHTheme } from '@/providers'
import { useAppStore } from '@/store/app.store'
import { router } from 'expo-router'
import { useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function AddScreen() {
  const theme = useHoHTheme()
  const categoryIndex = useAppStore(s => s.categoryIndex)

  const [amountText, setAmountText] = useState('')
  const [memo, setMemo] = useState('')

  const onSave = async () => {
    const amount = Number(amountText)
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Enter a number greater than 0')
      return
    }

    try {
      await addTransaction(categoryIndex, { amount, memo: memo.trim() || undefined })
      router.back()
    } catch (e: any) {
      console.error(e)
      Alert.alert('Save failed', e?.message ?? 'Unknown error')
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.semantic.background }]}>
      <Text style={[styles.title, { color: theme.semantic.text }]}>
        Add Transaction
      </Text>

      <TextInput
        value={amountText}
        onChangeText={setAmountText}
        placeholder="Amount"
        placeholderTextColor={theme.semantic.textSecondary}
        keyboardType="decimal-pad"
        style={[
          styles.input,
          { borderColor: theme.semantic.border, color: theme.semantic.text, backgroundColor: theme.semantic.surface }
        ]}
      />

      <TextInput
        value={memo}
        onChangeText={setMemo}
        placeholder="Memo (optional)"
        placeholderTextColor={theme.semantic.textSecondary}
        style={[
          styles.input,
          { borderColor: theme.semantic.border, color: theme.semantic.text, backgroundColor: theme.semantic.surface }
        ]}
      />

      <TouchableOpacity onPress={onSave} style={[styles.button, { backgroundColor: theme.semantic.primarySoft }]}>
        <Text style={{ color: theme.semantic.primaryStrong }}>Save</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
  button: { padding: 14, borderRadius: 12, alignItems: 'center' }
})
