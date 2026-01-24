import React from 'react'
import { Text, View } from 'react-native'

import type { CalendarColors } from '../calendar'
import type { BudgetData } from './useBudgetSummary'

type Props = {
  data: BudgetData
  colors: CalendarColors
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
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthName = months[parseInt(m, 10) - 1] || m
  return `${monthName} ${parseInt(d, 10)}`
}

export function BudgetSummaryCard({ data, colors }: Props) {
  const {
    budgetDollar,
    spentDollar,
    remainingDollar,
    percentUsed,
    isOverBudget,
    crossedOnDate
  } = data

  // Clamp percent for progress bar (max 100%)
  const barPercent = Math.min(percentUsed, 100)
  const statusColor = isOverBudget ? colors.danger : colors.success

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        gap: 12
      }}
    >
      {/* Header */}
      <Text
        style={{
          fontSize: 13,
          fontWeight: '800',
          color: colors.text,
          letterSpacing: 0.3,
          textTransform: 'uppercase'
        }}
      >
        Budget Summary
      </Text>

      {/* Main row: spent / budget + percentage */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between'
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
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
              fontWeight: '700',
              color: colors.text,
              opacity: 0.6
            }}
          >
            / {formatDollar(budgetDollar)}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 20,
            fontWeight: '900',
            color: statusColor
          }}
        >
          {Math.round(percentUsed)}%
        </Text>
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.surfaceAlt,
          overflow: 'hidden'
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${barPercent}%`,
            borderRadius: 4,
            backgroundColor: statusColor
          }}
        />
      </View>

      {/* Bottom row: labels + remaining */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <View style={{ flexDirection: 'row', gap: 24 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, opacity: 0.6 }}>
            Spent
          </Text>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, opacity: 0.6 }}>
            Budget
          </Text>
        </View>

        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: statusColor
          }}
        >
          {isOverBudget
            ? `${formatDollar(Math.abs(remainingDollar))} over`
            : `${formatDollar(remainingDollar)} left`}
        </Text>
      </View>

      {/* Warning: budget crossed date */}
      {crossedOnDate && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginTop: 4
          }}
        >
          <Text style={{ fontSize: 14 }}>!</Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: colors.danger
            }}
          >
            Budget crossed on {formatDate(crossedOnDate)}
          </Text>
        </View>
      )}
    </View>
  )
}
