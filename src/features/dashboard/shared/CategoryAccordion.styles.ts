import { StyleSheet } from 'react-native'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'
import { opacity } from '@/shared/theme/tokens/opacity'
import { CATEGORY_DOT_SIZE } from '@/shared/theme/tokens/viewStyles'

export function createCategoryAccordionStyles() {
  return StyleSheet.create({
    container: {
      gap: spacing.md,
    },

    // Category row
    categoryRow: {
      gap: spacing.sm,
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    categoryDot: {
      width: CATEGORY_DOT_SIZE,
      height: CATEGORY_DOT_SIZE,
      borderRadius: radius.full,
    },
    categoryName: {
      flex: 1,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },
    categoryAmount: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
    },
    categoryPercent: {
      width: 44,
      textAlign: 'right',
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
    },
    chevronContainer: {
      width: 20,
      alignItems: 'center',
    },
    chevron: {
      fontSize: fontSize.xs,
    },

    // Category bar
    barContainer: {
      height: spacing.sm,
      borderRadius: radius.sm,
      marginLeft: spacing.lg,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: radius.sm,
    },

    // Subcategory section
    subcategoryContainer: {
      marginLeft: spacing.xl + spacing.xs,
      marginTop: spacing.xs,
      gap: spacing.sm,
    },
    subcategoryHeader: {
      fontSize: fontSize.xs,
      marginBottom: spacing.xs,
    },
    subcategoryRow: {
      gap: spacing.xs,
    },
    subcategoryContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    subcategoryDot: {
      width: 6,
      height: 6,
      borderRadius: radius.full,
      opacity: opacity.tertiary,
    },
    subcategoryName: {
      flex: 1,
      fontSize: fontSize.xs,
      opacity: opacity.secondary,
    },
    subcategoryAmount: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      opacity: opacity.secondary,
    },
    subcategoryPercent: {
      width: 44,
      textAlign: 'right',
      fontSize: fontSize.xs,
    },
    subcategorySpacer: {
      width: 20,
    },
    subcategoryBarContainer: {
      height: spacing.xs,
      borderRadius: radius.xs,
      marginLeft: spacing.md,
      overflow: 'hidden',
    },
    subcategoryBarFill: {
      height: '100%',
      borderRadius: radius.xs,
      opacity: opacity.divider,
    },

    // Show all button
    showAllButton: {
      marginTop: spacing.lg,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    showAllText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },

    // Empty state
    emptyText: {
      textAlign: 'center',
      paddingVertical: spacing.xl,
    },
  })
}

export type CategoryAccordionStyles = ReturnType<typeof createCategoryAccordionStyles>
