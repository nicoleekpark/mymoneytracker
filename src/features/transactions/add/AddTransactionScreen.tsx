import type { UUID } from '@/core/domain/common/uuid'
import type { Transaction, TransactionType } from '@/core/domain/transaction'
import { getActiveAccounts, resolveAccountIdByKey } from '@/core/services/account'
import {
  addPricePoint,
  addTransactionItem,
  deleteTransactionItems,
  getStoreByMerchant,
  getTransactionItems,
} from '@/core/services/price-tracker'
import { addTransaction, getTransactionById, updateTransaction } from '@/core/services/transaction'
import { CategoryIcon, ScalePressable } from '@/shared/components'
import { formatCentsForDisplay } from '@/shared/format/currency'
import { CATEGORIES, CATEGORIES_INDEX } from '@/shared/config'
import { useKeyboardHeight } from '@/shared/hooks'
import { Screen } from '@/shared/layout/Screen'
import { useHoHTheme } from '@/shared/providers'
import {
  getOrderedAccounts,
  SPECIAL_CHIP_KEYS,
  useDataRefreshStore,
  useDraftsStore,
  useLastTransactionStore,
  usePaymentChipsOrderStore,
  usePaymentFrequencyStore,
  useQuickChipsStore,
  useSuggestionsStore,
} from '@/shared/store'
import {
  getScrollContentWithCTAPadding,
  MODAL_ROW_HEIGHT,
  modalStyles,
} from '@/shared/theme/tokens/modal'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { displaySize, fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { FONT_SIZE_TINY } from '@/shared/theme/tokens/viewStyles'
import { muteColor } from '@/shared/utils/contrast'
import { logError } from '@/shared/utils/logger'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { AmountKeypadSheet } from '@/shared/components'
import {
  AnimatedDescriptionPlaceholder,
  AnimatedQuickChip,
  BottomCTABar,
  DateTimePickerModal,
  ItemizedSection,
  PaymentChipsReorderModal,
  QuickChipsEditModal,
  TagSection,
  type ItemEntry,
} from './components'
import { useAccountPicker, useAmountKeypad, useCategoryPicker, useDateTime } from './hooks'
import { useAddTransactionNavStore } from './store/addTransactionNav.store'

// Quick action chip types
type QuickChip = {
  type: 'category' | 'payment' | 'special'
  key: string
  subCategoryKey?: string
  label: string
  icon: string
  color: string
}

const TRANSACTION_TYPES: { key: TransactionType; label: string; disabled?: boolean }[] = [
  { key: 'expense', label: 'Expense' },
  { key: 'income', label: 'Income' },
  { key: 'transfer', label: 'Transfer' },
]

const TOAST_DURATION = 1500

type Props = {
  mode?: 'add' | 'edit'
}

export default function AddTransactionScreen({ mode = 'add' }: Props) {
  const theme = useHoHTheme()
  const params = useLocalSearchParams<{ draftId?: string; transactionId?: string }>()
  const editingDraftId = params.draftId
  const editingTransactionId = mode === 'edit' ? params.transactionId : undefined

  // Track if we're editing an existing transaction
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  // Local toast state (positioned above CTA bar)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastKey, setToastKey] = useState(0)

  // Keyboard height for ScrollView padding (design system hook)
  const keyboardHeight = useKeyboardHeight()

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    setToastMessage(message)
    setToastKey((k) => k + 1)
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), TOAST_DURATION)
  }

  const scrollViewRef = useRef<ScrollView>(null)
  const descInputRef = useRef<TextInput>(null)
  const noteInputRef = useRef<TextInput>(null)
  const merchantInputRef = useRef<TextInput>(null)
  const chipsScrollRef = useRef<ScrollView>(null)
  const accountChipsScrollRef = useRef<ScrollView>(null)

  // Timeout refs for cleanup
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
      if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current)
    }
  }, [])

  // Transaction type
  const [type, setType] = useState<TransactionType>('expense')

  // Form fields
  const [description, setDescription] = useState('')
  const [merchant, setMerchant] = useState('')
  const [note, setNote] = useState('')
  const [receiptUri, setReceiptUri] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])

  // Itemized items
  const [itemizedItems, setItemizedItems] = useState<ItemEntry[]>([])
  const [itemizedExpanded, setItemizedExpanded] = useState(false)

  // Transfer-specific state
  const [toAccountKey, setToAccountKey] = useState<string | null>(null)
  const [hasFee, setHasFee] = useState(false)
  const [feeCents, setFeeCents] = useState(0)
  const [showFeeKeypad, setShowFeeKeypad] = useState(false)
  const [highlightToAccount, setHighlightToAccount] = useState(false)

  // UI state
  const [moreDetailsExpanded, setMoreDetailsExpanded] = useState(false)
  const [showKeypadSheet, setShowKeypadSheet] = useState(false) // Bottom sheet keypad
  const [showChipsEdit, setShowChipsEdit] = useState(false) // Category chips edit modal
  const [showPaymentChipsReorder, setShowPaymentChipsReorder] = useState(false) // Payment chips reorder modal
  const [isEstimated, setIsEstimated] = useState(false) // Amount is approximate
  const [descriptionFocused, setDescriptionFocused] = useState(false)
  const [highlightedField, setHighlightedField] = useState<'category' | 'account' | null>(null)
  const [highlightIdentifier, setHighlightIdentifier] = useState(false) // Highlight description + merchant
  const [highlightAccount, setHighlightAccount] = useState(false) // Highlight account when validation fails
  const [isLoadingEdit, setIsLoadingEdit] = useState(false) // Loading state for edit mode

  // Quick chips store
  const { expenseChips, incomeChips } = useQuickChipsStore()

  // Last transaction store (for Repeat Last feature)
  const { lastTransaction, setLastTransaction } = useLastTransactionStore()

  // Draft store
  const addDraft = useDraftsStore((s) => s.addDraft)
  const updateDraft = useDraftsStore((s) => s.updateDraft)
  const removeDraft = useDraftsStore((s) => s.removeDraft)
  const getDraft = useDraftsStore((s) => s.getDraft)

  // Suggestions store
  const { recordItem, recordMerchant } = useSuggestionsStore()

  // Payment frequency store (for tracking usage)
  const { recordUsage } = usePaymentFrequencyStore()

  // Payment chips order store
  const { orderedKeys: paymentChipsOrder } = usePaymentChipsOrderStore()

  // Hooks for complex state
  const amount = useAmountKeypad()
  const account = useAccountPicker()
  const category = useCategoryPicker(type)
  const dateTime = useDateTime()

  // Category chips - From store (user customizable)
  const categoryChips = useMemo((): QuickChip[] => {
    const chipConfigs = type === 'expense' ? expenseChips : incomeChips
    const chips: QuickChip[] = []

    chipConfigs.forEach((config) => {
      if (config.type === 'category') {
        const cat = CATEGORIES.find((c) => c.key === config.key && c.type === type)
        if (cat) {
          // Check for subcategory
          if (config.subCategoryKey) {
            const sub = cat.subCategories?.find((s) => s.key === config.subCategoryKey)
            if (sub) {
              chips.push({
                type: 'category',
                key: cat.key,
                subCategoryKey: sub.key,
                label: `${cat.name} › ${sub.name}`,
                icon: sub.icon,
                color: sub.color,
              })
            }
          } else {
            chips.push({
              type: 'category',
              key: cat.key,
              label: cat.name,
              icon: cat.icon,
              color: cat.color,
            })
          }
        }
      }
    })

    return chips
  }, [type, expenseChips, incomeChips])

  // Account chips - Show all accounts as quick picks (in user-defined order)
  const orderedAccounts = useMemo(() => {
    return getOrderedAccounts(account.accounts, paymentChipsOrder)
  }, [account.accounts, paymentChipsOrder])

  const accountChips = useMemo((): QuickChip[] => {
    return orderedAccounts.map((acc) => ({
      type: 'payment' as const,
      key: acc.key,
      label: acc.name,
      icon: acc.kind === 'credit_card' ? 'credit-card' : acc.kind === 'cash' ? 'money' : 'bank',
      color: '#5A6A6A',
    }))
  }, [orderedAccounts])

  // Transfer "To" account display
  const toAccountDisplay = useMemo(() => {
    if (!toAccountKey) return null
    const acc = account.accounts.find((a) => a.key === toAccountKey)
    return acc ? acc.name : null
  }, [toAccountKey, account.accounts])

  // Fee display in dollars
  const feeDisplay = useMemo(() => {
    if (!hasFee || feeCents <= 0) return null
    return formatCentsForDisplay(feeCents)
  }, [hasFee, feeCents])

  // Load draft data if editing
  useEffect(() => {
    if (editingDraftId) {
      const draft = getDraft(editingDraftId)
      if (draft) {
        setType(draft.type)
        setDescription(draft.item || '')
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
        if (draft.tags && draft.tags.length > 0) {
          setTags(draft.tags)
        }
        // Expand more details if draft has any optional fields
        if (draft.receiptUri || (draft.tags && draft.tags.length > 0)) {
          setMoreDetailsExpanded(true)
        }
      }
    }
  }, [editingDraftId])

  // Load transaction data if editing existing transaction
  useEffect(() => {
    if (!editingTransactionId) return

    let cancelled = false
    setIsLoadingEdit(true)

    getTransactionById(editingTransactionId)
      .then((tx) => {
        if (cancelled || !tx) return

        setEditingTransaction(tx)
        setType(tx.type)
        setDescription(tx.item || '')
        setMerchant(tx.merchant || '')
        setNote(tx.note || '')

        // Convert amount from dollars to cents
        const amountCents = Math.round(tx.money.amount * 100)
        amount.setAmountCents(amountCents)

        // Find account key by ID
        const accounts = getActiveAccounts()
        const acc = accounts.find((a) => a.id === tx.accountId)
        if (acc) {
          account.setAccountKey(acc.key)
        }

        // Set category
        if (tx.category) {
          category.setCategoryRef({
            type: tx.type,
            categoryKey: tx.category.categoryKey ?? '',
            subCategoryKey: tx.category.subCategoryKey,
          })
        }

        // Set date
        dateTime.setOccurredAt(tx.occurredAt)

        // Set tags
        if (tx.tags && tx.tags.length > 0) {
          setTags(tx.tags)
        }

        // Set estimated
        if (tx.isEstimated) {
          setIsEstimated(true)
        }

        // Load transaction items if any
        const txItems = getTransactionItems(editingTransactionId)
        if (txItems.length > 0) {
          setItemizedItems(
            txItems.map((ti) => ({
              id: ti.id,
              name: ti.name,
              priceCents: ti.priceCents,
              quantity: ti.quantity,
              unit: ti.unit,
              itemId: ti.itemId,
            }))
          )
          setItemizedExpanded(true)
        }

        // Expand more details if has optional fields
        if (tx.tags && tx.tags.length > 0) {
          setMoreDetailsExpanded(true)
        }

        // Scroll to top after loading edit data
        scrollTimeoutRef.current = setTimeout(() => {
          if (!cancelled) {
            scrollViewRef.current?.scrollTo({ y: 0, animated: false })
          }
        }, 150)
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingEdit(false)
        }
      })

    return () => {
      cancelled = true
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [editingTransactionId])

  // Track if we're in initial load (to skip auto-scroll)
  const isInitialLoadRef = useRef(true)

  // Auto-scroll when More Details is expanded (but not on initial edit load)
  useEffect(() => {
    if (moreDetailsExpanded && scrollViewRef.current) {
      // Skip auto-scroll on initial load (when editing)
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false
        return
      }
      // Small delay to let the content render
      const timeoutId = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [moreDetailsExpanded])

  // Amount color - neutral (like Assets view)
  const amountColor = theme.semantic.text

  // Pulse animation for empty amount
  const isAmountEmpty = !amount.amountCents || amount.amountCents === 0
  const pulseOpacity = useSharedValue(1)

  useEffect(() => {
    if (isAmountEmpty) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // infinite
        false
      )
    } else {
      pulseOpacity.value = withTiming(1, { duration: 200 })
    }
  }, [isAmountEmpty, pulseOpacity])

  const amountAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }))

  // Validation - Required: amount, date, account, type
  const canSave = useMemo(() => {
    const hasAmount = Number.isFinite(amount.amountCents) && amount.amountCents > 0
    return hasAmount
  }, [amount.amountCents])

  // Check if more details has any content
  const moreDetailsCount = useMemo(() => {
    let count = 0
    if (tags.length > 0) count++
    if (receiptUri) count++
    return count
  }, [tags, receiptUri])

  const onCancel = () => {
    // Simply close without saving - user must explicitly save as draft
    router.back()
  }

  const onSave = async () => {
    const cleanedDescription = description.trim()
    const cleanedMerchant = merchant.trim()
    const cleanedNote = note.trim()

    if (!Number.isFinite(amount.amountCents) || amount.amountCents <= 0) {
      showToast('Please enter an amount')
      return
    }

    // Transfer-specific validation
    if (type === 'transfer') {
      if (!account.accountKey) {
        showToast('Select source account')
        setHighlightAccount(true)
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
        highlightTimeoutRef.current = setTimeout(() => setHighlightAccount(false), 2000)
        return
      }
      if (!toAccountKey) {
        showToast('Select destination account')
        setHighlightToAccount(true)
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
        highlightTimeoutRef.current = setTimeout(() => setHighlightToAccount(false), 2000)
        return
      }
      if (account.accountKey === toAccountKey) {
        showToast('Cannot transfer to same account')
        return
      }
    } else {
      // Require either description or merchant for scannable transaction list
      if (!cleanedDescription && !cleanedMerchant) {
        showToast('Add a description or merchant')
        setHighlightIdentifier(true)
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current)
        }
        highlightTimeoutRef.current = setTimeout(() => setHighlightIdentifier(false), 2000)
        return
      }

      if (!account.accountKey) {
        showToast('Please select a payment method')
        setHighlightAccount(true)
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current)
        }
        highlightTimeoutRef.current = setTimeout(() => setHighlightAccount(false), 2000)
        return
      }
    }

    // Resolve account IDs
    let fromAccountId: UUID | undefined
    let toAccountId: UUID | undefined
    let accountId: UUID | undefined

    try {
      if (type === 'transfer') {
        fromAccountId = resolveAccountIdByKey(account.accountKey!)
        toAccountId = resolveAccountIdByKey(toAccountKey!)
      } else {
        accountId = resolveAccountIdByKey(account.accountKey!)
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Invalid account'
      showToast(message)
      return
    }

    if (category.categoryRef) {
      const typeMap = CATEGORIES_INDEX[category.categoryRef.type]
      const subKeys = typeMap?.[category.categoryRef.categoryKey]
      const ok =
        !!subKeys &&
        (!category.categoryRef.subCategoryKey ||
          subKeys.includes(category.categoryRef.subCategoryKey))

      if (!ok) {
        showToast('Please re-select category')
        return
      }
    }

    try {
      // Build transaction input based on type
      const transactionInput =
        type === 'transfer'
          ? {
              type: 'transfer' as const,
              item: cleanedDescription || undefined,
              amount: amount.amountDollars,
              fromAccountId: fromAccountId!,
              toAccountId: toAccountId!,
              occurredAt: dateTime.occurredAt,
              note: cleanedNote || undefined,
              tags: tags.length > 0 ? tags : undefined,
              isEstimated: isEstimated || undefined,
            }
          : {
              type,
              item: cleanedDescription || undefined,
              amount: amount.amountDollars,
              category: category.categoryRef ?? undefined,
              accountId: accountId!,
              occurredAt: dateTime.occurredAt,
              merchant: cleanedMerchant || undefined,
              note: cleanedNote || undefined,
              tags: tags.length > 0 ? tags : undefined,
              isEstimated: isEstimated || undefined,
            }

      let savedTransactionId: UUID | undefined

      if (editingTransaction && editingTransactionId) {
        // Update existing transaction
        await updateTransaction(CATEGORIES_INDEX, editingTransactionId, transactionInput)
        savedTransactionId = editingTransactionId
        // Delete existing items to replace with new ones
        deleteTransactionItems(editingTransactionId)
      } else {
        // Create new transaction
        const newTx = await addTransaction(CATEGORIES_INDEX, transactionInput)
        savedTransactionId = newTx?.id

        // Create linked fee expense when fee is added
        if (hasFee && feeCents > 0 && savedTransactionId) {
          const feeAccountId = type === 'transfer' ? fromAccountId! : accountId!
          const feeItem = type === 'transfer' ? 'Transfer Fee' : 'Service Fee'
          await addTransaction(CATEGORIES_INDEX, {
            type: 'expense',
            item: feeItem,
            amount: feeCents / 100,
            accountId: feeAccountId,
            category: { type: 'expense', categoryKey: 'fees', subCategoryKey: 'service_fees' },
            occurredAt: dateTime.occurredAt,
            parentTransactionId: savedTransactionId,
          })
        }
      }

      // Save transaction items if any
      if (savedTransactionId && itemizedItems.length > 0) {
        // Find or create store from merchant
        const store = cleanedMerchant ? getStoreByMerchant(cleanedMerchant) : null

        itemizedItems.forEach((item, index) => {
          // Save item if it has name OR price (not requiring both)
          if (item.name.trim() || item.priceCents > 0) {
            // Add transaction item
            addTransactionItem({
              transactionId: savedTransactionId as UUID,
              itemId: item.itemId,
              name: item.name.trim() || 'Item',
              priceCents: item.priceCents,
              quantity: item.quantity,
              unit: item.unit,
              sortOrder: index,
            })

            // Create price point if we have a store, item is linked, and has price
            if (store && item.itemId && item.priceCents > 0) {
              addPricePoint({
                itemId: item.itemId,
                storeId: store.id,
                priceCents: item.priceCents,
                quantity: item.quantity,
                occurredAt: dateTime.occurredAt,
                transactionId: savedTransactionId,
              })
            }
          }
        })
      }

      if (cleanedDescription) {
        recordItem(cleanedDescription)
      }
      if (cleanedMerchant) {
        recordMerchant(cleanedMerchant)
      }

      // Save last transaction for "Repeat Last" feature (only for new transactions)
      if (!editingTransaction) {
        setLastTransaction({
          type,
          amountCents: amount.amountCents,
          amountDisplay: amount.amountDisplay,
          description: cleanedDescription || undefined,
          categoryKey: category.categoryRef?.categoryKey,
          subCategoryKey: category.categoryRef?.subCategoryKey,
          accountKey: account.accountKey ?? undefined,
          savedAt: new Date().toISOString(),
        })
      }

      // Record payment method usage for auto-selection
      if (account.accountKey) {
        recordUsage(account.accountKey)
      }

      if (editingDraftId) {
        removeDraft(editingDraftId)
      }

      // Invalidate dashboard data so it refreshes when modal closes
      useDataRefreshStore.getState().invalidateTransactions()

      // Show toast then close modal
      const toastMsg = editingTransaction
        ? `$${amount.amountDisplay} updated`
        : `$${amount.amountDisplay} added`
      showToast(toastMsg)
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current)
      }
      navigationTimeoutRef.current = setTimeout(() => router.back(), 800)
    } catch (e: unknown) {
      logError('AddTransaction', e)
      const message = e instanceof Error ? e.message : 'Save failed'
      // 7A: Toast with error, keep form open
      showToast(message)
    }
  }

  const onSaveDraft = () => {
    if (type === 'transfer') {
      showToast('Transfer coming soon')
      return
    }

    const cleanedDescription = description.trim()
    const cleanedNote = note.trim()

    if (!cleanedDescription && (!Number.isFinite(amount.amountCents) || amount.amountCents <= 0)) {
      showToast('Enter an item or amount first')
      return
    }

    const draftData = {
      type,
      item: cleanedDescription,
      amountCents: amount.amountCents,
      merchant: merchant.trim() || undefined,
      note: cleanedNote || undefined,
      categoryRef: category.categoryRef ?? undefined,
      accountKey: account.accountKey ?? undefined,
      occurredAt: dateTime.occurredAt.toISOString(),
      receiptUri: receiptUri ?? undefined,
    }

    if (editingDraftId) {
      updateDraft(editingDraftId, draftData)
    } else {
      addDraft(draftData)
    }

    // Show toast then close modal
    showToast('Saved as draft')
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current)
    }
    navigationTimeoutRef.current = setTimeout(() => router.back(), 800)
  }

  // Reset form for "Add Another"
  const resetForm = () => {
    amount.clearAmount()
    setDescription('')
    setMerchant('')
    setNote('')
    setReceiptUri(null)
    setTags([])
    setItemizedItems([])
    setItemizedExpanded(false)
    category.resetCategory()
    setMoreDetailsExpanded(false)
    setIsEstimated(false)
    // Reset transfer state
    setToAccountKey(null)
    setHasFee(false)
    setFeeCents(0)
  }

  // Save and add another transaction
  const onSaveAndAddAnother = async () => {
    const cleanedDescription = description.trim()
    const cleanedMerchant = merchant.trim()
    const cleanedNote = note.trim()

    if (!Number.isFinite(amount.amountCents) || amount.amountCents <= 0) {
      showToast('Please enter an amount')
      return
    }

    // Transfer-specific validation
    if (type === 'transfer') {
      if (!account.accountKey) {
        showToast('Select source account')
        setHighlightAccount(true)
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
        highlightTimeoutRef.current = setTimeout(() => setHighlightAccount(false), 2000)
        return
      }
      if (!toAccountKey) {
        showToast('Select destination account')
        setHighlightToAccount(true)
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
        highlightTimeoutRef.current = setTimeout(() => setHighlightToAccount(false), 2000)
        return
      }
      if (account.accountKey === toAccountKey) {
        showToast('Cannot transfer to same account')
        return
      }
    } else {
      if (!account.accountKey) {
        showToast('Please select a payment method')
        setHighlightAccount(true)
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current)
        }
        highlightTimeoutRef.current = setTimeout(() => setHighlightAccount(false), 2000)
        return
      }
    }

    // Resolve account IDs
    let fromAccountId: UUID | undefined
    let toAccountIdResolved: UUID | undefined
    let accountId: UUID | undefined

    try {
      if (type === 'transfer') {
        fromAccountId = resolveAccountIdByKey(account.accountKey!)
        toAccountIdResolved = resolveAccountIdByKey(toAccountKey!)
      } else {
        accountId = resolveAccountIdByKey(account.accountKey!)
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Invalid account'
      showToast(message)
      return
    }

    if (category.categoryRef) {
      const typeMap = CATEGORIES_INDEX[category.categoryRef.type]
      const subKeys = typeMap?.[category.categoryRef.categoryKey]
      const ok =
        !!subKeys &&
        (!category.categoryRef.subCategoryKey ||
          subKeys.includes(category.categoryRef.subCategoryKey))

      if (!ok) {
        showToast('Please re-select category')
        return
      }
    }

    try {
      // Build transaction input based on type
      const transactionInput =
        type === 'transfer'
          ? {
              type: 'transfer' as const,
              item: cleanedDescription || undefined,
              amount: amount.amountDollars,
              fromAccountId: fromAccountId!,
              toAccountId: toAccountIdResolved!,
              occurredAt: dateTime.occurredAt,
              note: cleanedNote || undefined,
              tags: tags.length > 0 ? tags : undefined,
              isEstimated: isEstimated || undefined,
            }
          : {
              type,
              item: cleanedDescription || undefined,
              amount: amount.amountDollars,
              category: category.categoryRef ?? undefined,
              accountId: accountId!,
              occurredAt: dateTime.occurredAt,
              merchant: cleanedMerchant || undefined,
              note: cleanedNote || undefined,
              tags: tags.length > 0 ? tags : undefined,
              isEstimated: isEstimated || undefined,
            }

      const newTx = await addTransaction(CATEGORIES_INDEX, transactionInput)

      // Create linked fee expense when fee is added
      if (hasFee && feeCents > 0 && newTx?.id) {
        const feeAccountId = type === 'transfer' ? fromAccountId! : accountId!
        const feeItem = type === 'transfer' ? 'Transfer Fee' : 'Service Fee'
        await addTransaction(CATEGORIES_INDEX, {
          type: 'expense',
          item: feeItem,
          amount: feeCents / 100,
          accountId: feeAccountId,
          category: { type: 'expense', categoryKey: 'fees', subCategoryKey: 'service_fees' },
          occurredAt: dateTime.occurredAt,
          parentTransactionId: newTx.id,
        })
      }

      // Save transaction items if any
      if (newTx?.id && itemizedItems.length > 0) {
        const store = cleanedMerchant ? getStoreByMerchant(cleanedMerchant) : null

        itemizedItems.forEach((item, index) => {
          // Save item if it has name OR price (not requiring both)
          if (item.name.trim() || item.priceCents > 0) {
            addTransactionItem({
              transactionId: newTx.id,
              itemId: item.itemId,
              name: item.name.trim() || 'Item',
              priceCents: item.priceCents,
              quantity: item.quantity,
              unit: item.unit,
              sortOrder: index,
            })

            // Create price point if we have a store, item is linked, and has price
            if (store && item.itemId && item.priceCents > 0) {
              addPricePoint({
                itemId: item.itemId,
                storeId: store.id,
                priceCents: item.priceCents,
                quantity: item.quantity,
                occurredAt: dateTime.occurredAt,
                transactionId: newTx.id,
              })
            }
          }
        })
      }

      if (cleanedDescription) {
        recordItem(cleanedDescription)
      }
      if (cleanedMerchant) {
        recordMerchant(cleanedMerchant)
      }

      // Save last transaction for "Repeat Last" feature
      setLastTransaction({
        type,
        amountCents: amount.amountCents,
        amountDisplay: amount.amountDisplay,
        description: cleanedDescription || undefined,
        categoryKey: category.categoryRef?.categoryKey,
        subCategoryKey: category.categoryRef?.subCategoryKey,
        accountKey: account.accountKey ?? undefined,
        savedAt: new Date().toISOString(),
      })

      // Record payment method usage for auto-selection
      if (account.accountKey) {
        recordUsage(account.accountKey)
      }

      // Show toast and reset form for next entry
      showToast(`$${amount.amountDisplay} added`)
      resetForm()
    } catch (e: unknown) {
      logError('AddTransaction', e)
      const message = e instanceof Error ? e.message : 'Save failed'
      showToast(message)
    }
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
      Alert.alert('Receipt', undefined, [
        { text: 'Remove', style: 'destructive', onPress: () => setReceiptUri(null) },
        { text: 'Cancel', style: 'cancel' },
      ])
    } else {
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
      ? category.selectedCategory.subCategories?.find((s) => s.key === subKey)
      : null

    return {
      icon: sub?.icon ?? category.selectedCategory.icon,
      color: sub?.color ?? category.selectedCategory.color,
      label: sub
        ? `${category.selectedCategory.name} › ${sub.name}`
        : category.selectedCategory.name,
    }
  }, [category.selectedCategory, category.categoryRef])

  // Trigger brief highlight on parent field row
  const triggerHighlight = (field: 'category' | 'account') => {
    setHighlightedField(field)
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current)
    }
    highlightTimeoutRef.current = setTimeout(() => setHighlightedField(null), 250)
  }

  // Quick chip selection handler
  const onQuickChipPress = (chip: QuickChip) => {
    if (chip.type === 'special') {
      if (chip.key === SPECIAL_CHIP_KEYS.REPEAT_LAST && lastTransaction) {
        // Fill form with last transaction data
        setType(lastTransaction.type)
        amount.setAmountCents(lastTransaction.amountCents)
        if (lastTransaction.description) {
          setDescription(lastTransaction.description)
        }
        if (lastTransaction.categoryKey) {
          const fullCategory = CATEGORIES.find((c) => c.key === lastTransaction.categoryKey)
          if (fullCategory) {
            category.chooseCategory(fullCategory)
            if (lastTransaction.subCategoryKey) {
              category.chooseSubCategory(lastTransaction.subCategoryKey)
            }
          }
        }
        if (lastTransaction.accountKey) {
          account.chooseAccount(lastTransaction.accountKey)
        }
      }
    } else if (chip.type === 'category') {
      // Find the full category object and select it
      const fullCategory = CATEGORIES.find((c) => c.key === chip.key)
      if (fullCategory) {
        if (chip.subCategoryKey) {
          // For subcategory chips, set both category and subcategory
          category.chooseCategory(fullCategory)
          category.chooseSubCategory(chip.subCategoryKey)
        } else {
          category.chooseCategory(fullCategory)
        }
        triggerHighlight('category')
      }
    } else if (chip.type === 'payment') {
      // Select payment method directly
      account.chooseAccount(chip.key)
      triggerHighlight('account')
    }
  }

  // Check if a quick chip is selected
  const isChipSelected = (chip: QuickChip) => {
    // Special chips are never "selected" in the traditional sense
    if (chip.type === 'special') {
      return false
    } else if (chip.type === 'category') {
      const catMatch = category.categoryRef?.categoryKey === chip.key
      if (chip.subCategoryKey) {
        // For subcategory chips, both category and subcategory must match
        return catMatch && category.categoryRef?.subCategoryKey === chip.subCategoryKey
      }
      // For parent category chips, match if category matches and no subcategory is set
      return catMatch && !category.categoryRef?.subCategoryKey
    } else if (chip.type === 'payment') {
      return account.accountKey === chip.key
    }
    return false
  }

  return (
    <Screen
      edges={[]}
      padded={false}
      topPadding={false}
      style={{ flex: 1 }}
      contentStyle={{ flex: 1 }}
    >
      {/* Drag Handle */}
      <View style={styles.dragHandleContainer}>
        <View style={[styles.dragHandle, { backgroundColor: theme.semantic.border }]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onCancel} hitSlop={12} style={styles.cancelButton}>
          <Text style={[styles.cancelText, { color: theme.semantic.textSecondary }]}>Cancel</Text>
        </Pressable>
      </View>

      {/* Type Tabs */}
      <View style={[styles.typeTabs, { borderBottomColor: theme.semantic.border }]}>
        {TRANSACTION_TYPES.map((t) => {
          const selected = t.key === type
          const isDisabled = t.disabled === true
          return (
            <Pressable
              key={t.key}
              onPress={() => {
                if (isDisabled) return
                setType(t.key)
                category.resetCategory()
              }}
              style={[
                styles.typeTab,
                {
                  borderBottomColor:
                    selected && !isDisabled ? theme.semantic.primary : 'transparent',
                },
                isDisabled && { opacity: 0.5 },
              ]}
            >
              <View style={styles.typeTabContent}>
                <Text
                  style={[
                    styles.typeTabText,
                    {
                      color: isDisabled
                        ? theme.semantic.textSecondary
                        : selected
                          ? theme.semantic.text
                          : theme.semantic.textSecondary,
                      fontWeight: selected && !isDisabled ? '700' : '500',
                    },
                  ]}
                >
                  {t.label}
                </Text>
                {isDisabled && (
                  <View
                    style={[styles.comingSoonBadge, { backgroundColor: theme.semantic.surfaceAlt }]}
                  >
                    <Text style={[styles.comingSoonText, { color: theme.semantic.textSecondary }]}>
                      Soon
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          )
        })}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          // Note: safeAreaBottom=0 because iOS card-style modals already handle safe area
          { paddingBottom: getScrollContentWithCTAPadding(0, keyboardHeight) },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        {/* Loading state for edit mode */}
        {isLoadingEdit && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.semantic.primary} />
            <Text style={[styles.loadingText, { color: theme.semantic.textSecondary }]}>
              Loading transaction...
            </Text>
          </View>
        )}

        {/* Hero Amount - Tap to open keypad sheet */}
        <View style={styles.heroAmount}>
          <Pressable onPress={() => setShowKeypadSheet(true)} style={styles.amountTouchable}>
            <Animated.Text
              style={[styles.amountValue, { color: amountColor }, amountAnimatedStyle]}
            >
              {isEstimated ? '~' : ''}${amount.amountDisplay}
            </Animated.Text>
            {isEstimated && (
              <View
                style={[
                  styles.estimatedBadge,
                  {
                    backgroundColor: theme.semantic.warningSoft,
                    borderColor: theme.semantic.warning + '40',
                  },
                ]}
              >
                <Text style={[styles.estimatedBadgeText, { color: theme.semantic.warning }]}>
                  Estimated
                </Text>
              </View>
            )}
          </Pressable>

          {/* Description subtitle - Option A style */}
          <View style={styles.descSubtitle}>
            <AnimatedDescriptionPlaceholder
              isActive={!description && !descriptionFocused}
              color={theme.semantic.textSecondary}
            />
            <TextInput
              ref={descInputRef}
              value={description}
              onChangeText={setDescription}
              onFocus={() => setDescriptionFocused(true)}
              onBlur={() => setDescriptionFocused(false)}
              placeholderTextColor={theme.semantic.textSecondary}
              style={[
                styles.descSubtitleInput,
                {
                  color: theme.semantic.text,
                  borderBottomColor: highlightIdentifier
                    ? theme.semantic.warning
                    : description
                      ? theme.semantic.primary
                      : theme.semantic.border,
                },
              ]}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Fee Section - for all transaction types */}
        <View style={styles.fieldGroup}>
          <Pressable
            onPress={() => setHasFee(!hasFee)}
            style={[styles.fieldRow, styles.fieldRowNoBorder, { justifyContent: 'center' }]}
          >
            <View style={styles.checkboxRow}>
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: hasFee ? theme.semantic.primary : theme.semantic.border,
                    backgroundColor: hasFee ? theme.semantic.primary : 'transparent',
                  },
                ]}
              >
                {hasFee && (
                  <FontAwesome name="check" size={10} color={theme.semantic.onPrimary} />
                )}
              </View>
              <Text style={[styles.checkboxLabel, { color: theme.semantic.textSecondary }]}>
                Add fee
              </Text>
            </View>
          </Pressable>

          {/* Fee input (shown when checkbox is checked) */}
          {hasFee && (
            <>
              <Pressable
                onPress={() => setShowFeeKeypad(true)}
                style={[styles.fieldRow, styles.fieldRowNoBorder, { paddingLeft: spacing.xl }]}
              >
                <Text style={[styles.fieldLabel, { color: theme.semantic.textSecondary }]}>
                  Fee
                </Text>
                <Text style={[styles.fieldValue, { color: theme.semantic.text }]}>
                  {feeDisplay ? `$${feeDisplay}` : '$0.00'}
                </Text>
                {feeCents > 0 && (
                  <Pressable
                    onPress={() => setFeeCents(0)}
                    hitSlop={8}
                    style={styles.clearButton}
                  >
                    <FontAwesome
                      name="times-circle"
                      size={16}
                      color={theme.semantic.textSecondary}
                    />
                  </Pressable>
                )}
              </Pressable>
              <View style={[styles.feeHint, { paddingLeft: spacing.xl }]}>
                <Text style={[styles.feeHintText, { color: theme.semantic.textSecondary }]}>
                  Recorded separately · Total: ${formatCentsForDisplay(amount.amountCents + feeCents)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Transfer Fields */}
        {type === 'transfer' && (
          <View style={styles.fieldGroup}>
            {/* From Account */}
            <View
              style={[
                styles.fieldRow,
                styles.fieldRowNoBorder,
                highlightAccount && { backgroundColor: theme.semantic.warning + '15' },
              ]}
            >
              <Text
                style={[
                  styles.fieldLabel,
                  {
                    color: account.accountKey ? theme.semantic.textSecondary : theme.semantic.text,
                  },
                ]}
              >
                From
              </Text>
              <Pressable
                onPress={account.navigateToAccountSelection}
                style={styles.fieldValueTouchable}
              >
                {account.selectedAccount ? (
                  <Text style={[styles.fieldValue, { color: theme.semantic.text }]}>
                    {account.selectedAccount.name}
                  </Text>
                ) : (
                  <Text style={[styles.fieldPlaceholder, { color: theme.semantic.primary }]}>
                    Select account
                  </Text>
                )}
              </Pressable>
              {account.accountKey && (
                <Pressable onPress={account.clearAccount} hitSlop={8} style={styles.clearButton}>
                  <FontAwesome name="times-circle" size={16} color={theme.semantic.textSecondary} />
                </Pressable>
              )}
            </View>

            {/* To Account */}
            <View
              style={[
                styles.fieldRow,
                styles.fieldRowNoBorder,
                highlightToAccount && { backgroundColor: theme.semantic.warning + '15' },
              ]}
            >
              <Text
                style={[
                  styles.fieldLabel,
                  { color: toAccountKey ? theme.semantic.textSecondary : theme.semantic.text },
                ]}
              >
                To
              </Text>
              <Pressable
                onPress={() => {
                  // Use same navigation but with different callback
                  Keyboard.dismiss()
                  const { openAccountSelection } = useAddTransactionNavStore.getState()
                  openAccountSelection(account.accounts, toAccountKey, {
                    onChooseAccount: (key) => setToAccountKey(key),
                    onAddAccount: () => account.refreshAccounts(),
                  })
                  router.push('/(modal)/add-transaction/account-selection')
                }}
                style={styles.fieldValueTouchable}
              >
                {toAccountDisplay ? (
                  <Text style={[styles.fieldValue, { color: theme.semantic.text }]}>
                    {toAccountDisplay}
                  </Text>
                ) : (
                  <Text style={[styles.fieldPlaceholder, { color: theme.semantic.primary }]}>
                    Select account
                  </Text>
                )}
              </Pressable>
              {toAccountKey && (
                <Pressable
                  onPress={() => setToAccountKey(null)}
                  hitSlop={8}
                  style={styles.clearButton}
                >
                  <FontAwesome name="times-circle" size={16} color={theme.semantic.textSecondary} />
                </Pressable>
              )}
            </View>
            <View style={[styles.sectionDivider, { backgroundColor: theme.semantic.border }]} />

            {/* Date */}
            <View style={[styles.fieldRow, styles.fieldRowNoBorder]}>
              <Text style={[styles.fieldLabel, { color: theme.semantic.textSecondary }]}>Date</Text>
              <Pressable onPress={dateTime.openDateTimeModal} style={styles.fieldValueTouchable}>
                <Text style={[styles.fieldValue, { color: theme.semantic.text }]}>
                  {dateTime.dateDisplay}
                </Text>
                <Text style={[styles.fieldValueSecondary, { color: theme.semantic.textSecondary }]}>
                  {' '}
                  · {dateTime.timeDisplay}
                </Text>
              </Pressable>
            </View>
            <View style={[styles.sectionDivider, { backgroundColor: theme.semantic.border }]} />

            {/* Note (optional) */}
            <View style={[styles.fieldRow, styles.fieldRowNoBorder, { paddingRight: 0 }]}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: note ? theme.semantic.textSecondary : theme.semantic.text },
                ]}
              >
                Note <Text style={styles.optionalLabel}>(optional)</Text>
              </Text>
              <View style={modalStyles.fieldInputWrapper}>
                {!note && (
                  <Text
                    style={[
                      styles.fieldPlaceholder,
                      modalStyles.fieldInputPlaceholder,
                      { color: theme.semantic.textSecondary },
                    ]}
                  >
                    Add note
                  </Text>
                )}
                <TextInput
                  ref={noteInputRef}
                  value={note}
                  onChangeText={setNote}
                  style={[modalStyles.fieldInput, { color: theme.semantic.text }]}
                  autoCapitalize="sentences"
                  multiline
                />
              </View>
            </View>
          </View>
        )}

        {/* Essential Fields */}
        {type !== 'transfer' && (
          <View style={styles.fieldGroup}>
            {/* Merchant (optional) */}
            <View
              style={[
                styles.fieldRow,
                styles.fieldRowNoBorder,
                { paddingRight: 0 },
                highlightIdentifier && { backgroundColor: theme.semantic.warning + '15' },
              ]}
            >
              <Text
                style={[
                  styles.fieldLabel,
                  { color: merchant ? theme.semantic.textSecondary : theme.semantic.text },
                ]}
              >
                Merchant <Text style={styles.optionalLabel}>(optional)</Text>
              </Text>
              <View style={modalStyles.fieldInputWrapper}>
                {!merchant && (
                  <Text
                    style={[
                      styles.fieldPlaceholder,
                      modalStyles.fieldInputPlaceholder,
                      { color: theme.semantic.textSecondary },
                    ]}
                  >
                    Add merchant
                  </Text>
                )}
                <TextInput
                  ref={merchantInputRef}
                  value={merchant}
                  onChangeText={setMerchant}
                  style={[modalStyles.fieldInput, { color: theme.semantic.text }]}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>
            <View style={[styles.sectionDivider, { backgroundColor: theme.semantic.border }]} />

            {/* Category (optional) */}
            <View
              style={[
                styles.fieldRow,
                styles.fieldRowNoBorder,
                highlightedField === 'category' && {
                  backgroundColor: theme.semantic.primary + '15',
                },
              ]}
            >
              <Text
                style={[
                  styles.fieldLabel,
                  { color: categoryDisplay ? theme.semantic.textSecondary : theme.semantic.text },
                ]}
              >
                Category <Text style={styles.optionalLabel}>(optional)</Text>
              </Text>
              <Pressable
                onPress={category.navigateToCategorySelection}
                style={styles.fieldValueTouchable}
              >
                {categoryDisplay ? (
                  <View style={styles.fieldValueRow}>
                    <CategoryIcon
                      name={categoryDisplay.icon}
                      size={16}
                      color={categoryDisplay.color}
                    />
                    <Text style={[styles.fieldValue, { color: theme.semantic.text }]}>
                      {categoryDisplay.label}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.fieldPlaceholder, { color: theme.semantic.primary }]}>
                    Add category
                  </Text>
                )}
              </Pressable>
              {categoryDisplay && (
                <Pressable onPress={category.resetCategory} hitSlop={8} style={styles.clearButton}>
                  <FontAwesome name="times-circle" size={16} color={theme.semantic.textSecondary} />
                </Pressable>
              )}
            </View>

            {/* Category chips */}
            {categoryChips.length > 0 && (
              <ScrollView
                ref={chipsScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.fieldChipsRow}
                contentContainerStyle={styles.fieldChipsContent}
              >
                {categoryChips.map((chip) => {
                  const selected = isChipSelected(chip)
                  const mutedColor = muteColor(chip.color, 0.35, 0.05)
                  return (
                    <AnimatedQuickChip
                      key={`${chip.type}-${chip.key}-${chip.subCategoryKey ?? ''}`}
                      label={chip.label}
                      icon={chip.icon}
                      iconColor={selected ? theme.semantic.primary : mutedColor}
                      selected={selected}
                      selectedColor={theme.semantic.primary + '20'}
                      surfaceColor={theme.semantic.surfaceAlt}
                      borderColor={theme.semantic.border}
                      selectedBorderColor={theme.semantic.primary}
                      textColor={selected ? theme.semantic.primary : theme.semantic.textSecondary}
                      onPress={() => onQuickChipPress(chip)}
                    />
                  )
                })}
                <ScalePressable
                  onPress={() => setShowChipsEdit(true)}
                  style={[styles.quickChipEdit, { borderColor: theme.semantic.border }]}
                >
                  <FontAwesome name="pencil" size={12} color={theme.semantic.textSecondary} />
                </ScalePressable>
              </ScrollView>
            )}
            <View style={[styles.sectionDivider, { backgroundColor: theme.semantic.border }]} />

            {/* Paid with */}
            <View
              style={[
                styles.fieldRow,
                styles.fieldRowNoBorder,
                highlightedField === 'account' && {
                  backgroundColor: theme.semantic.primary + '15',
                },
                highlightAccount && { backgroundColor: theme.semantic.warning + '15' },
              ]}
            >
              <Text
                style={[
                  styles.fieldLabel,
                  {
                    color: account.selectedAccount
                      ? theme.semantic.textSecondary
                      : theme.semantic.text,
                  },
                ]}
              >
                {type === 'expense' ? 'Paid with' : 'Account'}
              </Text>
              <Pressable
                onPress={account.navigateToAccountSelection}
                style={styles.fieldValueTouchable}
              >
                {account.selectedAccount ? (
                  <Text style={[styles.fieldValue, { color: theme.semantic.text }]}>
                    {account.accountDisplay}
                  </Text>
                ) : (
                  <Text style={[styles.fieldPlaceholder, { color: theme.semantic.primary }]}>
                    Add account
                  </Text>
                )}
              </Pressable>
              {account.selectedAccount && (
                <Pressable onPress={account.clearAccount} hitSlop={8} style={styles.clearButton}>
                  <FontAwesome name="times-circle" size={16} color={theme.semantic.textSecondary} />
                </Pressable>
              )}
            </View>

            {/* Account chips */}
            {accountChips.length > 0 && (
              <ScrollView
                ref={accountChipsScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.fieldChipsRow}
                contentContainerStyle={styles.fieldChipsContent}
              >
                {accountChips.map((chip) => {
                  const selected = account.selectedAccount?.key === chip.key
                  return (
                    <AnimatedQuickChip
                      key={`account-${chip.key}`}
                      label={chip.label}
                      icon={chip.icon}
                      iconColor={selected ? theme.semantic.primary : theme.semantic.textSecondary}
                      selected={selected}
                      selectedColor={theme.semantic.primary + '20'}
                      surfaceColor={theme.semantic.surfaceAlt}
                      borderColor={theme.semantic.border}
                      selectedBorderColor={theme.semantic.primary}
                      textColor={selected ? theme.semantic.primary : theme.semantic.textSecondary}
                      onPress={() => onQuickChipPress(chip)}
                    />
                  )
                })}
                <ScalePressable
                  onPress={() => setShowPaymentChipsReorder(true)}
                  style={[styles.quickChipEdit, { borderColor: theme.semantic.border }]}
                >
                  <FontAwesome name="pencil" size={12} color={theme.semantic.textSecondary} />
                </ScalePressable>
              </ScrollView>
            )}
            <View style={[styles.sectionDivider, { backgroundColor: theme.semantic.border }]} />

            {/* Date */}
            <Pressable
              onPress={dateTime.openDateTimeModal}
              style={[styles.fieldRow, styles.fieldRowNoBorder]}
            >
              <Text style={[styles.fieldLabel, { color: theme.semantic.text }]}>Date</Text>
              <Text style={[styles.fieldValue, { color: theme.semantic.text }]}>
                {dateTime.dateDisplay}, {dateTime.timeDisplay}
              </Text>
              <Text style={[styles.chevron, { color: theme.semantic.textSecondary }]}>›</Text>
            </Pressable>
            <View style={[styles.sectionDivider, { backgroundColor: theme.semantic.border }]} />

            {/* Note */}
            <View style={[styles.fieldRow, styles.fieldRowNoBorder, { paddingRight: 0 }]}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: note ? theme.semantic.textSecondary : theme.semantic.text },
                ]}
              >
                Note <Text style={styles.optionalLabel}>(optional)</Text>
              </Text>
              <View style={modalStyles.fieldInputWrapper}>
                {!note && (
                  <Text
                    style={[
                      styles.fieldPlaceholder,
                      modalStyles.fieldInputPlaceholder,
                      { color: theme.semantic.textSecondary },
                    ]}
                  >
                    Add note
                  </Text>
                )}
                <TextInput
                  ref={noteInputRef}
                  value={note}
                  onChangeText={setNote}
                  style={[modalStyles.fieldInput, { color: theme.semantic.text }]}
                  autoCapitalize="sentences"
                  multiline
                />
              </View>
            </View>

            {/* Itemized Items - expense only */}
            {type === 'expense' && (
              <>
                <View style={[styles.sectionDivider, { backgroundColor: theme.semantic.border }]} />
                <ItemizedSection
                  items={itemizedItems}
                  onItemsChange={setItemizedItems}
                  expanded={itemizedExpanded}
                  onExpandedChange={setItemizedExpanded}
                  merchant={merchant}
                />
              </>
            )}
          </View>
        )}

        {/* More Details */}
        {type !== 'transfer' && (
          <>
            <Pressable
              onPress={() => setMoreDetailsExpanded(!moreDetailsExpanded)}
              style={styles.moreDetailsRow}
            >
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.semantic.textSecondary, marginBottom: 0 },
                ]}
              >
                {moreDetailsExpanded ? 'Optional' : 'More details'}
              </Text>
              <View style={styles.moreDetailsRight}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: theme.semantic.surfaceAlt,
                      borderColor: theme.semantic.border,
                    },
                  ]}
                >
                  {moreDetailsCount > 0 && (
                    <View style={[styles.badgeDot, { backgroundColor: theme.semantic.primary }]} />
                  )}
                  <Text style={[styles.badgeText, { color: theme.semantic.textSecondary }]}>
                    {moreDetailsCount > 0 ? moreDetailsCount : 'None'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.moreDetailsChevron,
                    {
                      color: theme.semantic.textSecondary,
                      transform: [{ rotate: moreDetailsExpanded ? '90deg' : '0deg' }],
                    },
                  ]}
                >
                  ›
                </Text>
              </View>
            </Pressable>

            {/* Expanded Fields */}
            {moreDetailsExpanded && (
              <View style={styles.fieldGroup}>
                {/* Tags */}
                <View style={[styles.tagsRow, { borderBottomColor: theme.semantic.border }]}>
                  <TagSection selectedTags={tags} onTagsChange={setTags} />
                </View>

                {/* Receipt */}
                <Pressable onPress={onReceiptPress} style={[styles.fieldRow, styles.fieldRowLast]}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      { color: receiptUri ? theme.semantic.textSecondary : theme.semantic.text },
                    ]}
                  >
                    Receipt
                  </Text>
                  <View style={styles.fieldValueRow}>
                    <FontAwesome
                      name={receiptUri ? 'check-circle' : 'camera'}
                      size={14}
                      color={receiptUri ? theme.semantic.success : theme.semantic.textSecondary}
                    />
                    <Text
                      style={[
                        receiptUri ? styles.fieldValue : styles.fieldPlaceholder,
                        { color: receiptUri ? theme.semantic.text : theme.semantic.textSecondary },
                      ]}
                    >
                      {receiptUri ? 'Attached' : 'Attach photo'}
                    </Text>
                  </View>
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
          </>
        )}
      </ScrollView>

      {/* Modals */}
      <DateTimePickerModal
        visible={dateTime.showDateTimeModal}
        value={dateTime.occurredAt}
        onClose={dateTime.closeDateTimeModal}
        onConfirm={dateTime.onDateTimeConfirm}
      />

      {/* CategorySelectionModal and AccountSelectionModal now use navigation (slide from right) */}

      <QuickChipsEditModal
        visible={showChipsEdit}
        transactionType={type === 'transfer' ? 'expense' : type}
        accounts={account.accounts}
        onClose={() => {
          setShowChipsEdit(false)
          // Scroll chips back to start after edit
          setTimeout(() => {
            chipsScrollRef.current?.scrollTo({ x: 0, animated: true })
          }, 100)
        }}
      />

      <PaymentChipsReorderModal
        visible={showPaymentChipsReorder}
        accounts={account.accounts}
        onClose={() => {
          setShowPaymentChipsReorder(false)
          // Scroll chips back to start after reorder
          setTimeout(() => {
            accountChipsScrollRef.current?.scrollTo({ x: 0, animated: true })
          }, 100)
        }}
      />

      <AmountKeypadSheet
        visible={showKeypadSheet}
        amountDisplay={amount.amountDisplay}
        isEstimated={isEstimated}
        onDigit={amount.appendAmountDigit}
        onBackspace={amount.backspaceAmount}
        onClear={amount.clearAmount}
        onEstimatedChange={setIsEstimated}
        onDone={() => setShowKeypadSheet(false)}
        onClose={() => setShowKeypadSheet(false)}
      />

      {/* Fee Keypad Sheet (for transfers) */}
      <AmountKeypadSheet
        visible={showFeeKeypad}
        amountDisplay={formatCentsForDisplay(feeCents)}
        hideEstimated
        onDigit={(digit) => {
          const current = feeCents.toString()
          const newVal = current === '0' ? digit : current + digit
          const cents = parseInt(newVal, 10)
          // Max 9 digits = $9,999,999.99 (same scale as main amount)
          if (cents <= 999999999) setFeeCents(cents)
        }}
        onBackspace={() => {
          const current = feeCents.toString()
          if (current.length <= 1) {
            setFeeCents(0)
          } else {
            setFeeCents(parseInt(current.slice(0, -1), 10))
          }
        }}
        onClear={() => setFeeCents(0)}
        onDone={() => setShowFeeKeypad(false)}
        onClose={() => setShowFeeKeypad(false)}
      />

      {/* Bottom CTA Bar - absolutely positioned */}
      {/* Note: bottomInset=0 because iOS card-style modals already handle safe area */}
      <BottomCTABar
        amountDisplay={amount.amountDisplay}
        canSave={canSave}
        bottomInset={0}
        onSave={onSave}
        onSaveAndNew={onSaveAndAddAnother}
        onSaveDraft={onSaveDraft}
      />

      {/* Toast - floating above button */}
      {toastMessage && (
        <Animated.View
          key={toastKey}
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          style={[
            styles.toast,
            {
              backgroundColor: theme.semantic.text,
              position: 'absolute',
              bottom: getScrollContentWithCTAPadding(0),
              alignSelf: 'center',
            },
          ]}
          pointerEvents="none"
        >
          <Text style={[styles.toastText, { color: theme.semantic.surface }]}>{toastMessage}</Text>
        </Animated.View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  dragHandle: {
    width: spacing['2xl'] + spacing.xs, // 36
    height: spacing.xs + 1, // 5
    borderRadius: radius.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  cancelButton: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.md,
  },
  cancelText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  typeTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  typeTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 3,
    marginBottom: -1,
  },
  typeTabText: {
    fontSize: fontSize.md,
  },
  typeTabContent: {
    alignItems: 'center',
  },
  comingSoonBadge: {
    marginTop: spacing.xs - 2,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  comingSoonText: {
    fontSize: FONT_SIZE_TINY,
    fontWeight: fontWeight.medium,
  },
  content: {
    paddingHorizontal: spacing.lg, // 16px - matches AppBar and Screen default
    paddingTop: spacing.xl,
  },
  // Hero Amount
  heroAmount: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    marginBottom: spacing.lg,
  },
  amountTouchable: {
    alignItems: 'center',
  },
  amountValue: {
    fontSize: displaySize.xl,
    fontWeight: fontWeight.heavy,
    letterSpacing: letterSpacing.tight * 5, // -1
  },
  amountHint: {
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  estimatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  estimatedBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  // Description subtitle (Option A)
  descSubtitle: {
    position: 'relative',
    width: '100%',
    maxWidth: 240,
    marginTop: spacing.md,
  },
  descSubtitleInput: {
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  // Quick Action Chips - Single line, scrollable within content width
  quickChipsScroll: {
    marginBottom: spacing.lg,
  },
  quickChipsContent: {
    gap: spacing.sm,
  },
  // Field-level chips (below Category/Paid with)
  fieldChipsRow: {
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  fieldChipsContent: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    maxWidth: spacing['3xl'] * 2 + spacing.xs, // ~100
  },
  quickChipEdit: {
    width: spacing['2xl'],
    height: spacing['2xl'],
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  // Optional label for fields
  optionalLabel: {
    fontWeight: fontWeight.normal,
    opacity: 0.7,
  },
  // Field Group - Flat Linear Style (keeping chip styles for suggestions if needed later)
  chipTag: {
    paddingVertical: spacing.xs - 1, // 3
    paddingHorizontal: spacing.xs + 2, // 6
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipTagText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.wide,
  },
  chipLabel: {
    fontSize: fontSize.sm,
  },
  // Field Group - Vertical Stack Style (iOS Settings)
  fieldGroup: {
    // No background, no border radius - just rows with dividers
  },
  fieldRow: {
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingRight: spacing.xl, // room for chevron
    minHeight: MODAL_ROW_HEIGHT,
    borderBottomWidth: 1,
  },
  fieldRowLast: {
    borderBottomWidth: 0,
  },
  fieldRowNoBorder: {
    borderBottomWidth: 0,
  },
  sectionDivider: {
    height: 1,
    marginVertical: spacing.xs,
  },
  fieldLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wider,
    marginBottom: spacing.sm,
  },
  fieldValue: {
    fontSize: fontSize.md,
  },
  fieldPlaceholder: {
    fontSize: fontSize.sm,
    opacity: 0.5,
  },
  fieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fieldValueTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chevron: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -(fontSize.lg / 2),
    fontSize: fontSize.lg,
  },
  chevronInline: {
    fontSize: fontSize.lg,
    marginLeft: spacing.xs,
  },
  clearButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -8,
    padding: spacing.xs,
  },
  // More Details - Flat Linear Style
  moreDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    minHeight: MODAL_ROW_HEIGHT,
  },
  moreDetailsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  moreDetailsChevron: {
    fontSize: fontSize.lg,
  },
  tagsRow: {
    borderBottomWidth: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  badgeDot: {
    width: spacing.xs + 2, // 6
    height: spacing.xs + 2, // 6
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
  },
  receiptPreview: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  receiptImage: {
    width: '100%',
    height: spacing['3xl'] * 4 + spacing.xs, // ~200
    borderRadius: radius.lg,
  },
  // Toast (above CTA bar)
  toast: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  toastText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  // Loading state
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'] * 2,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
  },
  // Transfer styles
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: spacing.lg + spacing.xs, // 20
    height: spacing.lg + spacing.xs, // 20
    borderRadius: radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  feeHint: {
    paddingBottom: spacing.sm,
  },
  feeHintText: {
    fontSize: fontSize.xs,
    fontStyle: 'italic',
  },
  fieldValueSecondary: {
    fontSize: fontSize.md,
  },
})
