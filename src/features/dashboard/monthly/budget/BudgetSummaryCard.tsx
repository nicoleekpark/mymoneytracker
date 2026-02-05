import FontAwesome from '@expo/vector-icons/FontAwesome'
import React, { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { useHoHTheme } from '@/providers'
import { Stack } from '@/shared/components'
import { getMonthNameShort } from '../../types/dashboard.types'
import type { CalendarColors } from '../calendar'
import type { BudgetData } from './useBudgetSummary'

type Props = {
  data: BudgetData
  colors: CalendarColors
  /** When true, renders without card wrapper (for use inside AccordionCard) */
  embedded?: boolean
}

function formatDollar(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 1_000_000) {
    return `$${(abs / 1_000_000).toFixed(1)}M`
  }
  if (abs >= 10_000) {
    return `$${(abs / 1_000).toFixed(1)}K`
  }
  return `$${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function formatDate(ymd: string): string {
  // YYYY-MM-DD -> "Jan 24"
  const [, m, d] = ymd.split('-')
  return `${getMonthNameShort(parseInt(m, 10))} ${parseInt(d, 10)}`
}

export function BudgetSummaryCard({ data, colors, embedded = false }: Props) {
  const theme = useHoHTheme()
  const {
    budgetDollar,
    spentDollar,
    remainingDollar,
    percentUsed,
    isOverBudget,
    crossedOnDate
  } = data

  const [showCrossedDate, setShowCrossedDate] = useState(false)

  // Clamp percent for progress bar (max 100%)
  const barPercent = Math.min(percentUsed, 100)

  // Status color: red (over), yellow (80-100%), green (under 80%)
  const isWarning = !isOverBudget && percentUsed >= 80
  const statusColor = isOverBudget ? colors.danger : isWarning ? theme.semantic.primary : colors.success

  // Badge position: clamp between 15% and 85% to avoid edge overflow
  const badgePercent = Math.max(15, Math.min(85, barPercent))

  return (
    <Stack
      gap="md"
      style={embedded ? { overflow: 'visible' } : {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        overflow: 'visible'
      }}
    >
      {/* Combined spent/budget line */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: '900',
            color: colors.text
          }}
        >
          {formatDollar(spentDollar)}
        </Text>
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
            opacity: 0.5
          }}
        >
          {' '}of {formatDollar(budgetDollar)} spent
        </Text>
      </View>

      {/* Progress bar with percentage on bar */}
      <View style={{ position: 'relative' }}>
        <View
          style={{
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.surfaceAlt,
            overflow: 'hidden'
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${barPercent}%`,
              borderRadius: 12,
              backgroundColor: statusColor
            }}
          />
        </View>

        {/* Percentage on bar */}
        <View
          style={{
            position: 'absolute',
            left: `${badgePercent}%`,
            top: 0,
            bottom: 0,
            transform: [{ translateX: -18 }],
            justifyContent: 'center'
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '800',
              color: '#FFFFFF',
              minWidth: 36,
              textAlign: 'center'
            }}
          >
            {Math.round(percentUsed)}%
          </Text>
        </View>
      </View>

      {/* Status with icon */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <FontAwesome
          name={isOverBudget || isWarning ? 'exclamation-triangle' : 'check-circle'}
          size={16}
          color={statusColor}
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: statusColor
          }}
        >
          {isOverBudget
            ? `${formatDollar(Math.abs(remainingDollar))} over budget`
            : `${formatDollar(remainingDollar)} left to spend`}
        </Text>

        {/* Info icon */}
        {crossedOnDate && (
          <Pressable
            onPress={() => setShowCrossedDate((v) => !v)}
            hitSlop={8}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <FontAwesome
              name="info-circle"
              size={14}
              color={colors.danger}
              style={{ opacity: 0.5 }}
            />
            {/* Inline bubble - shows when clicked */}
            {showCrossedDate && (
              <>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: colors.danger,
                    marginLeft: 4
                  }}
                >
                  Since {formatDate(crossedOnDate)}
                </Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </Stack>
  )
}
