import { CATEGORIES_INDEX } from '@/config'
import { resolveAccountIdByKey } from '@/domain/account'
import type { UUID } from '@/domain/common/uuid'
import type { TransactionType } from '@/domain/transaction'
import { addTransaction } from '@/domain/transaction/transaction.usecase'
import { useHoHTheme } from '@/providers'
import { AutoSuggestInput, Button, CategoryIcon } from '@/shared/components'
import { Screen } from '@/shared/layout/Screen'
import { useDraftsStore, useSuggestionsStore } from '@/store'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Image,
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
  TagSection,
} from './components'
import { useAccountPicker, useAmountKeypad, useCategoryPicker, useDateTime } from './hooks'

const TRANSACTION_TYPES: { key: TransactionType; label: string }[] = [
  { key: 'expense', label: 'Expense' },
  { key: 'income', label: 'Income' },
  { key: 'transfer', label: 'Transfer' },
]

export default function AddTransactionScreen() {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ draftId?: string }>()
  const editingDraftId = params.draftId

  const itemInputRef = useRef<TextInput>(null)
  const noteInputRef = useRef<TextInput>(null)
  const merchantInputRef = useRef<TextInput>(null)
  const scrollRef = useRef<ScrollView>(null)

  // Transaction type
  const [type, setType] = useState<TransactionType>('expense')

  // Form fields
  const [item, setItem] = useState('')
  const [merchant, setMerchant] = useState('')
  const [note, setNote] = useState('')
  const [receiptUri, setReceiptUri] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])

  // Draft store
  const addDraft = useDraftsStore((s) => s.addDraft)
  const updateDraft = useDraftsStore((s) => s.updateDraft)
  const removeDraft = useDraftsStore((s) => s.removeDraft)
  const getDraft = useDraftsStore((s) => s.getDraft)

  // Suggestions store
  const { getItemSuggestions, getMerchantSuggestions, recordItem, recordMerchant } = useSuggestionsStore()

  // Hooks for complex state
  const amount = useAmountKeypad()
  const account = useAccountPicker()
  const category = useCategoryPicker(type)
  const dateTime = useDateTime()

  // Load draft data if editing
  useEffect(() => {
    if (editingDraftId) {
      const draft = getDraft(editingDraftId)
      if (draft) {
        setType(draft.type)
        setItem(draft.item || '')
        setMerchant(draft.merchant || '')
        setNote(draft.note || '')
        setReceiptUri(draft.receiptUri || null)
        if (draft.amountCents) {
          amount.setAmountCents(draft.amountCents)
        }
        if (draft.accountKey) {
          account.setAccountKey(draft.accountKey)
        }
        if (draft.categoryRef) {
          category.setCategoryRef(draft.categoryRef)
        }
        if (draft.occurredAt) {
          dateTime.setOccurredAt(new Date(draft.occurredAt))
        }
      }
    }
  }, [editingDraftId])

  // Validation - Required: amount, date, account, type
  // Date, account, type have defaults so only amount needs explicit check
  const canSave = useMemo(() => {
    if (type === 'transfer') return false
    const hasAmount = Number.isFinite(amount.amountCents) && amount.amountCents > 0
    return hasAmount
  }, [type, amount.amountCents])

  // Draft validation - more lenient (just need item OR amount)
  const canSaveDraft = useMemo(() => {
    if (type === 'transfer') return false
    const hasAmount = Number.isFinite(amount.amountCents) && amount.amountCents > 0
    const hasItem = item.trim().length > 0
    return hasAmount || hasItem
  }, [type, amount.amountCents, item])

  // Check if any data has been entered (for close prompt)
  const hasAnyData = useMemo(() => {
    const hasAmount = Number.isFinite(amount.amountCents) && amount.amountCents > 0
    const hasItem = item.trim().length > 0
    const hasMerchant = merchant.trim().length > 0
    const hasNote = note.trim().length > 0
    const hasCategory = !!category.categoryRef
    const hasTags = tags.length > 0
    return hasAmount || hasItem || hasMerchant || hasNote || hasCategory || hasTags
  }, [amount.amountCents, item, merchant, note, category.categoryRef, tags])

  const onCancel = () => {
    if (hasAnyData && type !== 'transfer') {
      Alert.alert(
        'Save as draft?',
        undefined,
        [
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
          { text: 'Save as draft', onPress: onSaveDraft },
        ]
      )
    } else {
      router.back()
    }
  }

  const onSave = async () => {
    if (type === 'transfer') {
      Alert.alert('Transfer not ready', 'Transfer will be enabled after accounts are added')
      return
    }

    const cleanedItem = item.trim()
    const cleanedNote = note.trim()

    // Required fields: amount, date, account, type
    // Date has default (today), type has default (expense)
    if (!Number.isFinite(amount.amountCents) || amount.amountCents <= 0) {
      Alert.alert('Amount required', 'Please enter an amount')
      return
    }

    let accountId: UUID
    try {
      accountId = resolveAccountIdByKey(account.accountKey)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Please select a payment method'
      Alert.alert('Account required', message)
      return
    }

    // Category validation (optional but must be valid if set)
    if (category.categoryRef) {
      const typeMap = CATEGORIES_INDEX[category.categoryRef.type]
      const subKeys = typeMap?.[category.categoryRef.categoryKey]
      const ok = !!subKeys && (!category.categoryRef.subCategoryKey || subKeys.includes(category.categoryRef.subCategoryKey))

      if (!ok) {
        Alert.alert('Invalid category', 'Please re-select category')
        return
      }
    }

    try {
      await addTransaction(CATEGORIES_INDEX, {
        type,
        item: cleanedItem || undefined,
        amount: amount.amountDollars,
        category: category.categoryRef ?? undefined,
        accountId,
        occurredAt: dateTime.occurredAt,
        merchant: merchant.trim() || undefined,
        note: cleanedNote || undefined,
      })

      // Record for auto-suggestions
      if (cleanedItem) {
        recordItem(cleanedItem)
      }
      if (merchant.trim()) {
        recordMerchant(merchant.trim())
      }

      // Remove draft if we were editing one
      if (editingDraftId) {
        removeDraft(editingDraftId)
      }

      router.replace({ pathname: '/(tabs)/transactions' } as Parameters<typeof router.replace>[0])
    } catch (e: unknown) {
      console.error(e)
      const message = e instanceof Error ? e.message : 'Unknown error'
      Alert.alert('Save failed', message)
    }
  }

  const onSaveDraft = () => {
    if (type === 'transfer') {
      Alert.alert('Transfer not ready', 'Transfer will be enabled after accounts are added')
      return
    }

    const cleanedItem = item.trim()
    const cleanedNote = note.trim()

    if (!cleanedItem && (!Number.isFinite(amount.amountCents) || amount.amountCents <= 0)) {
      Alert.alert('Add something', 'Please enter an item or amount to save as draft')
      return
    }

    const draftData = {
      type,
      item: cleanedItem,
      amountCents: amount.amountCents,
      merchant: merchant.trim() || undefined,
      note: cleanedNote || undefined,
      categoryRef: category.categoryRef ?? undefined,
      accountKey: account.accountKey ?? undefined,
      occurredAt: dateTime.occurredAt.toISOString(),
      receiptUri: receiptUri ?? undefined,
    }

    if (editingDraftId) {
      // Update existing draft
      updateDraft(editingDraftId, draftData)
    } else {
      // Create new draft
      addDraft(draftData)
    }

    router.back()
  }

  // Receipt handlers
  const getImagePicker = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('expo-image-picker')
    } catch {
      return null
    }
  }

  const onPickReceipt = async () => {
    const ImagePicker = getImagePicker()
    if (!ImagePicker) {
      Alert.alert('Not available', 'Photo library is not available')
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
    const ImagePicker = getImagePicker()
    if (!ImagePicker) {
      Alert.alert('Not available', 'Camera is not available')
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

  const onReceiptPress = () => {
    if (receiptUri) {
      // Show remove option
      Alert.alert('Receipt', undefined, [
        { text: 'Remove', style: 'destructive', onPress: () => setReceiptUri(null) },
        { text: 'Cancel', style: 'cancel' },
      ])
    } else {
      // Show add options (Apple-style action sheet)
      Alert.alert('Add Receipt', undefined, [
        { text: 'Take Photo', onPress: onTakeReceipt },
        { text: 'Choose from Library', onPress: onPickReceipt },
        { text: 'Cancel', style: 'cancel' },
      ])
    }
  }

  // Build category display
  const categoryDisplay = useMemo(() => {
    if (!category.selectedCategory) return null

    const subKey = category.categoryRef?.subCategoryKey
    const sub = subKey
      ? category.selectedCategory.subCategories?.find(s => s.key === subKey)
      : null

    return {
      icon: sub?.icon ?? category.selectedCategory.icon,
      color: sub?.color ?? category.selectedCategory.color,
      label: sub
        ? `${category.selectedCategory.name} › ${sub.name}`
        : category.selectedCategory.name
    }
  }, [category.selectedCategory, category.categoryRef])

  return (
    <Screen edges={[]} padded={false} topPadding={false} style={{ flex: 1 }} contentStyle={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Drag Handle */}
        <View style={styles.dragHandleContainer}>
          <View style={[styles.dragHandle, { backgroundColor: theme.semantic.border }]} />
        </View>

        {/* Header Add New */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Pressable onPress={onCancel} hitSlop={10} style={styles.headerClose}>
            <FontAwesome name="times" size={20} color={theme.semantic.textSecondary} />
          </Pressable>
        </View>

        {/* Type Tabs - Underline style */}
        <View style={[styles.typeTabs, { borderBottomColor: theme.semantic.border }]}>
          {TRANSACTION_TYPES.map((t) => {
            const selected = t.key === type
            return (
              <Pressable
                key={t.key}
                onPress={() => {
                  setType(t.key)
                  category.resetCategory()
                }}
                style={[
                  styles.typeTab,
                  { borderBottomColor: selected ? theme.semantic.primary : 'transparent' }
                ]}
              >
                <Text
                  style={[
                    styles.typeTabText,
                    {
                      color: selected ? theme.semantic.text : theme.semantic.textSecondary,
                      fontWeight: selected ? '700' : '500',
                    }
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            )
          })}
        </View>

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 200 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {/* Group 1: Title + Merchant */}
          <View style={[styles.fieldGroup, { backgroundColor: theme.semantic.surfaceAlt, overflow: 'visible', zIndex: 10 }]}>
            <AutoSuggestInput
              inputRef={itemInputRef}
              value={item}
              onChangeText={setItem}
              getSuggestions={getItemSuggestions}
              placeholder="What's this for?"
              style={styles.titleInput}
              returnKeyType="next"
              onSubmitEditing={() => merchantInputRef.current?.focus()}
            />
            <AutoSuggestInput
              inputRef={merchantInputRef}
              value={merchant}
              onChangeText={setMerchant}
              getSuggestions={getMerchantSuggestions}
              placeholder="Who or where (optional)"
              style={[styles.merchantInput, { color: merchant ? theme.semantic.text : theme.semantic.textSecondary }]}
              returnKeyType="next"
              onSubmitEditing={() => amount.openAmountKeypad()}
              autoCorrect={false}
              autoCapitalize="words"
            />
          </View>

          {/* Group 2: Amount */}
          <Pressable
            onPress={amount.openAmountKeypad}
            style={[styles.fieldGroup, { backgroundColor: theme.semantic.surfaceAlt }]}
          >
            <Text style={[styles.amountValue, { color: theme.semantic.text }]}>
              ${amount.amountDisplay}
            </Text>
          </Pressable>

          {/* Transfer placeholder */}
          {type === 'transfer' && (
            <View style={[styles.fieldGroup, { backgroundColor: theme.semantic.surfaceAlt }]}>
              <Text style={{ color: theme.semantic.textSecondary, fontWeight: '600', textAlign: 'center' }}>
                Transfer feature coming soon
              </Text>
            </View>
          )}

          {/* Group 3: Date / Category / Paid with */}
          {type !== 'transfer' && (
            <View style={[styles.fieldGroup, { backgroundColor: theme.semantic.surfaceAlt }]}>
              {/* Date */}
              <View style={styles.metadataRow}>
                <Text style={[styles.metadataLabel, { color: theme.semantic.text }]}>Date</Text>
                <View style={styles.dateTimeValues}>
                  <Pressable onPress={dateTime.openDatePicker} hitSlop={8}>
                    <Text style={[styles.metadataValue, { color: theme.semantic.text }]}>
                      {dateTime.dateDisplay}
                    </Text>
                  </Pressable>
                  <Pressable onPress={dateTime.openTimePicker} hitSlop={8}>
                    <Text style={[styles.metadataValue, { color: theme.semantic.text }]}>
                      {dateTime.timeDisplay}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {dateTime.showDatePicker && (
                <DateTimeSection dateTime={dateTime} embedded />
              )}

              {dateTime.showTimePicker && (
                <DateTimeSection dateTime={dateTime} embedded />
              )}

              {/* Category */}
              <Pressable onPress={category.openCategory} style={styles.metadataRow}>
                <Text style={[styles.metadataLabel, { color: theme.semantic.text }]}>Category</Text>
                {categoryDisplay ? (
                  <View style={styles.categoryValue}>
                    <CategoryIcon name={categoryDisplay.icon} size={16} color={categoryDisplay.color} />
                    <Text style={[styles.metadataValue, { color: theme.semantic.text }]}>
                      {categoryDisplay.label}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.metadataValue, { color: theme.semantic.textSecondary }]}>Select</Text>
                )}
              </Pressable>

              {/* Account */}
              <Pressable onPress={account.openAccount} style={styles.metadataRow}>
                <Text style={[styles.metadataLabel, { color: theme.semantic.text }]}>
                  {type === 'expense' ? 'Paid with' : 'Account'}
                </Text>
                <Text
                  style={[
                    styles.metadataValue,
                    { color: account.selectedAccount ? theme.semantic.text : theme.semantic.textSecondary }
                  ]}
                >
                  {account.accountDisplay}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Group 4: Note */}
          <View style={[styles.fieldGroup, { backgroundColor: theme.semantic.surfaceAlt }]}>
            <Text style={[styles.metadataLabel, { color: theme.semantic.text, marginBottom: 8 }]}>Note</Text>
            <TextInput
              ref={noteInputRef}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note..."
              placeholderTextColor={theme.semantic.textSecondary}
              multiline
              scrollEnabled={false}
              style={[styles.noteInput, { color: theme.semantic.text }]}
            />
          </View>

          {/* Group 5: Tags */}
          {type !== 'transfer' && (
            <TagSection selectedTags={tags} onTagsChange={setTags} />
          )}

          {/* Group 6: Receipt */}
          {type !== 'transfer' && (
            <View style={[styles.fieldGroup, { backgroundColor: theme.semantic.surfaceAlt }]}>
              <Pressable onPress={onReceiptPress} style={styles.receiptRow}>
                <Text style={[styles.metadataLabel, { color: theme.semantic.text }]}>Receipt</Text>
                <FontAwesome
                  name={receiptUri ? 'check-circle' : 'camera'}
                  size={20}
                  color={receiptUri ? theme.semantic.success : theme.semantic.textSecondary}
                />
              </Pressable>
              {receiptUri && (
                <Pressable onPress={onReceiptPress} style={styles.receiptPreview}>
                  <Image
                    source={{ uri: receiptUri }}
                    style={styles.receiptImage}
                    resizeMode="cover"
                  />
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>

        {/* Footer - Apple style */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Button
            onPress={onSave}
            disabled={!canSave}
          >
            Add
          </Button>

          <Button
            variant="text"
            onPress={onSaveDraft}
            disabled={!canSaveDraft}
          >
            Save as draft
          </Button>
        </View>

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
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerSpacer: {
    width: 28,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  headerClose: {
    width: 28,
    alignItems: 'flex-end',
  },
  typeTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  typeTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 2,
    marginBottom: -1,
  },
  typeTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  fieldGroup: {
    borderRadius: 12,
    padding: 16,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    paddingVertical: 2,
  },
  merchantInput: {
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 2,
    marginTop: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateTimeValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  categoryValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  noteInput: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 32,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiptPreview: {
    marginTop: 12,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: 'center',
    gap: 8,
  },
})
