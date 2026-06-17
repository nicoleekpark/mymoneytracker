import FontAwesome from '@expo/vector-icons/FontAwesome'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { OPACITY_PRESSED } from '@/shared/theme/tokens/buttons'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'

type EmptyStateColors = {
  text: string
  textSecondary: string
  primary?: string
  onPrimary?: string
}

type EmptyStateAction = {
  label: string
  onPress: () => void
}

type Props = {
  /** Optional FontAwesome icon name */
  icon?: React.ComponentProps<typeof FontAwesome>['name']
  /** Icon size (default: 48) */
  iconSize?: number
  /** Main title text */
  title: string
  /** Optional description text */
  description?: string
  /** Optional CTA button */
  action?: EmptyStateAction
  /** Theme colors */
  colors: EmptyStateColors
}

/**
 * Empty state component for screens/sections with no data.
 * Displays a centered message with optional icon, description, and action button.
 *
 * @example
 * // Basic usage
 * <EmptyState
 *   title="No transactions yet"
 *   description="Add your first transaction to get started."
 *   colors={colors}
 * />
 *
 * @example
 * // With icon and action
 * <EmptyState
 *   icon="line-chart"
 *   title="Not enough data"
 *   description="Add more transactions to see insights."
 *   action={{ label: "Add Transaction", onPress: handleAdd }}
 *   colors={colors}
 * />
 */
export function EmptyState({
  icon,
  iconSize = 48,
  title,
  description,
  action,
  colors,
}: Props) {
  return (
    <View style={styles.container}>
      {icon && (
        <FontAwesome
          name={icon}
          size={iconSize}
          color={colors.textSecondary}
          style={styles.icon}
        />
      )}
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      {description && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      )}
      {action && colors.primary && colors.onPrimary && (
        <Pressable
          onPress={action.onPress}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: colors.primary, opacity: pressed ? OPACITY_PRESSED : 1 },
          ]}
        >
          <Text style={[styles.actionLabel, { color: colors.onPrimary }]}>
            {action.label}
          </Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  icon: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
  },
  actionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
})
