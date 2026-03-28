import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useHoHTheme } from '@/shared/providers'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'

export function EmptyState() {
  const theme = useHoHTheme()

  return (
    <View style={styles.container}>
      <FontAwesome name="tag" size={48} color={theme.semantic.textSecondary as string} />
      <Text style={[styles.title, { color: theme.semantic.text }]}>No items tracked yet</Text>
      <Text style={[styles.subtitle, { color: theme.semantic.textSecondary }]}>
        Add items to your transactions to start tracking prices across stores.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
})
