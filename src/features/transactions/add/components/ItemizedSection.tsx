import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useHoHTheme } from '@/shared/providers'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { formatCurrency } from '@/shared/format/currency'
import {
  searchItems,
  getLatestPriceForItemAtStore,
  getStoreByMerchant,
} from '@/core/services/price-tracker'
import type { TrackedItem } from '@/core/domain/price-tracker'
import { AmountKeypadSheet } from '@/shared/components'

export type ItemEntry = {
  id: string
  name: string
  priceCents: number
  quantity: number
  unit?: string
  itemId?: string // linked tracked item
}

type Props = {
  items: ItemEntry[]
  onItemsChange: (items: ItemEntry[]) => void
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  merchant?: string // For price lookup
}

// Helper: format cents to display string
function formatCentsDisplay(cents: number): string {
  if (!Number.isFinite(cents) || cents < 0) return '0.00'
  return (cents / 100).toFixed(2)
}

export function ItemizedSection({ items, onItemsChange, expanded, onExpandedChange, merchant }: Props) {
  const theme = useHoHTheme()

  // Ghost row state (the always-visible input at bottom)
  const [ghostName, setGhostName] = useState('')
  const [ghostPriceCents, setGhostPriceCents] = useState(0)
  const [ghostItemId, setGhostItemId] = useState<string | undefined>()
  const ghostNameRef = useRef<TextInput>(null)

  // Editing existing item state
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingField, setEditingField] = useState<'name' | 'price' | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingPriceCents, setEditingPriceCents] = useState(0)
  const [editingPriceCentsText, setEditingPriceCentsText] = useState('')
  const editingNameRef = useRef<TextInput>(null)

  // Price keypad state
  const [showPriceKeypad, setShowPriceKeypad] = useState(false)
  const [priceKeypadTarget, setPriceKeypadTarget] = useState<'ghost' | number | null>(null)
  const [keypadPriceCentsText, setKeypadPriceCentsText] = useState('')

  // Suggestions state
  const [suggestions, setSuggestions] = useState<TrackedItem[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionTarget, setSuggestionTarget] = useState<'ghost' | number | null>(null)

  // Calculate total and count (items with name OR price)
  const validItems = items.filter(item => item.name.trim() || item.priceCents > 0)
  const total = validItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0)
  const itemCount = validItems.length

  // Search for suggestions
  const searchQuery = suggestionTarget === 'ghost' ? ghostName : editingName
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const results = searchItems(searchQuery, 5)
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchQuery])

  // Commit ghost row to items list (name OR price required)
  const commitGhostRow = useCallback(() => {
    const name = ghostName.trim()
    // Allow saving if we have either a name or a price
    if (name || ghostPriceCents > 0) {
      const newItem: ItemEntry = {
        id: `item-${Date.now()}`,
        name: name || 'Item', // Default name if only price provided
        priceCents: ghostPriceCents,
        quantity: 1,
        itemId: ghostItemId,
      }
      onItemsChange([...items, newItem])
      // Reset ghost
      setGhostName('')
      setGhostPriceCents(0)
      setGhostItemId(undefined)
    }
    setShowSuggestions(false)
    setSuggestionTarget(null)
  }, [ghostName, ghostPriceCents, ghostItemId, items, onItemsChange])

  // Handle ghost name blur
  const handleGhostNameBlur = useCallback(() => {
    // Don't commit yet - user might tap price next
    setSuggestionTarget(null)
    setShowSuggestions(false)
  }, [])

  // Handle Enter key on ghost name - commit and continue adding
  const handleGhostNameSubmit = useCallback(() => {
    const name = ghostName.trim()
    if (name) {
      // Commit the item (even without price - user can edit later)
      const newItem: ItemEntry = {
        id: `item-${Date.now()}`,
        name,
        priceCents: ghostPriceCents,
        quantity: 1,
        itemId: ghostItemId,
      }
      onItemsChange([...items, newItem])
      // Reset ghost and keep focus for next item
      setGhostName('')
      setGhostPriceCents(0)
      setGhostItemId(undefined)
      setShowSuggestions(false)
      // Keep focus on the input for continuous entry
      setTimeout(() => ghostNameRef.current?.focus(), 50)
    }
  }, [ghostName, ghostPriceCents, ghostItemId, items, onItemsChange])

  // Handle ghost name focus
  const handleGhostNameFocus = useCallback(() => {
    setSuggestionTarget('ghost')
    if (!expanded) {
      onExpandedChange(true)
    }
  }, [expanded, onExpandedChange])

  // Open price keypad for ghost row (always allowed)
  const openGhostPriceKeypad = useCallback(() => {
    Keyboard.dismiss()
    setPriceKeypadTarget('ghost')
    setKeypadPriceCentsText(ghostPriceCents > 0 ? String(ghostPriceCents) : '')
    setShowPriceKeypad(true)
  }, [ghostPriceCents])

  // Handle selecting a suggestion for ghost row
  const handleGhostSuggestion = useCallback((suggestion: TrackedItem) => {
    setGhostName(suggestion.name)
    setGhostItemId(suggestion.id)

    // Auto-fill price from last known price at this merchant's store
    if (merchant) {
      const store = getStoreByMerchant(merchant)
      if (store) {
        const lastPrice = getLatestPriceForItemAtStore(suggestion.id, store.id)
        if (lastPrice) {
          setGhostPriceCents(lastPrice.priceCents)
        }
      }
    }

    setShowSuggestions(false)
    setSuggestionTarget(null)
  }, [merchant])

  // Start editing existing item name
  const startEditName = useCallback((index: number) => {
    setEditingIndex(index)
    setEditingField('name')
    setEditingName(items[index].name)
    setEditingPriceCents(items[index].priceCents)
    setSuggestionTarget(index)
    setTimeout(() => editingNameRef.current?.focus(), 50)
  }, [items])

  // Handle editing name blur
  const handleEditNameBlur = useCallback(() => {
    if (editingIndex === null) return
    const name = editingName.trim()
    if (name) {
      const updated = [...items]
      updated[editingIndex] = { ...updated[editingIndex], name }
      onItemsChange(updated)
    }
    setEditingField(null)
    setSuggestionTarget(null)
    setShowSuggestions(false)
  }, [editingIndex, editingName, items, onItemsChange])

  // Open price keypad for existing item
  const openItemPriceKeypad = useCallback((index: number) => {
    Keyboard.dismiss()
    setEditingIndex(index)
    setPriceKeypadTarget(index)
    setKeypadPriceCentsText(items[index].priceCents > 0 ? String(items[index].priceCents) : '')
    setShowPriceKeypad(true)
  }, [items])

  // Handle selecting a suggestion for existing item
  const handleItemSuggestion = useCallback((suggestion: TrackedItem) => {
    if (editingIndex === null) return

    setEditingName(suggestion.name)
    const updated = [...items]
    updated[editingIndex] = {
      ...updated[editingIndex],
      name: suggestion.name,
      itemId: suggestion.id,
    }

    // Auto-fill price
    if (merchant) {
      const store = getStoreByMerchant(merchant)
      if (store) {
        const lastPrice = getLatestPriceForItemAtStore(suggestion.id, store.id)
        if (lastPrice) {
          updated[editingIndex].priceCents = lastPrice.priceCents
        }
      }
    }

    onItemsChange(updated)
    setShowSuggestions(false)
    setSuggestionTarget(null)
  }, [editingIndex, items, merchant, onItemsChange])

  // Remove item
  const handleRemoveItem = useCallback((index: number) => {
    const updated = items.filter((_, i) => i !== index)
    onItemsChange(updated)
  }, [items, onItemsChange])

  // Price keypad handlers
  const handleKeypadDigit = useCallback((d: string) => {
    setKeypadPriceCentsText(prev => {
      const next = prev + d
      return next.length > 10 ? prev : next
    })
  }, [])

  const handleKeypadBackspace = useCallback(() => {
    setKeypadPriceCentsText(prev => prev.slice(0, -1))
  }, [])

  const handleKeypadClear = useCallback(() => {
    setKeypadPriceCentsText('')
  }, [])

  const handleKeypadDone = useCallback(() => {
    const cents = parseInt(keypadPriceCentsText, 10) || 0

    if (priceKeypadTarget === 'ghost') {
      const name = ghostName.trim()
      // Commit if we have name OR price (not requiring both)
      if (name || cents > 0) {
        const newItem: ItemEntry = {
          id: `item-${Date.now()}`,
          name: name || 'Item', // Default name if only price provided
          priceCents: cents,
          quantity: 1,
          itemId: ghostItemId,
        }
        onItemsChange([...items, newItem])
        setGhostName('')
        setGhostPriceCents(0)
        setGhostItemId(undefined)
      } else {
        // Just update ghost price without committing (user might add name next)
        setGhostPriceCents(cents)
      }
    } else if (typeof priceKeypadTarget === 'number') {
      const updated = [...items]
      updated[priceKeypadTarget] = { ...updated[priceKeypadTarget], priceCents: cents }
      onItemsChange(updated)
    }

    setShowPriceKeypad(false)
    setPriceKeypadTarget(null)
    setKeypadPriceCentsText('')
    setEditingIndex(null)
    setEditingField(null)
  }, [keypadPriceCentsText, priceKeypadTarget, ghostName, ghostItemId, items, onItemsChange])

  const handleKeypadClose = useCallback(() => {
    setShowPriceKeypad(false)
    setPriceKeypadTarget(null)
    setKeypadPriceCentsText('')
  }, [])

  // Get keypad display
  const keypadAmountDisplay = formatCentsDisplay(parseInt(keypadPriceCentsText, 10) || 0)
  const keypadTitle = priceKeypadTarget === 'ghost'
    ? ghostName
    : typeof priceKeypadTarget === 'number'
      ? items[priceKeypadTarget]?.name
      : undefined

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <Pressable
        onPress={() => onExpandedChange(!expanded)}
        style={styles.header}
      >
        <Text style={[styles.headerLabel, { color: theme.semantic.text }]}>
          Items
        </Text>
        <View style={styles.headerRight}>
          {!expanded ? (
            // Collapsed: show "+ Add items"
            <Text style={[styles.headerPlaceholder, { color: theme.semantic.primary }]}>
              + Add items
            </Text>
          ) : itemCount > 0 ? (
            // Expanded with items: show count and total
            <Text style={[styles.headerValue, { color: theme.semantic.text }]}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'} · {formatCurrency(total / 100)}
            </Text>
          ) : null}
          <Text style={[styles.headerChevron, { color: theme.semantic.textSecondary }]}>
            ›
          </Text>
        </View>
      </Pressable>

      {/* Expanded content */}
      {expanded && (
        <View style={styles.content}>
          {/* Existing items */}
          {items.map((item, index) => {
            const isEditingName = editingIndex === index && editingField === 'name'

            return (
              <View key={item.id} style={[styles.itemRow, { borderBottomColor: theme.semantic.border }]}>
                {/* Name cell */}
                {isEditingName ? (
                  <TextInput
                    ref={editingNameRef}
                    value={editingName}
                    onChangeText={setEditingName}
                    onBlur={handleEditNameBlur}
                    style={[styles.itemNameInput, { color: theme.semantic.text, borderBottomColor: theme.semantic.primary }]}
                    autoFocus
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                ) : (
                  <Pressable onPress={() => startEditName(index)} style={styles.itemNameCell}>
                    <Text
                      style={[styles.itemName, { color: theme.semantic.text }]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                )}

                {/* Price cell */}
                <Pressable onPress={() => openItemPriceKeypad(index)} style={styles.itemPriceCell}>
                  <Text style={[styles.itemPrice, { color: theme.semantic.text }]}>
                    {item.priceCents > 0 ? formatCurrency(item.priceCents / 100) : '$0.00'}
                  </Text>
                </Pressable>

                {/* Delete button */}
                <Pressable onPress={() => handleRemoveItem(index)} style={styles.deleteBtn} hitSlop={8}>
                  <FontAwesome name="times" size={14} color={theme.semantic.textSecondary} />
                </Pressable>
              </View>
            )
          })}

          {/* Suggestions dropdown (for existing item editing) */}
          {showSuggestions && typeof suggestionTarget === 'number' && (
            <View style={[styles.suggestions, { backgroundColor: theme.semantic.surface, borderColor: theme.semantic.border }]}>
              {suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion.id}
                  onPress={() => handleItemSuggestion(suggestion)}
                  style={[styles.suggestionItem, { borderBottomColor: theme.semantic.border }]}
                >
                  <Text style={styles.suggestionEmoji}>{suggestion.icon || '📦'}</Text>
                  <Text style={[styles.suggestionName, { color: theme.semantic.text }]}>
                    {suggestion.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Ghost row - always visible */}
          <View style={styles.ghostRow}>
            {/* Name input */}
            <View style={styles.ghostNameCell}>
              <TextInput
                ref={ghostNameRef}
                value={ghostName}
                onChangeText={setGhostName}
                onFocus={handleGhostNameFocus}
                onBlur={handleGhostNameBlur}
                onSubmitEditing={handleGhostNameSubmit}
                placeholder="e.g., Milk"
                placeholderTextColor={theme.semantic.textSecondary}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                blurOnSubmit={false}
                style={[
                  styles.ghostNameInput,
                  {
                    color: theme.semantic.text,
                    borderBottomColor: ghostName ? theme.semantic.primary : theme.semantic.border,
                  },
                ]}
              />
            </View>

            {/* Price cell - always tappable */}
            <Pressable
              onPress={openGhostPriceKeypad}
              style={styles.ghostPriceCell}
            >
              <Text
                style={[
                  styles.ghostPrice,
                  {
                    color: ghostPriceCents > 0 ? theme.semantic.text : theme.semantic.textSecondary,
                    borderBottomColor: theme.semantic.border,
                  },
                ]}
              >
                {ghostPriceCents > 0 ? formatCurrency(ghostPriceCents / 100) : '$0.00'}
              </Text>
            </Pressable>
          </View>

          {/* Suggestions dropdown (for ghost row) */}
          {showSuggestions && suggestionTarget === 'ghost' && (
            <View style={[styles.suggestions, { backgroundColor: theme.semantic.surface, borderColor: theme.semantic.border }]}>
              {suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion.id}
                  onPress={() => handleGhostSuggestion(suggestion)}
                  style={[styles.suggestionItem, { borderBottomColor: theme.semantic.border }]}
                >
                  <Text style={styles.suggestionEmoji}>{suggestion.icon || '📦'}</Text>
                  <Text style={[styles.suggestionName, { color: theme.semantic.text }]}>
                    {suggestion.name}
                  </Text>
                </Pressable>
              ))}
              {ghostName.trim().length >= 2 && (
                <Pressable
                  onPress={() => {
                    setShowSuggestions(false)
                    setSuggestionTarget(null)
                  }}
                  style={styles.suggestionItem}
                >
                  <Text style={styles.suggestionEmoji}>➕</Text>
                  <Text style={[styles.suggestionName, { color: theme.semantic.textSecondary }]}>
                    Add "{ghostName}" as new item
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      )}

      {/* Price Keypad Sheet */}
      <AmountKeypadSheet
        visible={showPriceKeypad}
        amountDisplay={keypadAmountDisplay}
        title={keypadTitle}
        hideEstimated
        onDigit={handleKeypadDigit}
        onBackspace={handleKeypadBackspace}
        onClear={handleKeypadClear}
        onDone={handleKeypadDone}
        onClose={handleKeypadClose}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  headerLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wider,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerValue: {
    fontSize: fontSize.md,
  },
  headerPlaceholder: {
    fontSize: fontSize.sm,
  },
  headerChevron: {
    fontSize: fontSize.lg,
  },
  // Content
  content: {
    marginTop: -spacing.xs,
  },
  // Item row
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    minHeight: 44,
  },
  itemNameCell: {
    flex: 1,
    paddingRight: spacing.md,
  },
  itemName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  itemNameInput: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    borderBottomWidth: 1,
    paddingVertical: spacing.xs,
    marginRight: spacing.md,
  },
  itemPriceCell: {
    paddingHorizontal: spacing.sm,
  },
  itemPrice: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
  deleteBtn: {
    padding: spacing.sm,
  },
  // Ghost row
  ghostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  ghostNameCell: {
    flex: 1,
    paddingRight: spacing.md,
  },
  ghostNameInput: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    borderBottomWidth: 1,
    paddingVertical: spacing.xs,
  },
  ghostPriceCell: {
    paddingHorizontal: spacing.sm,
  },
  ghostPrice: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
    borderBottomWidth: 1,
    paddingVertical: spacing.xs,
  },
  // Suggestions
  suggestions: {
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  suggestionEmoji: {
    fontSize: 16,
  },
  suggestionName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
})
