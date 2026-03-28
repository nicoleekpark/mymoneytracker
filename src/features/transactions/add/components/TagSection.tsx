/**
 * TagSection Component
 *
 * Non-accordion tag selector with single pool of chips.
 * Selected tags have tinted background (same as category/account).
 * No duplication - selection toggles in-place.
 */

import type { Tag } from '@/core/domain/tag'
import { useHoHTheme } from '@/shared/providers'
import { useTagsStore } from '@/shared/store'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import React, { useEffect, useRef, useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type Props = {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

export function TagSection({ selectedTags, onTagsChange }: Props) {
  const theme = useHoHTheme()
  const [isCreating, setIsCreating] = useState(false)
  const [newTagValue, setNewTagValue] = useState('')
  const inputRef = useRef<TextInput>(null)

  const { getTagsByCategory, createTag } = useTagsStore()

  // Merge all tags into single pool (quick + occurrence + custom)
  const quickTags = getTagsByCategory('quick')
  const occurrenceTags = getTagsByCategory('occurrence')
  const customTags = getTagsByCategory('custom')
  const storeTags = [...quickTags, ...occurrenceTags, ...customTags]

  // Include selected tags that aren't in the store (e.g., loaded from database after app restart)
  const storeTagNames = new Set(storeTags.map((t) => t.name.toLowerCase()))
  const extraSelectedTags: Tag[] = selectedTags
    .filter((name) => !storeTagNames.has(name.toLowerCase()))
    .map((name) => ({
      id: `selected-${name}`,
      name,
      category: 'custom' as const,
      createdAt: new Date().toISOString(),
    }))

  const allTags = [...storeTags, ...extraSelectedTags]

  const isSelected = (tagName: string) => selectedTags.includes(tagName)

  const toggleTag = (tagName: string) => {
    if (isSelected(tagName)) {
      onTagsChange(selectedTags.filter((t) => t !== tagName))
    } else {
      onTagsChange([...selectedTags, tagName])
    }
  }

  const startCreating = () => {
    setIsCreating(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleCreate = () => {
    const trimmed = newTagValue.trim()
    if (trimmed) {
      createTag(trimmed, 'custom')
      if (!isSelected(trimmed)) {
        onTagsChange([...selectedTags, trimmed])
      }
    }
    setNewTagValue('')
    setIsCreating(false)
  }

  const handleBlur = () => {
    handleCreate()
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: selectedTags.length > 0 ? theme.semantic.textSecondary : theme.semantic.text }]}>
        Tags
      </Text>

      {/* Single pool of all tags */}
      <View style={styles.chipRow}>
        {allTags.map((tag) => (
          <AnimatedTagChip
            key={tag.id}
            tag={tag}
            selected={isSelected(tag.name)}
            onPress={() => toggleTag(tag.name)}
            theme={theme}
          />
        ))}

        {/* Create new - editable chip */}
        {isCreating ? (
          <View style={[styles.chip, styles.chipEditing, { borderColor: theme.semantic.primary }]}>
            <TextInput
              ref={inputRef}
              value={newTagValue}
              onChangeText={setNewTagValue}
              onBlur={handleBlur}
              onSubmitEditing={handleCreate}
              style={[styles.chipInput, { color: theme.semantic.text }]}
              placeholder="tag name"
              placeholderTextColor={theme.semantic.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
          </View>
        ) : (
          <Pressable
            onPress={startCreating}
            style={[styles.chip, { backgroundColor: 'transparent', borderColor: theme.semantic.border }]}
          >
            <FontAwesome name="plus" size={10} color={theme.semantic.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.chipText, { color: theme.semantic.textSecondary }]}>New</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

/**
 * Animated tag chip with selection effect
 * Same style as category/account chips
 */
type AnimatedTagChipProps = {
  tag: Tag
  selected: boolean
  onPress: () => void
  theme: ReturnType<typeof useHoHTheme>
}

function AnimatedTagChip({ tag, selected, onPress, theme }: AnimatedTagChipProps) {
  const scale = useSharedValue(1)
  const selectionProgress = useSharedValue(selected ? 1 : 0)

  useEffect(() => {
    selectionProgress.value = withTiming(selected ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    })
  }, [selected, selectionProgress])

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      selectionProgress.value,
      [0, 1],
      ['transparent', theme.semantic.primary + '20']
    )

    const borderColor = interpolateColor(
      selectionProgress.value,
      [0, 1],
      [theme.semantic.border, theme.semantic.primary]
    )

    return {
      transform: [{ scale: scale.value }],
      backgroundColor,
      borderColor,
    }
  })

  const textAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      selectionProgress.value,
      [0, 1],
      [theme.semantic.textSecondary, theme.semantic.primary]
    )

    return { color }
  })

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 })
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.chip, animatedStyle]}
    >
      <Animated.Text style={[styles.chipText, textAnimatedStyle]}>
        {tag.name}
      </Animated.Text>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipEditing: {
    paddingVertical: spacing.xs,
    minWidth: 80,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  chipInput: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    padding: 0,
    minWidth: 60,
  },
})
