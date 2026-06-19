/**
 * DraggableChipList
 *
 * Drag-and-drop reorderable list for quick action chips.
 * Uses react-native-gesture-handler and react-native-reanimated.
 */

import { CategoryIcon } from '@/shared/components'
import { useHoHTheme } from '@/shared/providers'
import { HIT_SLOP_MD_VALUE } from '@/shared/theme/tokens/buttons'
import { MODAL_ROW_HEIGHT } from '@/shared/theme/tokens/modal'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import React, { useCallback, useMemo, useRef } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated'

const ROW_HEIGHT = MODAL_ROW_HEIGHT

export type ChipDisplayInfo = {
  key: string
  subCategoryKey?: string
  type: 'category' | 'payment' | 'special'
  label: string
  /** Parent category name (for subcategories) */
  parentLabel?: string
  icon: string
  color: string
}

type Props = {
  chips: ChipDisplayInfo[]
  onReorder: (fromIndex: number, toIndex: number) => void
  onRemove: (chip: ChipDisplayInfo) => void
  showRemoveButton?: boolean
}

type DraggableRowProps = {
  chip: ChipDisplayInfo
  index: number
  totalCount: number
  activeIndex: SharedValue<number>
  currentPositions: SharedValue<number[]>
  onDragEnd: (fromIndex: number, toIndex: number) => void
  onRemove: (chip: ChipDisplayInfo) => void
  showRemoveButton: boolean
}

function DraggableRow({
  chip,
  index,
  totalCount,
  activeIndex,
  currentPositions,
  onDragEnd,
  onRemove,
  showRemoveButton,
}: DraggableRowProps) {
  const theme = useHoHTheme()

  const isDragging = useSharedValue(false)
  const translateY = useSharedValue(0)
  const zIndex = useSharedValue(0)

  // Use shared values for index/totalCount so worklets always have current values
  const indexValue = useSharedValue(index)
  const totalCountValue = useSharedValue(totalCount)

  // Update shared values when props change
  React.useEffect(() => {
    indexValue.value = index
  }, [index])

  React.useEffect(() => {
    totalCountValue.value = totalCount
  }, [totalCount])

  // Use ref for callback to avoid stale closures - accessed via runOnJS wrapper
  const onDragEndRef = useRef(onDragEnd)
  onDragEndRef.current = onDragEnd

  // Stable wrapper function that reads from ref
  const callOnDragEnd = useCallback((fromIndex: number, toIndex: number) => {
    onDragEndRef.current(fromIndex, toIndex)
  }, [])

  const gesture = Gesture.Pan()
    .activateAfterLongPress(200)
    .onStart(() => {
      isDragging.value = true
      zIndex.value = 100
      activeIndex.value = indexValue.value
    })
    .onUpdate((event) => {
      translateY.value = event.translationY

      const currentIndex = indexValue.value
      const total = totalCountValue.value

      // Calculate which position we're hovering over
      const currentY = currentIndex * ROW_HEIGHT + event.translationY
      let newIndex = Math.round(currentY / ROW_HEIGHT)
      newIndex = Math.max(0, Math.min(total - 1, newIndex))

      // Update positions for other items
      const positions = [...currentPositions.value]
      for (let i = 0; i < total; i++) {
        if (i === currentIndex) {
          positions[i] = newIndex
        } else {
          // Calculate where this item should be based on the dragged item's position
          if (currentIndex < newIndex) {
            // Dragging down
            positions[i] = i > currentIndex && i <= newIndex ? i - 1 : i
          } else {
            // Dragging up
            positions[i] = i >= newIndex && i < currentIndex ? i + 1 : i
          }
        }
      }
      currentPositions.value = positions
    })
    .onEnd(() => {
      const currentIndex = indexValue.value
      const total = totalCountValue.value

      const currentY = currentIndex * ROW_HEIGHT + translateY.value
      let newIndex = Math.round(currentY / ROW_HEIGHT)
      newIndex = Math.max(0, Math.min(total - 1, newIndex))

      isDragging.value = false
      translateY.value = 0
      zIndex.value = 0
      activeIndex.value = -1

      // Reset positions
      const resetPositions = Array.from({ length: total }, (_, i) => i)
      currentPositions.value = resetPositions

      if (newIndex !== currentIndex) {
        runOnJS(callOnDragEnd)(currentIndex, newIndex)
      }
    })
    .onFinalize(() => {
      isDragging.value = false
      translateY.value = 0
      zIndex.value = 0
      activeIndex.value = -1
    })

  const animatedStyle = useAnimatedStyle(() => {
    // When this item is being dragged
    if (isDragging.value) {
      return {
        transform: [
          { translateY: translateY.value },
          { scale: 1.02 },
        ],
        zIndex: 100,
        shadowOpacity: 0.15,
        elevation: 8,
      }
    }

    // When another item is being dragged - instant position change
    if (activeIndex.value !== -1 && activeIndex.value !== index) {
      const targetPosition = currentPositions.value[index] ?? index
      const offset = (targetPosition - index) * ROW_HEIGHT
      return {
        transform: [
          { translateY: offset },
          { scale: 1 },
        ],
        zIndex: 0,
        shadowOpacity: 0,
        elevation: 0,
      }
    }

    // Default state
    return {
      transform: [
        { translateY: 0 },
        { scale: 1 },
      ],
      zIndex: 0,
      shadowOpacity: 0,
      elevation: 0,
    }
  })

  const handleRemove = useCallback(() => {
    onRemove(chip)
  }, [chip, onRemove])

  const typeLabel = chip.type === 'special'
    ? 'Special'
    : chip.subCategoryKey
      ? 'Subcategory'
      : chip.type === 'category'
        ? 'Category'
        : 'Payment'

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.chipRow,
          {
            top: index * ROW_HEIGHT,
            backgroundColor: theme.semantic.surfaceAlt,
            borderBottomColor: theme.semantic.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
          },
          animatedStyle,
        ]}
      >
        {/* Drag handle */}
        <View style={styles.dragHandle}>
          <FontAwesome name="bars" size={14} color={theme.semantic.textSecondary} />
        </View>

        {/* Chip info */}
        <CategoryIcon name={chip.icon} size={16} color={chip.color} />
        <View style={styles.labelContainer}>
          {chip.parentLabel && (
            <Text style={[styles.parentLabel, { color: theme.semantic.textSecondary }]} numberOfLines={1}>
              {chip.parentLabel}
            </Text>
          )}
          <Text style={[styles.chipLabel, { color: theme.semantic.text }]} numberOfLines={1}>
            {chip.label}
          </Text>
        </View>
        <Text style={[styles.chipType, { color: theme.semantic.textSecondary }]}>
          {typeLabel}
        </Text>

        {/* Remove button */}
        {showRemoveButton && (
          <Pressable onPress={handleRemove} hitSlop={HIT_SLOP_MD_VALUE} style={styles.removeBtn}>
            <FontAwesome name="times-circle" size={18} color={theme.semantic.danger} />
          </Pressable>
        )}
      </Animated.View>
    </GestureDetector>
  )
}

export function DraggableChipList({ chips, onReorder, onRemove, showRemoveButton = true }: Props) {
  const theme = useHoHTheme()

  const activeIndex = useSharedValue(-1)
  const currentPositions = useSharedValue(chips.map((_, i) => i))

  // Update positions when chips array changes
  React.useEffect(() => {
    currentPositions.value = chips.map((_, i) => i)
  }, [chips.length])

  const handleDragEnd = useCallback((fromIndex: number, toIndex: number) => {
    onReorder(fromIndex, toIndex)
  }, [onReorder])

  const containerStyle = useMemo(() => ({
    height: chips.length * ROW_HEIGHT,
  }), [chips.length])

  if (chips.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.semantic.surfaceAlt }]}>
        <Text style={[styles.emptyText, { color: theme.semantic.textSecondary }]}>
          No quick actions. Add some below.
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.semantic.surfaceAlt }, containerStyle]}>
      {chips.map((chip, index) => (
        <DraggableRow
          key={`${chip.type}-${chip.key}-${chip.subCategoryKey ?? ''}`}
          chip={chip}
          index={index}
          totalCount={chips.length}
          activeIndex={activeIndex}
          currentPositions={currentPositions}
          onDragEnd={handleDragEnd}
          onRemove={onRemove}
          showRemoveButton={showRemoveButton}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  emptyContainer: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  chipRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  dragHandle: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  parentLabel: {
    fontSize: fontSize.xs,
    marginBottom: 1,
  },
  chipLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  chipType: {
    fontSize: fontSize.xs,
    marginRight: spacing.sm,
  },
  removeBtn: {
    padding: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
})
