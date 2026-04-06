import React from 'react'
import { Text, View } from 'react-native'
import { fontSize } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'

type ZeroSpendBadgeProps = {
  count: number
  colors: {
    textSecondary: string
    highlight: string
  }
}

/**
 * Badge showing count of zero-spend days with a corner triangle indicator.
 * Displayed above the monthly calendar when there are zero-spend days.
 */
export function ZeroSpendBadge({ count, colors }: ZeroSpendBadgeProps) {
  if (count <= 0) return null

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        {/* Sample cell with top-left corner triangle indicator */}
        <View
          style={{
            width: 16,
            height: 12,
            backgroundColor: colors.textSecondary + '20',
            borderRadius: radius.xs,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderTopWidth: 8,
              borderRightWidth: 8,
              borderBottomWidth: 0,
              borderLeftWidth: 0,
              borderTopColor: colors.highlight,
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
            }}
          />
        </View>
        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
          {count} zero-spend
        </Text>
      </View>
    </View>
  )
}
