/**
 * DraggableChipList
 *
 * Drag-and-drop reorderable list for quick action chips.
 * Uses react-native-gesture-handler and react-native-reanimated.
 */

import { CategoryIcon } from '@/shared/components'
import { useHoHTheme } from '@/shared/providers'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import React, { useCallback, useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'

const ROW_HEIGHT = 52
const SPRING_CONFIG = { damping: 20, stiffness: 200 }

export type ChipDisplayInfo = {
  key: string
  subCategoryKey?: string
  type: 'category' | 'payment' | 'special'
  label: string
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
  const scale = useSharedValue(1)
  const zIndex = useSharedValue(0)

  const gesture = Gesture.Pan()
    .activateAfterLongPress(200)
    .onStart(() => {
      isDragging.value = true
      scale.value = withSpring(1.03, SPRING_CONFIG)
      zIndex.value = 100
      activeIndex.value = index
    })
    .onUpdate((event) => {
      translateY.value = event.translationY

      // Calculate which position we're hovering over
      const currentY = index * ROW_HEIGHT + event.translationY
      let newIndex = Math.round(currentY / ROW_HEIGHT)
      newIndex = Math.max(0, Math.min(totalCount - 1, newIndex))

      // Update positions for other items
      const positions = [...currentPositions.value]
      for (let i = 0; i < totalCount; i++) {
        if (i === index) {
          positions[i] = newIndex
        } else {
          // Calculate where this item should be based on the dragged item's position
          if (index < newIndex) {
            // Dragging down
            positions[i] = i > index && i <= newIndex ? i - 1 : i
          } else {
            // Dragging up
            positions[i] = i >= newIndex && i < index ? i + 1 : i
          }
        }
      }
      currentPositions.value = positions
    })
    .onEnd(() => {
      const currentY = index * ROW_HEIGHT + translateY.value
      let newIndex = Math.round(currentY / ROW_HEIGHT)
      newIndex = Math.max(0, Math.min(totalCount - 1, newIndex))

      isDragging.value = false
      translateY.value = withSpring(0, SPRING_CONFIG)
      scale.value = withSpring(1, SPRING_CONFIG)
      zIndex.value = 0
      activeIndex.value = -1

      // Reset positions
      const resetPositions = Array.from({ length: totalCount }, (_, i) => i)
      currentPositions.value = resetPositions

      if (newIndex !== index) {
        runOnJS(onDragEnd)(index, newIndex)
      }
    })
    .onFinalize(() => {
      isDragging.value = false
      translateY.value = withSpring(0, SPRING_CONFIG)
      scale.value = withSpring(1, SPRING_CONFIG)
      zIndex.value = 0
      activeIndex.value = -1
    })

  const animatedStyle = useAnimatedStyle(() => {
    // When this item is being dragged
    if (isDragging.value) {
      return {
        transform: [
          { translateY: translateY.value },
          { scale: scale.value },
        ],
        zIndex: zIndex.value,
        shadowOpacity: withTiming(0.15),
        elevation: 8,
      }
    }

    // When another item is being dragged - animate to make space
    if (activeIndex.value !== -1 && activeIndex.value !== index) {
      const targetPosition = currentPositions.value[index] ?? index
      const offset = (targetPosition - index) * ROW_HEIGHT
      return {
        transform: [
          { translateY: withSpring(offset, SPRING_CONFIG) },
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
        { translateY: withSpring(0, SPRING_CONFIG) },
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
        <Text style={[styles.chipLabel, { color: theme.semantic.text }]} numberOfLines={1}>
          {chip.label}
        </Text>
        <Text style={[styles.chipType, { color: theme.semantic.textSecondary }]}>
          {typeLabel}
        </Text>

        {/* Remove button */}
        {showRemoveButton && (
          <Pressable onPress={handleRemove} hitSlop={8} style={styles.removeBtn}>
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
  chipLabel: {
    flex: 1,
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
