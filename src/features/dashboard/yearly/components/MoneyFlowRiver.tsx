import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import Svg, { Defs, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg'

import type { CategoryRef } from '@/core/domain/category'
import { CATEGORIES } from '@/shared/config/categories.config'
import { formatUsdInt } from '@/shared/format/currency'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'

export type MoneyFlowColors = Readonly<{
  text: string
  textSecondary: string
  border: string
  surface: string
  surfaceAlt: string
  primary: string
  success: string
  danger: string
}>

type FlowItem = Readonly<{
  categoryRef?: CategoryRef
  amount: number
}>

type Props = {
  incomeByCategory: FlowItem[]
  expenseByCategory: FlowItem[]
  netAmount: number
  colors: MoneyFlowColors
}

function getCategoryMeta(categoryRef?: CategoryRef) {
  if (!categoryRef) {
    return { name: 'Other', icon: 'cube', color: '#666' }
  }

  const cat = CATEGORIES.find(c => c.key === categoryRef.categoryKey)
  if (!cat) {
    return { name: categoryRef.categoryKey, icon: 'cube', color: '#666' }
  }

  return { name: cat.name, icon: cat.icon, color: cat.color }
}

// Generate bezier curve path for flow
function generateFlowPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  height1: number,
  height2: number
): string {
  const cx = (x1 + x2) / 2

  // Top curve
  const topPath = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`

  // Bottom curve
  const bottomY1 = y1 + height1
  const bottomY2 = y2 + height2
  const bottomPath = `L ${x2} ${bottomY2} C ${cx} ${bottomY2}, ${cx} ${bottomY1}, ${x1} ${bottomY1}`

  return `${topPath} ${bottomPath} Z`
}

const DIAGRAM_WIDTH = 340
const DIAGRAM_HEIGHT = 200
const NODE_WIDTH = 16
const CENTER_X = DIAGRAM_WIDTH / 2
const MIN_FLOW_HEIGHT = 4

export function MoneyFlowRiver({ incomeByCategory, expenseByCategory, netAmount, colors }: Props) {
  const totalIncome = incomeByCategory.reduce((sum, i) => sum + i.amount, 0)
  const totalExpense = expenseByCategory.reduce((sum, i) => sum + i.amount, 0)

  // Sort and limit categories
  const topIncome = useMemo(() =>
    [...incomeByCategory]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .filter(i => i.amount > 0),
    [incomeByCategory]
  )

  const topExpense = useMemo(() =>
    [...expenseByCategory]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
      .filter(i => i.amount > 0),
    [expenseByCategory]
  )

  // Calculate flow heights
  const maxTotal = Math.max(totalIncome, totalExpense, 1)
  const availableHeight = DIAGRAM_HEIGHT - 40 // padding

  const incomeFlows = topIncome.map(item => ({
    ...item,
    meta: getCategoryMeta(item.categoryRef),
    height: Math.max(MIN_FLOW_HEIGHT, (item.amount / maxTotal) * availableHeight)
  }))

  const expenseFlows = topExpense.map(item => ({
    ...item,
    meta: getCategoryMeta(item.categoryRef),
    height: Math.max(MIN_FLOW_HEIGHT, (item.amount / maxTotal) * availableHeight)
  }))

  // Position calculation
  const incomeStartY = 20
  const expenseStartY = 20

  let incomeY = incomeStartY
  const incomePositions = incomeFlows.map(flow => {
    const y = incomeY
    incomeY += flow.height + 4
    return { ...flow, y }
  })

  let expenseY = expenseStartY
  const expensePositions = expenseFlows.map(flow => {
    const y = expenseY
    expenseY += flow.height + 4
    return { ...flow, y }
  })

  // Center node position
  const centerY = 20
  const totalIncomeHeight = incomePositions.reduce((sum, f) => sum + f.height, 0) + (incomePositions.length - 1) * 4
  const totalExpenseHeight = expensePositions.reduce((sum, f) => sum + f.height, 0) + (expensePositions.length - 1) * 4
  const centerHeight = Math.max(totalIncomeHeight, totalExpenseHeight, 60)

  if (topIncome.length === 0 && topExpense.length === 0) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.xl,
          padding: spacing.xl,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.md }}>
          No cash flow data for this year
        </Text>
      </View>
    )
  }

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border
      }}
    >
      <Text
        style={{
          fontSize: fontSize.lg,
          fontWeight: fontWeight.heavy,
          color: colors.text,
          letterSpacing: letterSpacing.wide,
          textAlign: 'center',
          marginBottom: 12
        }}
      >
        Money Flow
      </Text>

      {/* Labels */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.success }}>
          Income ({formatUsdInt(totalIncome)})
        </Text>
        <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.text }}>
          You
        </Text>
        <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.danger }}>
          Expense ({formatUsdInt(totalExpense)})
        </Text>
      </View>

      <Svg width={DIAGRAM_WIDTH} height={DIAGRAM_HEIGHT}>
        <Defs>
          {/* Gradient definitions for each income flow */}
          {incomePositions.map((flow, idx) => (
            <LinearGradient key={`income-grad-${idx}`} id={`income-grad-${idx}`} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={flow.meta.color} stopOpacity="0.7" />
              <Stop offset="1" stopColor={colors.success} stopOpacity="0.5" />
            </LinearGradient>
          ))}

          {/* Gradient definitions for each expense flow */}
          {expensePositions.map((flow, idx) => (
            <LinearGradient key={`expense-grad-${idx}`} id={`expense-grad-${idx}`} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={colors.danger} stopOpacity="0.5" />
              <Stop offset="1" stopColor={flow.meta.color} stopOpacity="0.7" />
            </LinearGradient>
          ))}
        </Defs>

        {/* Income flows (left side) */}
        {incomePositions.map((flow, idx) => {
          const leftX = 10
          const centerLeftX = CENTER_X - NODE_WIDTH / 2
          const centerFlowY = centerY + (idx * centerHeight) / Math.max(incomePositions.length, 1)

          const path = generateFlowPath(
            leftX + NODE_WIDTH,
            flow.y,
            centerLeftX,
            centerFlowY,
            flow.height,
            flow.height
          )

          return (
            <React.Fragment key={`income-${idx}`}>
              <Path d={path} fill={`url(#income-grad-${idx})`} />
              {/* Left node */}
              <Path
                d={`M ${leftX} ${flow.y} L ${leftX + NODE_WIDTH} ${flow.y} L ${leftX + NODE_WIDTH} ${flow.y + flow.height} L ${leftX} ${flow.y + flow.height} Z`}
                fill={flow.meta.color}
              />
            </React.Fragment>
          )
        })}

        {/* Expense flows (right side) */}
        {expensePositions.map((flow, idx) => {
          const rightX = DIAGRAM_WIDTH - 10 - NODE_WIDTH
          const centerRightX = CENTER_X + NODE_WIDTH / 2
          const centerFlowY = centerY + (idx * centerHeight) / Math.max(expensePositions.length, 1)

          const path = generateFlowPath(
            centerRightX,
            centerFlowY,
            rightX,
            flow.y,
            flow.height,
            flow.height
          )

          return (
            <React.Fragment key={`expense-${idx}`}>
              <Path d={path} fill={`url(#expense-grad-${idx})`} />
              {/* Right node */}
              <Path
                d={`M ${rightX} ${flow.y} L ${rightX + NODE_WIDTH} ${flow.y} L ${rightX + NODE_WIDTH} ${flow.y + flow.height} L ${rightX} ${flow.y + flow.height} Z`}
                fill={flow.meta.color}
              />
            </React.Fragment>
          )
        })}

        {/* Center node (YOU) */}
        <Path
          d={`M ${CENTER_X - NODE_WIDTH / 2} ${centerY} L ${CENTER_X + NODE_WIDTH / 2} ${centerY} L ${CENTER_X + NODE_WIDTH / 2} ${centerY + centerHeight} L ${CENTER_X - NODE_WIDTH / 2} ${centerY + centerHeight} Z`}
          fill={colors.primary}
        />

        {/* Net amount label */}
        <SvgText
          x={CENTER_X}
          y={centerY + centerHeight + 16}
          textAnchor="middle"
          fontSize={12}
          fontWeight="bold"
          fill={netAmount >= 0 ? colors.success : colors.danger}
        >
          {netAmount >= 0 ? '+' : '-'}{formatUsdInt(Math.abs(netAmount))}
        </SvgText>
      </Svg>

      {/* Legend */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }}>
        {incomePositions.slice(0, 3).map((flow, idx) => (
          <View key={`legend-income-${idx}`} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <View style={{ width: 8, height: 8, borderRadius: radius.sm, backgroundColor: flow.meta.color }} />
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{flow.meta.name}</Text>
          </View>
        ))}
        {expensePositions.slice(0, 3).map((flow, idx) => (
          <View key={`legend-expense-${idx}`} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <View style={{ width: 8, height: 8, borderRadius: radius.sm, backgroundColor: flow.meta.color }} />
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{flow.meta.name}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
