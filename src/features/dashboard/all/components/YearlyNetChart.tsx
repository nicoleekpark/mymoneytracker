import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import { BarChart } from 'react-native-gifted-charts'

import { formatUsdInt } from '@/shared/format/currency'
import type { YearlyFlowDollar } from '@/domain/transaction/transaction.usecase'

type Colors = {
  text: string
  textSecondary: string
  surface: string
  surfaceAlt: string
  success: string
  danger: string
}

type Props = {
  data: YearlyFlowDollar[]
  colors: Colors
}

function formatCompactAmount(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (abs >= 1000) {
    return `$${Math.round(amount / 1000)}K`
  }
  return `$${Math.round(amount)}`
}

export function YearlyNetChart({ data, colors }: Props) {
  const currentYear = new Date().getFullYear()

  const chartData = useMemo(() => {
    return data.map((d) => {
      const net = d.incomeDollar - d.expenseDollar
      const isPositive = net >= 0
      const isCurrentYear = d.year === currentYear

      return {
        value: Math.abs(net),
        label: String(d.year),
        frontColor: isPositive ? colors.success : colors.danger,
        labelTextStyle: { color: colors.textSecondary, fontSize: 11 },
        topLabelComponent: () => (
          <View style={{ alignItems: 'center', marginBottom: 4 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: isPositive ? colors.success : colors.danger
              }}
            >
              {isPositive ? '+' : '-'}{formatCompactAmount(Math.abs(net))}
            </Text>
            {isCurrentYear && (
              <Text style={{ fontSize: 8, color: colors.textSecondary }}>(YTD)</Text>
            )}
          </View>
        ),
        // Store original net value for tooltip
        originalValue: net
      }
    })
  }, [data, colors, currentYear])

  if (data.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 40 }}>
        <Text style={{ color: colors.textSecondary }}>No data yet</Text>
      </View>
    )
  }

  const maxValue = Math.max(...chartData.map(d => d.value))

  return (
    <View>
      <BarChart
        data={chartData}
        width={280}
        height={160}
        barWidth={data.length <= 4 ? 40 : 28}
        spacing={data.length <= 4 ? 24 : 16}
        hideRules
        yAxisColor="transparent"
        xAxisColor={colors.surfaceAlt}
        yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
        yAxisLabelWidth={50}
        formatYLabel={(val) => formatCompactAmount(Number(val))}
        noOfSections={4}
        maxValue={maxValue * 1.3}
        initialSpacing={16}
        endSpacing={16}
        barBorderRadius={4}
        disablePress
      />
    </View>
  )
}
