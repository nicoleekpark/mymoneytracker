import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useHoHTheme } from '@/providers'
import { radius } from '@/theme/tokens/radius'
import { spacing } from '@/theme/tokens/spacing'
import { fontSize, fontWeight } from '@/theme/tokens/typography'

type Tab = {
  key: string
  label: string
}

type Props = {
  tabs: Tab[]
  activeKey: string
  onSelect: (key: string) => void
}

export function CategoryTabs({ tabs, activeKey, onSelect }: Props) {
  const theme = useHoHTheme()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey
        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            style={[
              styles.tab,
              {
                backgroundColor: isActive ? theme.semantic.text : theme.semantic.surfaceAlt,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: isActive ? theme.semantic.background : theme.semantic.textSecondary },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
})
