import { CATEGORIES } from '@/shared/config'
import { getActiveAccounts } from '@/core/services/account'
import type { Transaction } from '@/core/domain/transaction'
import { isExpense, safeDate } from '@/core/domain/transaction'
import { removeTransaction, restoreTransaction } from '@/core/services/transaction'
import { useHoHTheme } from '@/shared/providers'
import { EmptyState } from '@/shared/components'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import {
  CATEGORY_DOT_SIZE_SM,
  FONT_SIZE_TINY,
  LIST_ROW_HEIGHT,
  LIST_SECTION_HEADER_HEIGHT,
  LIST_SEPARATOR_HEIGHT,
} from '@/shared/theme/tokens/viewStyles'
import { formatCurrency } from '@/shared/format/currency'
import { formatDayHeader, formatMonthSectionTitle, monthKey, ymd } from '@/shared/format/date'
import { useDraftsStore, useTransactionFocusStore } from '@/shared/store'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { useFocusEffect } from '@react-navigation/native'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useTransactionsData } from './hooks/useTransactionsData'
import {
  TransactionDetailSheet,
  TransactionFilterSheet,
  UndoToast,
  getActiveFilterCount,
  getActiveFilterChips,
  DEFAULT_FILTERS,
} from './components'
import type { TransactionFilters, TransactionType, ActiveFilterChip } from './components'
import {
  LayoutAnimation,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native'

import { Screen } from '@/shared/layout/Screen'

// Extended transaction type that can also be a draft
type TransactionOrDraft = Transaction & { isDraft?: boolean }

type DaySection = {
  key: string // YYYY-MM-DD
  dayTitle: string // "Wed, Mar 3"
  monthKey: string // YYYY-MM
  monthTitle: string // "MARCH 2026"
  monthTotal: number
  dayTotal: number
  data: TransactionOrDraft[]
}

function displayItem(tx: TransactionOrDraft): string {
  const item = (tx.item ?? '').trim()
  const merchant = (tx.merchant ?? '').trim()
  const typeLabel = tx.type === 'income' ? 'Income' : tx.type === 'transfer' ? 'Transfer' : 'Expense'
  return item || merchant || typeLabel
}

function buildDaySections(all: TransactionOrDraft[], query: string): DaySection[] {
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

  // Group by day
  const dayMap = new Map<string, { date: Date; data: TransactionOrDraft[]; total: number }>()
  for (const tx of sorted) {
    const d = safeDate(tx)
    const key = ymd(d)
    const existing = dayMap.get(key)
    const amt = tx.money.amount
    const expenseAmt = Number.isFinite(amt) && isExpense(tx) ? amt : 0
    if (existing) {
      existing.data.push(tx)
      existing.total += expenseAmt
    } else {
      dayMap.set(key, { date: d, data: [tx], total: expenseAmt })
    }
  }

  // Calculate month totals
  const monthTotals = new Map<string, number>()
  const monthTitles = new Map<string, string>()
  for (const [, { date, total }] of dayMap) {
    const mKey = monthKey(date)
    monthTotals.set(mKey, (monthTotals.get(mKey) ?? 0) + total)
    if (!monthTitles.has(mKey)) {
      monthTitles.set(mKey, formatMonthSectionTitle(date))
    }
  }

  // Build sections
  const sections: DaySection[] = []
  const sortedDays = [...dayMap.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))

  for (const [dayKey, { date, data, total }] of sortedDays) {
    const mKey = monthKey(date)
    sections.push({
      key: dayKey,
      dayTitle: formatDayHeader(date),
      monthKey: mKey,
      monthTitle: monthTitles.get(mKey) ?? '',
      monthTotal: monthTotals.get(mKey) ?? 0,
      dayTotal: total,
      data
    })
  }

  return sections
}

function findScrollTarget(sections: DaySection[], focusDate?: string) {
  if (!focusDate) return null
  if (focusDate.length < 10) return null

  const sectionIndex = sections.findIndex((s) => s.key === focusDate)
  if (sectionIndex < 0) {
    // Try to find by month
    const focusMonth = focusDate.slice(0, 7)
    const monthSectionIndex = sections.findIndex((s) => s.monthKey === focusMonth)
    if (monthSectionIndex >= 0) return { sectionIndex: monthSectionIndex, itemIndex: 0 }
    return null
  }

  return { sectionIndex, itemIndex: 0 }
}

export default function TransactionsScreen() {
  const theme = useHoHTheme()

  const params = useLocalSearchParams<{ accountId?: string; draftMode?: string }>()
  const accountIdFilter = typeof params.accountId === 'string' ? params.accountId : undefined
  const draftModeParam = params.draftMode as 'only' | 'all' | undefined

  // Get focusDate from store (more reliable than URL params for tab navigation)
  const { focusDate, focusId } = useTransactionFocusStore()

  const listRef = useRef<SectionList<TransactionOrDraft, DaySection>>(null)
  const detailSheetRef = useRef<BottomSheetModal>(null)
  const filterSheetRef = useRef<BottomSheetModal>(null)

  const { data, refetch, loadMore, isLoadingMore } = useTransactionsData()
  const { items, hasMore } = data

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  // Initialize filters - if coming from drafts FAB, show drafts by default
  const [filters, setFilters] = useState<TransactionFilters>(() => ({
    ...DEFAULT_FILTERS,
    draftMode: draftModeParam ?? 'hidden',
  }))

  // Sync filter state when draftMode param changes (e.g., tapping draft button while already on page)
  useEffect(() => {
    if (draftModeParam) {
      setFilters((prev) => ({
        ...prev,
        draftMode: draftModeParam,
      }))
    }
  }, [draftModeParam])

  // Drafts store
  const { drafts, loadDrafts, isLoaded: draftsLoaded } = useDraftsStore()

  // Load drafts on mount
  useEffect(() => {
    if (!draftsLoaded) {
      loadDrafts()
    }
  }, [draftsLoaded, loadDrafts])

  const [highlightDate, setHighlightDate] = useState<string | null>(null)

  // Detail sheet state
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  // Undo delete state
  const [undoState, setUndoState] = useState<{
    visible: boolean
    transaction: Transaction | null
  }>({ visible: false, transaction: null })

  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true)
    }
  }, [])

  // focusDate로 들어오면 query와 filters 자동 초기화
  useEffect(() => {
    if (!focusDate) return

    LayoutAnimation.easeInEaseOut()
    // Clear search query
    if (query.length > 0 || debouncedQuery.length > 0) {
      setQuery('')
      setDebouncedQuery('')
    }
    // Clear filters (except draftMode which may be controlled by params)
    setFilters((prev) => ({
      ...DEFAULT_FILTERS,
      draftMode: prev.draftMode,
    }))
  }, [focusDate])

  // search debounce
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


  // Track which focusId we last scrolled for
  const lastScrolledFocusIdRef = useRef(0)

  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch])
  )

  // Convert drafts to TransactionOrDraft format
  const draftsAsTransactions: TransactionOrDraft[] = useMemo(() => {
    if (filters.draftMode === 'hidden') return []
    return drafts.map((draft) => ({
      id: draft.id,
      key: `draft-${draft.id}`,
      occurredAt: new Date(draft.occurredAt),
      type: draft.type,
      item: draft.item || undefined,
      money: { amount: draft.amountCents / 100, currency: 'USD' },
      accountId: draft.accountKey ? accounts.find(a => a.key === draft.accountKey)?.id : undefined,
      merchant: draft.merchant,
      note: draft.note,
      tags: draft.tags,
      category: draft.categoryRef,
      isDraft: true,
    } as TransactionOrDraft))
  }, [filters.draftMode, drafts, accounts])

  // All items - for 'all' and 'only' modes, drafts are shown separately at top
  const allItems: TransactionOrDraft[] = useMemo(() => {
    // Drafts are always shown separately at top (not merged into timeline)
    return items
  }, [items])

  // Apply all filters
  const filteredItems: TransactionOrDraft[] = useMemo(() => {
    // If 'only' mode, we only show drafts (no regular transactions)
    if (filters.draftMode === 'only') {
      return []
    }

    let result = allItems

    // Filter by accountId (from URL params)
    if (accountIdFilter) {
      result = result.filter(tx => tx.accountId === accountIdFilter)
    }

    // Filter by transaction type
    if (filters.types.length > 0) {
      result = result.filter(tx => filters.types.includes(tx.type as TransactionType))
    }

    // Filter by category
    if (filters.categoryKeys.length > 0) {
      result = result.filter(tx => {
        const catKey = tx.category?.categoryKey
        return catKey && filters.categoryKeys.includes(catKey)
      })
    }

    return result
  }, [allItems, accountIdFilter, filters.types, filters.categoryKeys, filters.draftMode])

  // Build sections - add drafts section at top when in 'only' or 'all' mode
  const sections = useMemo(() => {
    // Filter drafts by search query if present
    const q = debouncedQuery.trim().toLowerCase()
    const filteredDrafts = q
      ? draftsAsTransactions.filter((tx) => {
          const item = displayItem(tx).toLowerCase()
          const note = String(tx.note ?? '').toLowerCase()
          const merchant = String(tx.merchant ?? '').toLowerCase()
          return item.includes(q) || note.includes(q) || merchant.includes(q)
        })
      : draftsAsTransactions

    // If 'only' mode, only show drafts section (no timeline)
    if (filters.draftMode === 'only') {
      if (filteredDrafts.length === 0) return []
      const draftsSection: DaySection = {
        key: 'drafts',
        dayTitle: `${filteredDrafts.length} pending`,
        monthKey: 'drafts',
        monthTitle: 'DRAFTS',
        monthTotal: 0,
        dayTotal: 0,
        data: filteredDrafts,
      }
      return [draftsSection]
    }

    const baseSections = buildDaySections(filteredItems, debouncedQuery)

    // If 'all' mode, prepend a drafts section at top
    if (filters.draftMode === 'all' && filteredDrafts.length > 0) {
      const draftsSection: DaySection = {
        key: 'drafts',
        dayTitle: `${filteredDrafts.length} pending`,
        monthKey: 'drafts',
        monthTitle: 'DRAFTS',
        monthTotal: 0,
        dayTotal: 0,
        data: filteredDrafts,
      }
      return [draftsSection, ...baseSections]
    }

    return baseSections
  }, [filteredItems, debouncedQuery, filters.draftMode, draftsAsTransactions])


  // Scroll when focusId changes (new date selected)
  useEffect(() => {
    // Skip if no focusDate or already scrolled for this focusId
    if (!focusDate || focusId <= lastScrolledFocusIdRef.current) return

    // Wait for sections to be available
    if (!sections.length) return

    const target = findScrollTarget(sections, focusDate)
    if (!target) return

    // Calculate scroll offset to target section
    let scrollOffset = 0
    for (let i = 0; i < target.sectionIndex; i++) {
      scrollOffset += LIST_SECTION_HEADER_HEIGHT
      scrollOffset += sections[i].data.length * LIST_ROW_HEIGHT
      scrollOffset += Math.max(0, sections[i].data.length - 1) * LIST_SEPARATOR_HEIGHT
    }

    // Scroll after a delay to ensure layout is ready
    const timeoutId = setTimeout(() => {
      listRef.current?.getScrollResponder()?.scrollTo({
        y: scrollOffset,
        animated: true,
      })
      lastScrolledFocusIdRef.current = focusId
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [focusDate, focusId, sections])

  // Get filtered account name for display
  const filteredAccountName = accountIdFilter ? accountNameById.get(accountIdFilter) : null

  // Clear account filter - replace navigation without the param
  const clearAccountFilter = useCallback(() => {
    router.replace('/(tabs)/transactions')
  }, [])

  // Track current visible month for floating header
  const [visibleMonth, setVisibleMonth] = useState<{ title: string; total: number } | null>(null)

  // Update visible month when sections change
  useEffect(() => {
    if (sections.length > 0) {
      setVisibleMonth({ title: sections[0].monthTitle, total: sections[0].monthTotal })
    }
  }, [sections])

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: Array<{ section?: DaySection }> }) => {
    const firstVisible = viewableItems.find(item => item.section)
    if (firstVisible?.section) {
      setVisibleMonth({ title: firstVisible.section.monthTitle, total: firstVisible.section.monthTotal })
    }
  }, [])


  // Handle row tap - open detail sheet
  const handleRowPress = useCallback((tx: Transaction) => {
    setSelectedTransaction(tx)
  }, [])

  // Present sheet when selectedTransaction changes
  useEffect(() => {
    if (selectedTransaction) {
      detailSheetRef.current?.present()
    }
  }, [selectedTransaction])

  // Handle detail sheet dismiss
  const handleDetailDismiss = useCallback(() => {
    setSelectedTransaction(null)
  }, [])

  // Handle edit from detail sheet
  const handleEdit = useCallback((tx: Transaction) => {
    detailSheetRef.current?.dismiss()
    // Navigate to edit screen with transaction ID
    router.push({
      pathname: '/(modal)/edit-transaction',
      params: { transactionId: tx.id }
    })
  }, [])

  // Handle delete with undo
  const handleDelete = useCallback(async (tx: Transaction) => {
    // Store transaction for potential undo
    setUndoState({ visible: true, transaction: tx })

    // Actually delete
    await removeTransaction(tx.id)
    refetch()
  }, [refetch])

  // Handle undo
  const handleUndo = useCallback(async () => {
    if (undoState.transaction) {
      await restoreTransaction(undoState.transaction)
    }
    setUndoState({ visible: false, transaction: null })
    refetch()
  }, [refetch, undoState.transaction])

  // Handle undo dismiss
  const handleUndoDismiss = useCallback(() => {
    setUndoState({ visible: false, transaction: null })
  }, [])

  return (
    <BottomSheetModalProvider>
      <Screen edges={[]}>
        <View style={[styles.searchRow, { marginTop: spacing.xs }]}>
          {/* Search area - subtle border style */}
          <View style={[styles.searchArea, { backgroundColor: theme.semantic.surfaceAlt, borderColor: theme.semantic.border }]}>
            <FontAwesome name="search" size={14} color={theme.semantic.textSecondary as string} />
            <TextInput
              value={query}
              onChangeText={(t) => {
                setQuery(t)
              }}
              placeholder="Search transactions"
              placeholderTextColor={theme.semantic.textSecondary as string}
              style={[styles.searchInput, { color: theme.semantic.text }]}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              accessibilityLabel="Search transactions"
            />
          </View>

          {/* Filter icon button */}
          {(() => {
            const activeCount = getActiveFilterCount(filters)
            const hasActiveFilters = activeCount > 0
            return (
              <TouchableOpacity
                onPress={() => filterSheetRef.current?.present()}
                style={[
                  styles.filterIconBtn,
                  { backgroundColor: hasActiveFilters ? theme.semantic.primary : theme.semantic.surfaceAlt }
                ]}
                accessibilityLabel={`Open filters${hasActiveFilters ? `, ${activeCount} active` : ''}`}
              >
                <FontAwesome
                  name="sliders"
                  size={16}
                  color={hasActiveFilters ? (theme.semantic.onPrimary as string) : (theme.semantic.textSecondary as string)}
                />
                {activeCount > 0 && (
                  <View style={[styles.filterIconBadge, { backgroundColor: theme.semantic.danger }]}>
                    <Text style={[styles.filterIconBadgeText, { color: theme.semantic.onDanger }]}>
                      {activeCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })()}
        </View>

        {/* Active filter chips */}
        {(() => {
          const chips = getActiveFilterChips(filters)
          if (chips.length === 0 && !filteredAccountName) return null

          const removeFilter = (chip: ActiveFilterChip) => {
            if (chip.type === 'type') {
              const typeKey = chip.key.replace('type-', '') as TransactionType
              setFilters({
                ...filters,
                types: filters.types.filter((t) => t !== typeKey),
              })
            } else if (chip.type === 'category') {
              const catKey = chip.key.replace('cat-', '')
              setFilters({
                ...filters,
                categoryKeys: filters.categoryKeys.filter((c) => c !== catKey),
              })
            } else if (chip.type === 'status') {
              setFilters({ ...filters, draftMode: 'hidden' })
            }
          }

          return (
            <View style={styles.activeFiltersRow}>
              {/* Account filter (from URL) */}
              {filteredAccountName && (
                <Pressable
                  onPress={clearAccountFilter}
                  style={[styles.activeFilterChip, { backgroundColor: theme.semantic.primarySoft }]}
                >
                  <Text style={[styles.activeFilterChipText, { color: theme.semantic.primary }]}>
                    {filteredAccountName}
                  </Text>
                  <FontAwesome name="times" size={10} color={theme.semantic.primary as string} />
                </Pressable>
              )}

              {/* Filter chips */}
              {chips.map((chip) => (
                <Pressable
                  key={chip.key}
                  onPress={() => removeFilter(chip)}
                  style={[
                    styles.activeFilterChip,
                    {
                      backgroundColor:
                        chip.type === 'status'
                          ? theme.semantic.warningSoft
                          : theme.semantic.primarySoft,
                    },
                  ]}
                >
                  {chip.color && (
                    <View style={[styles.activeFilterDot, { backgroundColor: chip.color }]} />
                  )}
                  <Text
                    style={[
                      styles.activeFilterChipText,
                      {
                        color:
                          chip.type === 'status'
                            ? theme.semantic.warning
                            : theme.semantic.primary,
                      },
                    ]}
                  >
                    {chip.label}
                  </Text>
                  <FontAwesome
                    name="times"
                    size={10}
                    color={
                      chip.type === 'status'
                        ? (theme.semantic.warning as string)
                        : (theme.semantic.primary as string)
                    }
                  />
                </Pressable>
              ))}
            </View>
          )
        })()}

        {/* Active account filter chip - DEPRECATED, moved above */}
        {false && filteredAccountName && (
          <View style={styles.filterChipRow}>
            <Pressable
              onPress={clearAccountFilter}
              style={[styles.filterChip, { backgroundColor: theme.semantic.primarySoft }]}
            >
              <Text style={[styles.filterChipText, { color: theme.semantic.primary }]}>
                {filteredAccountName}
              </Text>
              <FontAwesome name="times" size={12} color={theme.semantic.primary as string} />
            </Pressable>
          </View>
        )}

        {/* Floating month header - always render to prevent layout shift */}
        <View style={[styles.monthBar, { backgroundColor: theme.semantic.background, borderColor: theme.semantic.border }]}>
          {visibleMonth && sections.length > 0 ? (
            <>
              <Text style={[styles.monthText, { color: theme.semantic.text }]}>{visibleMonth.title}</Text>
              <Text style={[styles.monthTotal, { color: theme.semantic.textSecondary }]}>
                {formatCurrency(visibleMonth.total)}
              </Text>
            </>
          ) : (
            <Text style={[styles.monthText, { color: theme.semantic.textSecondary }]}> </Text>
          )}
        </View>

        <SectionList
          ref={listRef}
          style={{ flex: 1 }}
          sections={sections}
          keyExtractor={(it) => it.id}
          stickySectionHeadersEnabled
          contentContainerStyle={sections.length ? undefined : styles.emptyContainer}
          initialNumToRender={200}
          maxToRenderPerBatch={50}
          windowSize={31}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: theme.semantic.border }]} />
          )}
          renderSectionHeader={({ section }) => (
            <View style={[styles.dayBar, { backgroundColor: theme.semantic.background, borderColor: theme.semantic.border }]}>
              <Text style={[styles.dayHeaderText, { color: theme.semantic.text }]}>{section.dayTitle}</Text>
              <Text style={[styles.dayTotal, { color: theme.semantic.textSecondary }]}>
                {formatCurrency(section.dayTotal)}
              </Text>
            </View>
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}

          renderItem={({ item }) => {
            const amt = item.money.amount
            const t = item.type
            const isDraft = item.isDraft === true

            const d = safeDate(item)
            const rowYmd = Number.isFinite(d.getTime()) ? ymd(d) : null

            const accountId = item.accountId ?? ''
            const accountName = accountNameById.get(accountId) || 'Account'
            const amountColor = t === 'income' ? theme.semantic.success : theme.semantic.text
            const isHighlighted = rowYmd && rowYmd === highlightDate

            // Get category info
            const catRef = item.category
            const cat = catRef ? CATEGORIES.find(c => c.key === catRef.categoryKey && c.type === catRef.type) : null
            const subCat = catRef?.subCategoryKey && cat?.subCategories
              ? cat.subCategories.find(s => s.key === catRef.subCategoryKey)
              : null
            const categoryColor = subCat?.color ?? cat?.color ?? theme.semantic.border
            const categoryName = subCat?.name ?? cat?.name ?? null

            // Fallback chain for primary text: item → merchant → category → type (for non-drafts)
            const itemRaw = (item.item ?? '').trim()
            const merchantRaw = (item.merchant ?? '').trim()
            const typeLabel = t === 'income' ? 'Income' : t === 'transfer' ? 'Transfer' : 'Expense'

            let primaryText: string
            let merchantPromoted = false

            if (itemRaw.length > 0) {
              primaryText = itemRaw
            } else if (merchantRaw.length > 0) {
              primaryText = merchantRaw
              merchantPromoted = true
            } else if (categoryName) {
              primaryText = categoryName
            } else if (isDraft) {
              // Draft with no identifier: leave empty (type shown as badge)
              primaryText = ''
            } else {
              // Non-draft fallback to type
              primaryText = typeLabel
            }

            // Secondary row: show merchant only if not promoted to primary
            const secondaryText = !merchantPromoted && merchantRaw.length > 0 ? merchantRaw : ''

            // Handle row press - drafts go to add transaction, others open detail
            const onRowPress = () => {
              if (isDraft) {
                router.push({
                  pathname: '/(modal)/add-transaction',
                  params: { draftId: item.id }
                })
              } else {
                handleRowPress(item)
              }
            }

            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onRowPress}
                style={[
                  styles.row,
                  isHighlighted && { backgroundColor: theme.semantic.primarySoft ?? theme.semantic.surfaceAlt }
                ]}
                accessibilityLabel={`${isDraft ? 'Draft ' : ''}Transaction ${primaryText} ${formatCurrency(amt)}`}
              >
                <View style={styles.rowTop}>
                  {/* Category color dot */}
                  <View style={[styles.categoryDot, { backgroundColor: categoryColor as string }]} />
                  <View style={styles.itemWithBadge}>
                    {primaryText.length > 0 && (
                      <Text style={[styles.itemText, { color: theme.semantic.text }]} numberOfLines={1}>
                        {primaryText}
                      </Text>
                    )}
                    {isDraft && (
                      <>
                        <View style={[styles.draftBadge, { backgroundColor: theme.semantic.warningSoft }]}>
                          <Text style={[styles.draftBadgeText, { color: theme.semantic.warning }]}>DRAFT</Text>
                        </View>
                        <View style={[styles.typeBadge, { backgroundColor: theme.semantic.surfaceAlt }]}>
                          <Text style={[styles.typeBadgeText, { color: theme.semantic.textSecondary }]}>
                            {typeLabel.toUpperCase()}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                  <Text style={[styles.amountText, { color: amountColor }]} numberOfLines={1}>
                    {t === 'income' ? '+' : ''}{formatCurrency(amt)}
                  </Text>
                </View>

                {/* Secondary row - only show if there's content */}
                {(secondaryText || accountName) && (
                  <View style={styles.rowSecond}>
                    <Text style={[styles.merchantText, { color: theme.semantic.textSecondary }]} numberOfLines={1}>
                      {secondaryText}
                    </Text>
                    <Text style={[styles.accountText, { color: theme.semantic.textSecondary }]} numberOfLines={1}>
                      {accountName}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          }}
          ListEmptyComponent={
            <EmptyState
              icon="list-alt"
              title={filteredAccountName ? 'No transactions' : 'No transactions yet'}
              description={filteredAccountName
                ? `No transactions found for ${filteredAccountName}.`
                : 'Add your first transaction to start tracking.'}
              action={!filteredAccountName ? {
                label: 'Add Transaction',
                onPress: () => router.push('/(modal)/add-transaction'),
              } : undefined}
              colors={{
                text: theme.semantic.text,
                textSecondary: theme.semantic.textSecondary,
                primary: theme.semantic.primary,
                onPrimary: theme.semantic.onPrimary,
              }}
            />
          }
          ListFooterComponent={
            hasMore ? (
              <TouchableOpacity
                onPress={loadMore}
                disabled={isLoadingMore}
                style={[styles.loadMoreBtn, { borderColor: theme.semantic.border }]}
                accessibilityLabel="Load more transactions"
              >
                <Text style={[styles.loadMoreText, { color: theme.semantic.textSecondary }]}>
                  {isLoadingMore ? 'Loading...' : 'Load older transactions'}
                </Text>
              </TouchableOpacity>
            ) : sections.length > 0 ? (
              <View style={styles.footerSpacer} />
            ) : null
          }
        />

        {/* Transaction Detail Sheet */}
        <TransactionDetailSheet
          transaction={selectedTransaction}
          sheetRef={detailSheetRef}
          onDismiss={handleDetailDismiss}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Filter Sheet */}
        <TransactionFilterSheet
          sheetRef={filterSheetRef}
          filters={filters}
          onFiltersChange={setFilters}
          draftCount={drafts.length}
        />

        {/* Undo Delete Toast */}
        <UndoToast
          visible={undoState.visible}
          message={undoState.transaction ? `Deleted "${displayItem(undoState.transaction)}"` : ''}
          onUndo={handleUndo}
          onDismiss={handleUndoDismiss}
          theme={{
            text: theme.semantic.text as string,
            surface: theme.semantic.surface as string,
            primary: theme.semantic.primary as string,
            onPrimary: theme.semantic.onPrimary as string,
          }}
        />

      </Screen>
    </BottomSheetModalProvider>
  )
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    padding: 0,
  },
  filterIconBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterIconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterIconBadgeText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },

  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  activeFilterChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  activeFilterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Legacy - can remove
  filterChipRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: spacing.xs
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md
  },
  filterChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium
  },

  monthBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1
  },
  monthText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.wider
  },
  monthTotal: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium
  },

  separator: {
    height: LIST_SEPARATOR_HEIGHT,
    marginLeft: spacing.md + CATEGORY_DOT_SIZE_SM + spacing.sm,
    opacity: 0.5,
  },
  emptyContainer: { flexGrow: 1 },

  dayBar: {
    height: LIST_SECTION_HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  dayHeaderText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold
  },
  dayTotal: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium
  },

  row: {
    height: LIST_ROW_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },

  rowTop: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  categoryDot: {
    width: CATEGORY_DOT_SIZE_SM,
    height: CATEGORY_DOT_SIZE_SM,
    borderRadius: CATEGORY_DOT_SIZE_SM / 2,
    marginRight: spacing.sm
  },

  itemText: {
    flexShrink: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium
  },

  amountText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums']
  },

  merchantText: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium
  },

  rowSecond: {
    marginTop: spacing.xs,
    marginLeft: CATEGORY_DOT_SIZE_SM + spacing.sm, // align with text after category dot
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm
  },

  accountText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'right'
  },

  loadMoreBtn: {
    marginTop: spacing.lg,
    marginBottom: spacing['2xl'],
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center'
  },

  loadMoreText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold
  },

  footerSpacer: {
    height: spacing['2xl']
  },

  // Draft badge in row
  itemWithBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.sm
  },
  draftBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm
  },
  draftBadgeText: {
    fontSize: FONT_SIZE_TINY,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.wider
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm
  },
  typeBadgeText: {
    fontSize: FONT_SIZE_TINY,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.wider
  }
})
