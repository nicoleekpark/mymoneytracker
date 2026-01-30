import { CATEGORIES_INDEX } from '@/config'
import { resolveAccountIdByKey } from '@/domain/account'
import type { UUID } from '@/domain/common/uuid'
import type { TransactionType } from '@/domain/transaction'
import { addTransaction } from '@/domain/transaction/transaction.usecase'
import { useHoHTheme } from '@/providers'
import { Screen } from '@/shared/layout/Screen'
import { router } from 'expo-router'
import React, { useMemo, useRef, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  AccountSelectionModal,
  AmountKeypadModal,
  CategorySelectionModal,
  DateTimeSection,
  SubCategorySelectionModal,
} from './components'
import { useAccountPicker, useAmountKeypad, useCategoryPicker, useDateTime } from './hooks'

// Receipt picker (optional dependency)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ImagePicker: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ImagePicker = require('expo-image-picker')
} catch {
  ImagePicker = null
}

export default function AddTransactionScreen() {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()

  const itemInputRef = useRef<TextInput>(null)
  const noteInputRef = useRef<TextInput>(null)
  const merchantInputRef = useRef<TextInput>(null)
  const scrollRef = useRef<ScrollView>(null)
  const noteYRef = useRef<number>(0)

  // Transaction type
  const [type, setType] = useState<TransactionType>('expense')

  // Form fields
  const [item, setItem] = useState('')
  const [merchant, setMerchant] = useState('')
  const [note, setNote] = useState('')
  const [receiptUri, setReceiptUri] = useState<string | null>(null)

  // Hooks for complex state
  const amount = useAmountKeypad()
  const account = useAccountPicker()
  const category = useCategoryPicker(type)
  const dateTime = useDateTime()

  // Validation
  const canSave = useMemo(() => {
    if (type === 'transfer') return false
    const hasAmount = Number.isFinite(amount.amountCents) && amount.amountCents > 0
    const hasItem = item.trim().length > 0
    return hasAmount && hasItem
  }, [type, amount.amountCents, item])

  const scrollToNote = () => {
    const topPad = 14
    const y = Math.max(0, noteYRef.current - topPad)
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y, animated: true })
    })
  }

  const onCancel = () => router.back()

  const onSave = async () => {
    if (type === 'transfer') {
      Alert.alert('Transfer not ready', 'Transfer will be enabled after accounts are added')
      return
    }

    const cleanedItem = item.trim()
    const cleanedNote = note.trim()

    if (!cleanedItem) {
      Alert.alert('Item required', 'Please enter an item')
      return
    }

    if (!Number.isFinite(amount.amountCents) || amount.amountCents <= 0) {
      Alert.alert('Invalid amount', 'Please enter an amount')
      return
    }

    if (!Number.isFinite(amount.amountDollars) || amount.amountDollars <= 0) {
      Alert.alert('Invalid amount', 'Please enter an amount')
      return
    }

    if (!category.categoryRef) {
      Alert.alert('Category required', 'Please select a category')
      return
    }

    const typeMap = CATEGORIES_INDEX[category.categoryRef.type]
    const subKeys = typeMap?.[category.categoryRef.categoryKey]
    const ok = !!subKeys && (!category.categoryRef.subCategoryKey || subKeys.includes(category.categoryRef.subCategoryKey))

    if (!ok) {
      Alert.alert('Invalid category', 'Please re-select category')
      return
    }

    let accountId: UUID
    try {
      accountId = resolveAccountIdByKey(account.accountKey)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Please select a payment method'
      Alert.alert('Account missing', message)
      return
    }

    try {
      await addTransaction(CATEGORIES_INDEX, {
        type,
        item: cleanedItem,
        amount: amount.amountDollars,
        category: category.categoryRef,
        accountId,
        occurredAt: dateTime.occurredAt,
        merchant: merchant.trim() || undefined,
        note: cleanedNote || undefined,
      })

      router.replace({ pathname: '/(tabs)/transactions' } as Parameters<typeof router.replace>[0])
    } catch (e: unknown) {
      console.error(e)
      const message = e instanceof Error ? e.message : 'Unknown error'
      Alert.alert('Save failed', message)
    }
  }

  // Receipt handlers
  const onPickReceipt = async () => {
    if (!ImagePicker) {
      Alert.alert('Not set up', 'Install expo-image-picker to enable receipt import')
      return
    }
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (res?.granted !== true) {
      Alert.alert('Permission needed', 'Please allow photo library access')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    })
    if (!result.canceled && result.assets?.[0]?.uri) {
      setReceiptUri(result.assets[0].uri)
    }
  }

  const onTakeReceipt = async () => {
    if (!ImagePicker) {
      Alert.alert('Not set up', 'Install expo-image-picker to enable camera')
      return
    }
    const res = await ImagePicker.requestCameraPermissionsAsync()
    if (res?.granted !== true) {
      Alert.alert('Permission needed', 'Please allow camera access')
      return
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 })
    if (!result.canceled && result.assets?.[0]?.uri) {
      setReceiptUri(result.assets[0].uri)
    }
  }

  return (
    <Screen edges={[]} padded={false} topPadding={false} style={{ flex: 1 }} contentStyle={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View
          style={[
            styles.topBar,
            {
              borderBottomColor: theme.semantic.border,
              paddingTop: insets.top,
              height: 52 + insets.top,
            },
          ]}
        >
          <Pressable onPress={onCancel} hitSlop={10}>
            <Text style={{ color: theme.semantic.textSecondary, fontWeight: '800' }}>Cancel</Text>
          </Pressable>

          <Text style={{ color: theme.semantic.text, fontWeight: '900', fontSize: 16 }}>Add Transaction</Text>

          <Pressable onPress={onSave} disabled={!canSave} hitSlop={10}>
            <Text style={{ color: theme.semantic.primary, fontWeight: '900', opacity: canSave ? 1 : 0.35 }}>Save</Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          showsVerticalScrollIndicator={false}
        >
          {/* Type Selector */}
          <View style={[styles.segmentWrap, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}>
            {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => {
              const selected = t === type
              return (
                <Pressable
                  key={t}
                  onPress={() => {
                    setType(t)
                    category.resetCategory()
                  }}
                  style={[styles.segmentBtn, selected && { backgroundColor: theme.semantic.primarySoft }]}
                >
                  <Text
                    style={{
                      color: selected ? theme.semantic.primaryStrong : theme.semantic.textSecondary,
                      fontWeight: '900',
                    }}
                  >
                    {t}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          {/* Item & Merchant */}
          <View style={[styles.titleCard, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}>
            <TextInput
              ref={itemInputRef}
              value={item}
              onChangeText={setItem}
              placeholder="Add item"
              placeholderTextColor={theme.semantic.textSecondary}
              style={[styles.titleInput, { color: theme.semantic.text }]}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => merchantInputRef.current?.focus()}
            />

            <View style={[styles.inlineDivider, { backgroundColor: theme.semantic.border }]} />

            <TextInput
              ref={merchantInputRef}
              value={merchant}
              onChangeText={setMerchant}
              placeholder="Merchant"
              placeholderTextColor={theme.semantic.textSecondary}
              style={[styles.subInput, { color: theme.semantic.text }]}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => noteInputRef.current?.focus()}
              autoCorrect={false}
              autoCapitalize="words"
            />
          </View>

          {/* Amount */}
          <Pressable
            onPress={amount.openAmountKeypad}
            style={[styles.card, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
          >
            <Text style={{ color: theme.semantic.textSecondary, fontSize: 12 }}>Amount</Text>
            <Text style={{ color: theme.semantic.text, fontSize: 44, fontWeight: '900', marginTop: 6 }}>
              ${amount.amountDisplay}
            </Text>
            <Text style={{ color: theme.semantic.textSecondary, fontSize: 12, marginTop: 6 }}>Tap to enter amount</Text>
          </Pressable>

          {/* Transfer placeholder */}
          {type === 'transfer' && (
            <View style={[styles.card, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}>
              <Text style={{ color: theme.semantic.text, fontWeight: '900', marginBottom: 6 }}>Transfer</Text>
              <Text style={{ color: theme.semantic.textSecondary }}>Accounts will be added next</Text>
              <Text style={{ color: theme.semantic.textSecondary, marginTop: 6 }}>Save is disabled for now</Text>
            </View>
          )}

          {/* Date & Time */}
          <DateTimeSection dateTime={dateTime} />

          {/* Account */}
          <View style={[styles.card, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}>
            <Pressable onPress={account.openAccount} style={styles.row}>
              <Text style={[styles.rowLabel, { color: theme.semantic.textSecondary }]}>                                                
                {type === 'expense' ? 'Paid with' : 'Account'}                   
              </Text> 
              <Text
                style={{
                  color: account.selectedAccount ? theme.semantic.text : theme.semantic.textSecondary,
                  fontWeight: '800',
                }}
              >
                {account.accountDisplay}
              </Text>
            </Pressable>
          </View>

          {/* Category & Subcategory */}
          {type !== 'transfer' && (
            <>
              <View style={[styles.card, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}>
                <Pressable onPress={category.openCategory} style={styles.row}>
                  <Text style={[styles.rowLabel, { color: theme.semantic.textSecondary }]}>Category</Text>
                  <Text
                    style={{
                      color: category.categoryRef ? theme.semantic.text : theme.semantic.textSecondary,
                      fontWeight: '800',
                    }}
                  >
                    {category.categoryRef ? category.categoryDisplay.split('›')[0].trim() : 'Select'}
                  </Text>
                </Pressable>
              </View>

              {category.selectedCategory?.subCategories?.length ? (
                <View style={[styles.card, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}>
                  <Pressable onPress={category.openSubCategory} style={styles.row}>
                    <Text style={[styles.rowLabel, { color: theme.semantic.textSecondary }]}>Sub</Text>
                    <Text style={{ color: theme.semantic.text, fontWeight: '800' }}>{category.subCategoryDisplay}</Text>
                  </Pressable>
                </View>
              ) : null}
            </>
          )}

          {/* Note */}
          <View
            onLayout={(e) => {
              noteYRef.current = e.nativeEvent.layout.y
            }}
            style={[styles.card, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
          >
            <TextInput
              ref={noteInputRef}
              value={note}
              onChangeText={setNote}
              placeholder="Add note"
              placeholderTextColor={theme.semantic.textSecondary}
              multiline
              textAlignVertical="top"
              style={[styles.noteInput, { color: theme.semantic.text }]}
              onFocus={() => {
                scrollToNote()
                setTimeout(scrollToNote, 250)
              }}
            />
          </View>

          {/* Receipt */}
          {type !== 'transfer' && (
            <View style={[styles.card, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}>
              <Text style={{ color: theme.semantic.textSecondary, marginBottom: 10 }}>Receipt</Text>

              <View style={styles.receiptRow}>
                <Pressable onPress={onTakeReceipt} style={[styles.receiptBtn, { borderColor: theme.semantic.border }]}>
                  <Text style={{ color: theme.semantic.text, fontWeight: '800' }}>Take photo</Text>
                </Pressable>

                <Pressable onPress={onPickReceipt} style={[styles.receiptBtn, { borderColor: theme.semantic.border }]}>
                  <Text style={{ color: theme.semantic.text, fontWeight: '800' }}>Choose</Text>
                </Pressable>
              </View>

              <Text style={{ color: theme.semantic.textSecondary, marginTop: 10, fontSize: 12 }}>
                {receiptUri ? `Attached: ${receiptUri.split('/').pop()}` : 'No receipt attached'}
              </Text>
            </View>
          )}

          <View style={{ height: 28 }} />
        </ScrollView>

        {/* Modals */}
        <AmountKeypadModal
          visible={amount.showAmountKeypad}
          amountDisplay={amount.amountDisplay}
          onClose={amount.closeAmountKeypad}
          onClear={amount.clearAmount}
          onAppendDigit={amount.appendAmountDigit}
          onBackspace={amount.backspaceAmount}
        />

        <AccountSelectionModal
          visible={account.showAccountModal}
          accountKey={account.accountKey}
          accountQuery={account.accountQuery}
          filteredAccounts={account.filteredAccounts}
          onQueryChange={account.setAccountQuery}
          onClose={account.closeAccount}
          onChoose={account.chooseAccount}
        />

        <CategorySelectionModal
          visible={category.showCategoryModal}
          categoryQuery={category.categoryQuery}
          searchRows={category.searchRows}
          categorySearchRef={category.categorySearchRef}
          onQueryChange={category.setCategoryQuery}
          onClose={category.closeCategory}
          onChooseCategory={category.chooseCategory}
          onChooseSubFromSearch={category.chooseSubFromSearch}
        />

        <SubCategorySelectionModal
          visible={category.showSubCategoryModal}
          categoryRef={category.categoryRef}
          selectedCategory={category.selectedCategory}
          subCategories={category.subCategoriesForSelected}
          onClose={category.closeSubCategory}
          onChoose={category.chooseSubCategory}
          onReopenCategory={category.reopenCategoryFromSub}
        />
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  segmentWrap: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 4,
    flexDirection: 'row',
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCard: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  titleInput: {
    fontSize: 30,
    fontWeight: '900',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  subInput: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },
  inlineDivider: {
    height: StyleSheet.hairlineWidth,
  },
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
  noteInput: {
    minHeight: 120,
    fontSize: 16,
  },
  receiptRow: {
    flexDirection: 'row',
    gap: 10,
  },
  receiptBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
