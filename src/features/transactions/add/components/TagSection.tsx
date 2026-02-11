/**
 * TagSection Component
 *
 * Expandable accordion for selecting/creating tags.
 * Follows Apple Reminders style with categorized suggestions.
 */

import type { Tag } from '@/domain/tag'
import { useHoHTheme } from '@/providers'
import { useTagsStore } from '@/store'
import { fontSize } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import React, { useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

type Props = {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

export function TagSection({ selectedTags, onTagsChange }: Props) {
  const theme = useHoHTheme()
  const [expanded, setExpanded] = useState(false)
  const [newTagInput, setNewTagInput] = useState('')

  const { getAllTags, getTagsByCategory, createTag } = useTagsStore()

  const quickTags = getTagsByCategory('quick')
  const occurrenceTags = getTagsByCategory('occurrence')

  const isSelected = (tagName: string) => selectedTags.includes(tagName)

  const toggleTag = (tagName: string) => {
    if (isSelected(tagName)) {
      onTagsChange(selectedTags.filter((t) => t !== tagName))
    } else {
      onTagsChange([...selectedTags, tagName])
    }
  }

  const handleCreateTag = () => {
    const trimmed = newTagInput.trim()
    if (!trimmed) return

    createTag(trimmed, 'custom')
    if (!isSelected(trimmed)) {
      onTagsChange([...selectedTags, trimmed])
    }
    setNewTagInput('')
  }

  // Preview text for collapsed state
  const previewText = selectedTags.length > 0
    ? selectedTags.join(', ')
    : 'None'

  return (
    <View style={[styles.container, { backgroundColor: theme.semantic.surfaceAlt }]}>
      {/* Header - Always visible */}
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={styles.header}
      >
        <Text style={[styles.label, { color: theme.semantic.text }]}>Tags</Text>
        <View style={styles.headerRight}>
          <Text
            style={[styles.preview, { color: theme.semantic.textSecondary }]}
            numberOfLines={1}
          >
            {previewText}
          </Text>
          <FontAwesome
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={12}
            color={theme.semantic.textSecondary}
          />
        </View>
      </Pressable>

      {/* Expanded content */}
      {expanded && (
        <View style={styles.content}>
          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>
                Selected
              </Text>
              <View style={styles.chipRow}>
                {selectedTags.map((tag) => (
                  <Pressable
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={[styles.chip, styles.chipSelected, { backgroundColor: theme.semantic.primary }]}
                  >
                    <Text style={[styles.chipText, { color: '#fff' }]}>{tag}</Text>
                    <FontAwesome name="times" size={10} color="#fff" style={{ marginLeft: 6 }} />
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Quick Add */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>
              Quick Add
            </Text>
            <View style={styles.chipRow}>
              {quickTags.map((tag) => (
                <TagChip
                  key={tag.id}
                  tag={tag}
                  selected={isSelected(tag.name)}
                  onPress={() => toggleTag(tag.name)}
                  theme={theme}
                />
              ))}
            </View>
          </View>

          {/* By Occurrence */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>
              By Occurrence
            </Text>
            <View style={styles.chipRow}>
              {occurrenceTags.map((tag) => (
                <TagChip
                  key={tag.id}
                  tag={tag}
                  selected={isSelected(tag.name)}
                  onPress={() => toggleTag(tag.name)}
                  theme={theme}
                />
              ))}
            </View>
          </View>

          {/* Create New */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>
              Create New
            </Text>
            <View style={[styles.inputRow, { borderColor: theme.semantic.border }]}>
              <TextInput
                value={newTagInput}
                onChangeText={setNewTagInput}
                placeholder="Type to create..."
                placeholderTextColor={theme.semantic.textSecondary}
                style={[styles.input, { color: theme.semantic.text }]}
                returnKeyType="done"
                onSubmitEditing={handleCreateTag}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {newTagInput.trim() && (
                <Pressable onPress={handleCreateTag} hitSlop={8}>
                  <FontAwesome name="plus-circle" size={20} color={theme.semantic.primary} />
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

type TagChipProps = {
  tag: Tag
  selected: boolean
  onPress: () => void
  theme: ReturnType<typeof useHoHTheme>
}

function TagChip({ tag, selected, onPress, theme }: TagChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.semantic.primary : theme.semantic.surface,
          borderColor: selected ? theme.semantic.primary : theme.semantic.border,
        }
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? '#fff' : theme.semantic.text }
        ]}
      >
        {tag.name}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  preview: {
    fontSize: fontSize.md,
    maxWidth: 180,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipSelected: {
    borderWidth: 0,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    padding: 0,
  },
})
