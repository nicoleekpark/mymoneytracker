import React, { useState } from 'react'
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { fontSize, fontWeight } from '@/theme/tokens/typography'
import { spacing } from '@/theme/tokens/spacing'
import { radius } from '@/theme/tokens/radius'
import type { SectionSummary, SectionKey, AccountsColors } from '../accounts.types'
import { SummaryCard } from './SummaryCard'

type Props = {
  summaries: SectionSummary[]
  colors: AccountsColors
  onSectionPress: (sectionKey: SectionKey) => void
}

export function SummaryStrip({ summaries, colors, onSectionPress }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Filter to only show sections that have accounts
  const visibleSummaries = summaries.filter(s => s.hasAccounts)

  const toggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsCollapsed(!isCollapsed)
  }

  // Don't render strip if no sections have accounts
  if (visibleSummaries.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Collapse toggle */}
      <Pressable
        onPress={toggleCollapse}
        style={({ pressed }) => [
          styles.toggleButton,
          { backgroundColor: colors.surfaceAlt },
          pressed && styles.togglePressed,
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
          {isCollapsed ? 'Show summary' : 'Hide'}
        </Text>
        <FontAwesome
          name={isCollapsed ? 'chevron-down' : 'chevron-up'}
          size={10}
          color={colors.textSecondary}
          style={styles.toggleIcon}
        />
      </Pressable>

      {/* Cards row */}
      {!isCollapsed && (
        <View style={styles.cardsRow}>
          {visibleSummaries.map((summary) => (
            <SummaryCard
              key={summary.key}
              summary={summary}
              colors={colors}
              onPress={() => onSectionPress(summary.key)}
            />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  togglePressed: {
    opacity: 0.7,
  },
  toggleText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  toggleIcon: {
    marginLeft: spacing.xs,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
})
