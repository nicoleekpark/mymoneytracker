import { addTransaction } from '@/domain/transaction/transaction.usecase'
import { getAccountIdByKey, listActiveAccounts } from '@/lib/db/account'
import { useHoHTheme } from '@/providers'
import { useAppStore } from '@/store/app.store'
import DateTimePicker from '@react-native-community/datetimepicker'
import { router } from 'expo-router'
import React, { useMemo, useRef, useState } from 'react'
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CATEGORIES } from '@/config/categories.config'
import type { CategoryRef } from '@/domain/category'
import type { Category, SubCategory } from '@/types/category.types'

type TxType = 'income' | 'expense' | 'transfer'

type CategorySearchRow =
  | { kind: 'category'; cat: Category; score: number; tie: number }
  | { kind: 'subcategory'; cat: Category; sub: SubCategory; score: number; tie: number }

// Receipt picker (optional dependency)
let ImagePicker: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ImagePicker = require('expo-image-picker')
} catch {
  ImagePicker = null
}

function digitsOnly(s: string): string {
  return s.replace(/[^\d]/g, '')
}

function formatCentsDisplay(centsText: string): string {
  const digits = digitsOnly(centsText)
  const cents = digits ? Number(digits) : 0
  if (!Number.isFinite(cents) || cents < 0) return '0.00'
  const dollars = cents / 100
  return dollars.toFixed(2)
}

function centsNumber(centsText: string): number {
  const digits = digitsOnly(centsText)
  const n = digits ? Number(digits) : 0
  return Number.isFinite(n) ? n : NaN
}

// ✅ Keep emoji label for display
function buildCategoryLabel(cat: Category): string {
  return `${cat.icon} ${cat.name}`
}
function buildSubLabel(sc: SubCategory): string {
  return `${sc.icon} ${sc.name}`
}

// ✅ Search should ignore emoji/icons
function normalizeForSearch(s: string): string {
  return (
    s
      .normalize('NFKD')
      .replace(/\p{Extended_Pictographic}/gu, '')
      .replace(/[^\p{L}\p{N}\s_-]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
  )
}

function scoreText(q: string, text: string, base: number): number {
  if (!q) return 0
  if (text.startsWith(q)) return base + 100
  if (text.includes(q)) return base + 50
  return 0
}

export default function AddTransactionScreen() {
  const theme = useHoHTheme()
  const categoryIndex = useAppStore(s => s.categoryIndex)
  const insets = useSafeAreaInsets()

  // ✅ Input refs (keyboard focus reliability)
  const itemInputRef = useRef<TextInput>(null)
  const noteInputRef = useRef<TextInput>(null)

  const categorySearchRef = useRef<TextInput>(null)

  const [type, setType] = useState<TxType>('expense')

  const [item, setItem] = useState('')
  const [note, setNote] = useState('')

  // cents-only input
  const [amountCentsText, setAmountCentsText] = useState('')
  const amountCents = useMemo(() => centsNumber(amountCentsText), [amountCentsText])
  const amountDisplay = useMemo(() => formatCentsDisplay(amountCentsText), [amountCentsText])

  const [occurredAt, setOccurredAt] = useState<Date>(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  // ✅ CategoryRef (type + categoryId + optional subCategoryId)
  const [categoryRef, setCategoryRef] = useState<CategoryRef | null>(null)

  // ✅ Category modal (searchable)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [categoryQuery, setCategoryQuery] = useState('')

  // ✅ Subcategory modal (depends on selected category)
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false)

  const [showAmountKeypad, setShowAmountKeypad] = useState(false)

  const [receiptUri, setReceiptUri] = useState<string | null>(null)

  // ✅ Payment method (account)
  const [accountKey, setAccountKey] = useState<string>('cash')

  // ✅ Account modal (searchable)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [accountQuery, setAccountQuery] = useState('')

  const accounts = useMemo(() => listActiveAccounts(), [])

  const filteredAccounts = useMemo(() => {
    const q = normalizeForSearch(accountQuery)
    if (!q) return accounts
    return accounts.filter(a => {
      const hay = normalizeForSearch(`${a.key} ${a.name} ${a.type}`)
      return hay.includes(q)
    })
  }, [accounts, accountQuery])

  const selectedAccount = useMemo(() => {
    return accounts.find(a => a.key === accountKey) ?? null
  }, [accounts, accountKey])

  const accountDisplay = useMemo(() => {
    return selectedAccount ? selectedAccount.name : 'Select'
  }, [selectedAccount])

  const categoriesForType = useMemo(() => {
    return CATEGORIES.filter(c => c.type === type)
  }, [type])

  const selectedCategory = useMemo(() => {
    if (!categoryRef) return null
    return categoriesForType.find(c => c.id === categoryRef.categoryId) ?? null
  }, [categoriesForType, categoryRef])

  const subCategoriesForSelected = useMemo(() => {
    return selectedCategory?.subCategories ?? []
  }, [selectedCategory])

  // ✅ Mixed search results: category rows + subcategory rows
  const searchRows = useMemo<CategorySearchRow[]>(() => {
    const q = normalizeForSearch(categoryQuery)

    if (!q) {
      return categoriesForType.map((cat, idx) => ({
        kind: 'category',
        cat,
        score: 1,
        tie: idx
      }))
    }

    const rows: CategorySearchRow[] = []
    let tie = 0

    for (const cat of categoriesForType) {
      const catName = normalizeForSearch(cat.name)
      const catId = normalizeForSearch(cat.id)

      const catScore = Math.max(scoreText(q, catName, 900), scoreText(q, catId, 850))

      if (catScore > 0) rows.push({ kind: 'category', cat, score: catScore, tie: tie++ })

      for (const sub of cat.subCategories ?? []) {
        const subName = normalizeForSearch(sub.name)
        const subId = normalizeForSearch(sub.id)

        const subScore = Math.max(scoreText(q, subName, 700), scoreText(q, subId, 650))

        if (subScore > 0) rows.push({ kind: 'subcategory', cat, sub, score: subScore, tie: tie++ })
      }
    }

    rows.sort((a, b) => (b.score !== a.score ? b.score - a.score : a.tie - b.tie))
    return rows
  }, [categoriesForType, categoryQuery])

  const scrollRef = useRef<ScrollView>(null)
  const noteYRef = useRef<number>(0)

  const scrollToNote = () => {
    const topPad = 14
    const y = Math.max(0, noteYRef.current - topPad)
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y, animated: true })
    })
  }

  const canSaveBase = useMemo(() => {
    const hasAmount = Number.isFinite(amountCents) && amountCents > 0
    const hasItem = item.trim().length > 0
    return hasAmount && hasItem
  }, [amountCents, item])

  const canSave = useMemo(() => {
    if (type === 'transfer') return false
    return canSaveBase
  }, [type, canSaveBase])

  const onCancel = () => router.back()

  // ---------- Amount keypad ----------
  const openAmountKeypad = () => {
    Keyboard.dismiss()
    setShowAmountKeypad(true)
  }
  const closeAmountKeypad = () => setShowAmountKeypad(false)

  const appendAmountDigit = (d: string) => {
    setAmountCentsText(prev => {
      const next = digitsOnly(`${prev}${d}`)
      return next.length > 12 ? next.slice(0, 12) : next
    })
  }
  const backspaceAmount = () => setAmountCentsText(prev => prev.slice(0, -1))
  const clearAmount = () => setAmountCentsText('')

  // ---------- Account ----------
  const openAccount = () => {
    Keyboard.dismiss()
    setAccountQuery('')
    setShowAccountModal(true)
  }
  const closeAccount = () => {
    setShowAccountModal(false)
    setAccountQuery('')
  }

  const chooseAccount = (key: string) => {
    setAccountKey(key)
    closeAccount()
  }

  // ---------- Category / Subcategory ----------
  const openCategory = () => {
    Keyboard.dismiss()
    setShowSubCategoryModal(false)
    setCategoryQuery('')
    setShowCategoryModal(true)
    setTimeout(() => categorySearchRef.current?.focus(), 250)
  }
  const closeCategory = () => {
    setShowCategoryModal(false)
    setCategoryQuery('')
  }

  const openSubCategory = () => {
    Keyboard.dismiss()
    if (!selectedCategory) return
    setShowSubCategoryModal(true)
  }
  const closeSubCategory = () => setShowSubCategoryModal(false)

  const chooseCategory = (cat: Category) => {
    setCategoryRef({ type, categoryId: cat.id })
    closeCategory()

    if (cat.subCategories?.length) {
      setTimeout(() => setShowSubCategoryModal(true), 200)
    }
  }

  const chooseSubFromSearch = (cat: Category, sub: SubCategory) => {
    setCategoryRef({ type, categoryId: cat.id, subCategoryId: sub.id })
    setShowSubCategoryModal(false)
    closeCategory()
  }

  const chooseSubCategory = (subCategoryId?: string) => {
    if (!categoryRef) return
    const next: CategoryRef = subCategoryId
      ? { type, categoryId: categoryRef.categoryId, subCategoryId }
      : { type, categoryId: categoryRef.categoryId }

    setCategoryRef(next)
    closeSubCategory()
  }

  const reopenCategoryFromSub = () => {
    setShowSubCategoryModal(false)
    setCategoryQuery('')
    setTimeout(() => {
      setShowCategoryModal(true)
      setTimeout(() => categorySearchRef.current?.focus(), 50)
    }, 200)
  }

  const categoryDisplay = useMemo(() => {
    if (!categoryRef) return 'Select'
    const cat = CATEGORIES.find(c => c.type === categoryRef.type && c.id === categoryRef.categoryId)
    if (!cat) return 'Select'

    if (!categoryRef.subCategoryId) return buildCategoryLabel(cat)

    const sc = cat.subCategories.find(s => s.id === categoryRef.subCategoryId)
    if (!sc) return buildCategoryLabel(cat)

    return `${buildCategoryLabel(cat)}  ›  ${buildSubLabel(sc)}`
  }, [categoryRef])

  const subCategoryDisplay = useMemo(() => {
    if (!selectedCategory) return 'Select'
    if (!selectedCategory.subCategories?.length) return 'None'
    if (!categoryRef?.subCategoryId) return 'Select'

    const sc = selectedCategory.subCategories.find(s => s.id === categoryRef.subCategoryId)
    return sc ? buildSubLabel(sc) : 'Select'
  }, [selectedCategory, categoryRef])

  // ---------- Save ----------
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

    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      Alert.alert('Invalid amount', 'Please enter an amount')
      return
    }

    if (!categoryRef) {
      Alert.alert('Category required', 'Please select a category')
      return
    }

    const typeMap = categoryIndex[categoryRef.type]
    const subIds = typeMap?.[categoryRef.categoryId]
    const ok = !!subIds && (!categoryRef.subCategoryId || subIds.includes(categoryRef.subCategoryId))

    if (!ok) {
      Alert.alert('Invalid category', 'Please re-select category')
      return
    }

    let accountId: string
    try {
      accountId = getAccountIdByKey(accountKey)
    } catch (e: any) {
      Alert.alert('Account missing', e?.message ?? 'Please select a payment method')
      return
    }

    try {
      await addTransaction(categoryIndex, {
        type,
        item: cleanedItem,
        amount: amountCents,
        category: categoryRef,
        accountId,
        occurredAt,
        note: cleanedNote || undefined
      })

      router.replace('/(tabs)/transactions')
    } catch (e: any) {
      console.error(e)
      Alert.alert('Save failed', e?.message ?? 'Unknown error')
    }
  }

  // ---------- Receipt (kept as-is; phase2 DB meta later) ----------
  const requestMediaPerm = async () => {
    if (!ImagePicker) return false
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync()
    return res?.granted === true
  }
  const requestCameraPerm = async () => {
    if (!ImagePicker) return false
    const res = await ImagePicker.requestCameraPermissionsAsync()
    return res?.granted === true
  }
  const onPickReceipt = async () => {
    if (!ImagePicker) {
      Alert.alert('Not set up', 'Install expo-image-picker to enable receipt import')
      return
    }
    const ok = await requestMediaPerm()
    if (!ok) {
      Alert.alert('Permission needed', 'Please allow photo library access')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9
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
    const ok = await requestCameraPerm()
    if (!ok) {
      Alert.alert('Permission needed', 'Please allow camera access')
      return
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 })
    if (!result.canceled && result.assets?.[0]?.uri) {
      setReceiptUri(result.assets[0].uri)
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.semantic.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 52 : 0}
    >
      {/* Top bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.semantic.border }]}>
        <Pressable onPress={onCancel} hitSlop={10}>
          <Text style={{ color: theme.semantic.textSecondary, fontWeight: '800' }}>
            Cancel
          </Text>
        </Pressable>

        <Text style={{ color: theme.semantic.text, fontWeight: '900', fontSize: 16 }}>
          Add Transaction
        </Text>

        <Pressable onPress={onSave} disabled={!canSave} hitSlop={10}>
          <Text
            style={{
              color: theme.semantic.primary,
              fontWeight: '900',
              opacity: canSave ? 1 : 0.35
            }}
          >
            Save
          </Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        // ✅ 핵심: 탭을 무조건 자식에게 전달해서 TextInput이 항상 포커스/키보드가 뜨게 함
        keyboardShouldPersistTaps="always"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
      >
        {/* Type toggle */}
        <View
          style={[
            styles.segmentWrap,
            { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }
          ]}
        >
          {(['expense', 'income', 'transfer'] as TxType[]).map(t => {
            const selected = t === type
            return (
              <Pressable
                key={t}
                onPress={() => {
                  setType(t)
                  setCategoryRef(null)
                }}
                style={[
                  styles.segmentBtn,
                  selected && { backgroundColor: theme.semantic.primarySoft }
                ]}
              >
                <Text
                  style={{
                    color: selected ? theme.semantic.primaryStrong : theme.semantic.textSecondary,
                    fontWeight: '900'
                  }}
                >
                  {t}
                </Text>
              </Pressable>
            )
          })}
        </View>

        {/* Item */}
        <View
          style={[
            styles.card,
            { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }
          ]}
        >
          <TextInput
            ref={itemInputRef}
            value={item}
            onChangeText={setItem}
            placeholder="Add item"
            placeholderTextColor={theme.semantic.textSecondary}
            style={[styles.heroInput, { color: theme.semantic.text }]}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => {
              // ✅ 키보드 유지 + 다음 필드로 자연스럽게 이동
              noteInputRef.current?.focus()
            }}
          />
        </View>

        {/* Amount */}
        <Pressable
          onPress={openAmountKeypad}
          style={[
            styles.card,
            { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }
          ]}
        >
          <Text style={{ color: theme.semantic.textSecondary, fontSize: 12 }}>
            Amount
          </Text>
          <Text
            style={{
              color: theme.semantic.text,
              fontSize: 44,
              fontWeight: '900',
              marginTop: 6
            }}
          >
            ${amountDisplay}
          </Text>
          <Text style={{ color: theme.semantic.textSecondary, fontSize: 12, marginTop: 6 }}>
            Tap to enter cents
          </Text>
        </Pressable>

        {/* Transfer notice */}
        {type === 'transfer' ? (
          <View
            style={[
              styles.card,
              { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }
            ]}
          >
            <Text style={{ color: theme.semantic.text, fontWeight: '900', marginBottom: 6 }}>
              Transfer
            </Text>
            <Text style={{ color: theme.semantic.textSecondary }}>
              Accounts will be added next
            </Text>
            <Text style={{ color: theme.semantic.textSecondary, marginTop: 6 }}>
              Save is disabled for now
            </Text>
          </View>
        ) : null}

        {/* Date + Time */}
        <View
          style={[
            styles.card,
            { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }
          ]}
        >
          <Pressable
            onPress={() => {
              Keyboard.dismiss()
              setShowDatePicker(v => !v)
            }}
            style={styles.row}
          >
            <Text style={[styles.rowLabel, { color: theme.semantic.textSecondary }]}>
              Date
            </Text>
            <Text style={{ color: theme.semantic.text, fontWeight: '800' }}>
              {occurredAt.toLocaleDateString()}
            </Text>
          </Pressable>

          {showDatePicker ? (
            <View style={{ marginTop: 10 }}>
              <DateTimePicker
                value={occurredAt}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(event, date) => {
                  if (date) {
                    setOccurredAt(prev =>
                      new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        prev.getHours(),
                        prev.getMinutes(),
                        0,
                        0
                      )
                    )
                  }
                  setShowDatePicker(false)
                }}
              />
            </View>
          ) : null}

          <View style={[styles.divider, { backgroundColor: theme.semantic.border }]} />

          <Pressable
            onPress={() => {
              Keyboard.dismiss()
              setShowTimePicker(v => !v)
            }}
            style={styles.row}
          >
            <Text style={[styles.rowLabel, { color: theme.semantic.textSecondary }]}>
              Time
            </Text>
            <Text style={{ color: theme.semantic.text, fontWeight: '800' }}>
              {occurredAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Pressable>

          {showTimePicker ? (
            <View style={{ marginTop: 10 }}>
              <DateTimePicker
                value={occurredAt}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  if (date) {
                    setOccurredAt(prev =>
                      new Date(
                        prev.getFullYear(),
                        prev.getMonth(),
                        prev.getDate(),
                        date.getHours(),
                        date.getMinutes(),
                        0,
                        0
                      )
                    )
                  }
                  setShowTimePicker(false)
                }}
              />
            </View>
          ) : null}
        </View>

        {/* Payment method (Account) */}
        <View
          style={[
            styles.card,
            { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }
          ]}
        >
          <Pressable onPress={openAccount} style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.semantic.textSecondary }]}>
              Paid with
            </Text>
            <Text
              style={{
                color: selectedAccount ? theme.semantic.text : theme.semantic.textSecondary,
                fontWeight: '800'
              }}
            >
              {accountDisplay}
            </Text>
          </Pressable>
        </View>

        {/* Category + Subcategory */}
        {type !== 'transfer' ? (
          <>
            <View
              style={[
                styles.card,
                { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }
              ]}
            >
              <Pressable onPress={openCategory} style={styles.row}>
                <Text style={[styles.rowLabel, { color: theme.semantic.textSecondary }]}>
                  Category
                </Text>
                <Text
                  style={{
                    color: categoryRef ? theme.semantic.text : theme.semantic.textSecondary,
                    fontWeight: '800'
                  }}
                >
                  {categoryRef ? categoryDisplay.split('›')[0].trim() : 'Select'}
                </Text>
              </Pressable>
            </View>

            {selectedCategory?.subCategories?.length ? (
              <View
                style={[
                  styles.card,
                  { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }
                ]}
              >
                <Pressable onPress={openSubCategory} style={styles.row}>
                  <Text style={[styles.rowLabel, { color: theme.semantic.textSecondary }]}>
                    Sub
                  </Text>
                  <Text style={{ color: theme.semantic.text, fontWeight: '800' }}>
                    {subCategoryDisplay}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </>
        ) : null}

        {/* Note */}
        <View
          onLayout={e => {
            noteYRef.current = e.nativeEvent.layout.y
          }}
          style={[
            styles.card,
            { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }
          ]}
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
        {type !== 'transfer' ? (
          <View
            style={[
              styles.card,
              { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }
            ]}
          >
            <Text style={{ color: theme.semantic.textSecondary, marginBottom: 10 }}>
              Receipt
            </Text>

            <View style={styles.receiptRow}>
              <Pressable
                onPress={onTakeReceipt}
                style={[styles.receiptBtn, { borderColor: theme.semantic.border }]}
              >
                <Text style={{ color: theme.semantic.text, fontWeight: '800' }}>
                  Take photo
                </Text>
              </Pressable>

              <Pressable
                onPress={onPickReceipt}
                style={[styles.receiptBtn, { borderColor: theme.semantic.border }]}
              >
                <Text style={{ color: theme.semantic.text, fontWeight: '800' }}>
                  Choose
                </Text>
              </Pressable>
            </View>

            {receiptUri ? (
              <Text style={{ color: theme.semantic.textSecondary, marginTop: 10, fontSize: 12 }}>
                Attached: {receiptUri.split('/').pop()}
              </Text>
            ) : (
              <Text style={{ color: theme.semantic.textSecondary, marginTop: 10, fontSize: 12 }}>
                No receipt attached
              </Text>
            )}
          </View>
        ) : null}

        <View style={{ height: 28 }} />
      </ScrollView>

      {/* Amount keypad modal (cents-only, bottom sheet) */}
      <Modal visible={showAmountKeypad} transparent animationType="slide" onRequestClose={closeAmountKeypad}>
        <Pressable style={styles.sheetBackdrop} onPress={closeAmountKeypad} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.semantic.background, paddingBottom: insets.bottom + 18 }
          ]}
        >
          <View style={styles.sheetHeader}>
            <Pressable onPress={closeAmountKeypad} hitSlop={10}>
              <Text style={{ color: theme.semantic.textSecondary, fontWeight: '800' }}>
                Cancel
              </Text>
            </Pressable>

            <Text style={{ color: theme.semantic.text, fontWeight: '900' }}>
              Amount
            </Text>

            <Pressable onPress={clearAmount} hitSlop={10}>
              <Text style={{ color: theme.semantic.primary, fontWeight: '900' }}>
                Clear
              </Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.amountPreview,
              { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }
            ]}
          >
            <Text style={{ color: theme.semantic.text, fontWeight: '900', fontSize: 36 }}>
              ${amountDisplay}
            </Text>
          </View>

          <View style={styles.keypadGrid}>
            <Pressable
              onPress={() => appendAmountDigit('1')}
              style={[styles.key, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
            >
              <Text style={{ color: theme.semantic.text, fontSize: 26, fontWeight: '900' }}>1</Text>
            </Pressable>
            <Pressable
              onPress={() => appendAmountDigit('2')}
              style={[styles.key, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
            >
              <Text style={{ color: theme.semantic.text, fontSize: 26, fontWeight: '900' }}>2</Text>
            </Pressable>
            <Pressable
              onPress={() => appendAmountDigit('3')}
              style={[styles.key, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
            >
              <Text style={{ color: theme.semantic.text, fontSize: 26, fontWeight: '900' }}>3</Text>
            </Pressable>

            <Pressable
              onPress={() => appendAmountDigit('4')}
              style={[styles.key, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
            >
              <Text style={{ color: theme.semantic.text, fontSize: 26, fontWeight: '900' }}>4</Text>
            </Pressable>
            <Pressable
              onPress={() => appendAmountDigit('5')}
              style={[styles.key, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
            >
              <Text style={{ color: theme.semantic.text, fontSize: 26, fontWeight: '900' }}>5</Text>
            </Pressable>
            <Pressable
              onPress={() => appendAmountDigit('6')}
              style={[styles.key, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
            >
              <Text style={{ color: theme.semantic.text, fontSize: 26, fontWeight: '900' }}>6</Text>
            </Pressable>

            <Pressable
              onPress={() => appendAmountDigit('7')}
              style={[styles.key, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
            >
              <Text style={{ color: theme.semantic.text, fontSize: 26, fontWeight: '900' }}>7</Text>
            </Pressable>
            <Pressable
              onPress={() => appendAmountDigit('8')}
              style={[styles.key, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
            >
              <Text style={{ color: theme.semantic.text, fontSize: 26, fontWeight: '900' }}>8</Text>
            </Pressable>
            <Pressable
              onPress={() => appendAmountDigit('9')}
              style={[styles.key, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
            >
              <Text style={{ color: theme.semantic.text, fontSize: 26, fontWeight: '900' }}>9</Text>
            </Pressable>

            <View style={styles.keyEmpty} />
            <Pressable
              onPress={() => appendAmountDigit('0')}
              style={[styles.key, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
            >
              <Text style={{ color: theme.semantic.text, fontSize: 26, fontWeight: '900' }}>0</Text>
            </Pressable>
            <Pressable
              onPress={backspaceAmount}
              style={[styles.key, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
            >
              <Text style={{ color: theme.semantic.text, fontSize: 18, fontWeight: '900' }}>⌫</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={closeAmountKeypad}
            style={[
              styles.doneBtn,
              { backgroundColor: theme.semantic.primarySoft, borderColor: theme.semantic.primarySoft }
            ]}
          >
            <Text style={{ color: theme.semantic.primaryStrong, fontSize: 18, fontWeight: '900' }}>
              Done
            </Text>
          </Pressable>
        </View>
      </Modal>

      {/* Account modal (fullscreen, searchable) */}
      <Modal
        visible={showAccountModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeAccount}
      >
        <View style={[styles.fullScreenRoot, { backgroundColor: theme.semantic.background }]}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
          >
            {/* backdrop는 content 뒤에서만 눌리도록 분리 */}
            <Pressable
              onPress={closeAccount}
              style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.25)' }]}
            />

            <View style={{ flex: 1, backgroundColor: theme.semantic.background, paddingTop: insets.top }}>
              <View style={[styles.fullHeaderBar, { borderBottomColor: theme.semantic.border }]}>
                <Pressable onPress={closeAccount} hitSlop={10}>
                  <Text style={{ color: theme.semantic.textSecondary, fontWeight: '800' }}>
                    Cancel
                  </Text>
                </Pressable>

                <Text style={{ color: theme.semantic.text, fontWeight: '900' }}>
                  Payment method
                </Text>

                <View style={{ width: 56 }} />
              </View>

              <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                <View
                  style={[
                    styles.searchBox,
                    {
                      borderColor: theme.semantic.border,
                      backgroundColor: theme.semantic.surface,
                      marginBottom: 0
                    }
                  ]}
                >
                  <TextInput
                    value={accountQuery}
                    onChangeText={setAccountQuery}
                    placeholder="Search account"
                    placeholderTextColor={theme.semantic.textSecondary}
                    style={{ color: theme.semantic.text, fontWeight: '700' }}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="search"
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              <FlatList
                style={{ flex: 1 }}
                data={filteredAccounts}
                keyExtractor={a => a.key}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="none"
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 8,
                  paddingBottom: insets.bottom + 24
                }}
                renderItem={({ item: a }) => {
                  const selected = a.key === accountKey
                  return (
                    <Pressable
                      onPress={() => chooseAccount(a.key)}
                      style={[styles.catRow, { borderBottomColor: theme.semantic.border }]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ color: theme.semantic.text, fontWeight: '900' }}>
                          {a.name}
                        </Text>
                        <Text style={{ color: theme.semantic.textSecondary, fontWeight: '800', fontSize: 12 }}>
                          {a.type}
                        </Text>
                      </View>

                      <Text style={{ color: selected ? theme.semantic.primary : theme.semantic.textSecondary, fontWeight: '900' }}>
                        {selected ? '✓' : ''}
                      </Text>
                    </Pressable>
                  )
                }}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Category modal (FULL SCREEN + mixed results) */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeCategory}
      >
        <View style={[styles.fullScreenRoot, { backgroundColor: theme.semantic.background, paddingTop: insets.top }]}>
          <View style={[styles.fullHeaderBar, { borderBottomColor: theme.semantic.border }]}>
            <Pressable onPress={closeCategory} hitSlop={10}>
              <Text style={{ color: theme.semantic.textSecondary, fontWeight: '800' }}>
                Cancel
              </Text>
            </Pressable>

            <Text style={{ color: theme.semantic.text, fontWeight: '900' }}>
              Category
            </Text>

            <View style={{ width: 56 }} />
          </View>

          <View style={[styles.fullSearchWrap, { borderBottomColor: theme.semantic.border }]}>
            <View
              style={[
                styles.searchBox,
                {
                  borderColor: theme.semantic.border,
                  backgroundColor: theme.semantic.surface,
                  marginBottom: 0
                }
              ]}
            >
              <TextInput
                ref={categorySearchRef}
                value={categoryQuery}
                onChangeText={setCategoryQuery}
                placeholder="Search category or subcategory"
                placeholderTextColor={theme.semantic.textSecondary}
                style={{ color: theme.semantic.text, fontWeight: '700' }}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                blurOnSubmit={false}
              />
            </View>
          </View>

          <FlatList
            style={{ flex: 1 }}
            data={searchRows}
            keyExtractor={row => (row.kind === 'category' ? `c:${row.cat.id}` : `s:${row.cat.id}:${row.sub.id}`)}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
            renderItem={({ item: row }) => {
              if (row.kind === 'category') {
                const cat = row.cat
                return (
                  <Pressable
                    onPress={() => chooseCategory(cat)}
                    style={[styles.catRow, { borderBottomColor: theme.semantic.border }]}
                  >
                    <Text style={{ color: theme.semantic.text, fontWeight: '900' }}>
                      {buildCategoryLabel(cat)}
                    </Text>

                    <Text style={{ color: theme.semantic.textSecondary, fontWeight: '900' }}>
                      {cat.subCategories?.length ? '›' : ''}
                    </Text>
                  </Pressable>
                )
              }

              const { cat, sub } = row
              return (
                <Pressable
                  onPress={() => chooseSubFromSearch(cat, sub)}
                  style={[styles.catRow, { borderBottomColor: theme.semantic.border }]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: theme.semantic.text, fontWeight: '900' }}>
                      {buildSubLabel(sub)}
                    </Text>
                    <Text style={{ color: theme.semantic.textSecondary, fontWeight: '800', fontSize: 12 }}>
                      in {cat.name}
                    </Text>
                  </View>

                  <Text style={{ color: theme.semantic.primary, fontWeight: '900' }}>
                    ✓
                  </Text>
                </Pressable>
              )
            }}
          />
        </View>
      </Modal>

      {/* Subcategory modal (FULL SCREEN + tap category row to reselect category) */}
      <Modal
        visible={showSubCategoryModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeSubCategory}
      >
        <View style={[styles.fullScreenRoot, { backgroundColor: theme.semantic.background, paddingTop: insets.top }]}>
          <View style={[styles.fullHeaderBar, { borderBottomColor: theme.semantic.border }]}>
            <Pressable onPress={closeSubCategory} hitSlop={10}>
              <Text style={{ color: theme.semantic.textSecondary, fontWeight: '800' }}>
                Cancel
              </Text>
            </Pressable>

            <Text style={{ color: theme.semantic.text, fontWeight: '900' }}>
              Subcategory
            </Text>

            <View style={{ width: 56 }} />
          </View>

          <View style={[styles.fullSearchWrap, { borderBottomColor: theme.semantic.border }]}>
            <Pressable
              onPress={reopenCategoryFromSub}
              style={[
                styles.subCategoryTopRow,
                { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }
              ]}
            >
              <Text style={{ color: theme.semantic.textSecondary, fontWeight: '800' }}>
                Category
              </Text>

              <Text style={{ color: theme.semantic.text, fontWeight: '900' }}>
                {selectedCategory ? buildCategoryLabel(selectedCategory) : 'Select'}
              </Text>

              <Text style={{ color: theme.semantic.textSecondary, fontWeight: '900' }}>
                ›
              </Text>
            </Pressable>
          </View>

          <FlatList
            style={{ flex: 1 }}
            data={[{ id: '__none__' }, ...subCategoriesForSelected] as any}
            keyExtractor={(x: any) => x.id}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
            renderItem={({ item: row }: any) => {
              if (row.id === '__none__') {
                const selected = !categoryRef?.subCategoryId
                return (
                  <Pressable
                    onPress={() => chooseSubCategory(undefined)}
                    style={[styles.catRow, { borderBottomColor: theme.semantic.border }]}
                  >
                    <Text style={{ color: theme.semantic.text, fontWeight: '900' }}>
                      None
                    </Text>
                    <Text style={{ color: selected ? theme.semantic.primary : theme.semantic.textSecondary, fontWeight: '900' }}>
                      {selected ? '✓' : ''}
                    </Text>
                  </Pressable>
                )
              }

              const sc = row as SubCategory
              const selected = categoryRef?.subCategoryId === sc.id

              return (
                <Pressable
                  onPress={() => chooseSubCategory(sc.id)}
                  style={[styles.catRow, { borderBottomColor: theme.semantic.border }]}
                >
                  <Text style={{ color: theme.semantic.text, fontWeight: '900' }}>
                    {buildSubLabel(sc)}
                  </Text>
                  <Text style={{ color: selected ? theme.semantic.primary : theme.semantic.textSecondary, fontWeight: '900' }}>
                    {selected ? '✓' : ''}
                  </Text>
                </Pressable>
              )
            }}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    height: 52,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 40
  },

  segmentWrap: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 4,
    flexDirection: 'row',
    gap: 6
  },
  segmentBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14
  },

  heroInput: {
    fontSize: 22,
    fontWeight: '900',
    paddingVertical: 2
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rowLabel: {
    width: 80,
    fontWeight: '800'
  },

  divider: {
    height: 1,
    marginVertical: 12
  },

  noteInput: {
    minHeight: 120,
    fontSize: 16
  },

  receiptRow: {
    flexDirection: 'row',
    gap: 10
  },
  receiptBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  sheet: {
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12
  },

  amountPreview: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12
  },

  key: {
    width: '31.5%',
    height: 58,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },

  searchBox: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8
  },

  catRow: {
    height: 52,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  fullScreenRoot: {
    flex: 1
  },

  fullHeaderBar: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1
  },

  fullSearchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1
  },

  subCategoryTopRow: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12
  },
  keyEmpty: {
    width: '31.5%',
    height: 58
  },
  doneBtn: {
    width: '100%',
    height: 58,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12
  }
})
