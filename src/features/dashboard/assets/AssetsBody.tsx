import React, { useState } from 'react'
import {
  LayoutAnimation,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
} from 'react-native'
import { CategoryIcon, InfoSheet } from '@/shared/components'
import { formatUsdInt } from '@/shared/format/currency'
import { formatYearMonth } from '@/shared/format/date'
import { fontSize, displaySize, fontWeight } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'
import { spacing } from '@/theme/tokens/spacing'
import { useAssetsData } from './hooks/useAssetsData'

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export type AssetsColors = Readonly<{
  text: string
  textSecondary: string
  border: string
  surface: string
  surfaceAlt: string
  primary: string
  success: string
  danger: string
  warning: string
}>

type Props = {
  colors: AssetsColors
  initialYear?: number
}

/**
 * Liquidity info bottom sheet
 */
function LiquidityInfoSheet({
  visible,
  onClose,
  colors,
}: {
  visible: boolean
  onClose: () => void
  colors: AssetsColors
}) {
  return (
    <InfoSheet
      visible={visible}
      onClose={onClose}
      title="Accessible Assets"
      colors={{
        surface: colors.surface,
        text: colors.text,
        textSecondary: colors.textSecondary,
        surfaceAlt: colors.surfaceAlt
      }}
      snapPoints={['50%']}
    >
      <Text style={{ fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.xl }}>
        Money you can access quickly without penalties or significant loss.
      </Text>

      <View style={{ marginBottom: spacing.xl }}>
        <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm }}>
          Included:
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
          {'\u2022'} Cash & Checking{'\n'}
          {'\u2022'} Savings & HYSA{'\n'}
          {'\u2022'} Brokerage accounts{'\n'}
          {'\u2022'} Crypto
        </Text>
      </View>

      <View>
        <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm }}>
          Not included:
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
          {'\u2022'} Retirement accounts{'\n'}
          {'\u2022'} Real estate{'\n'}
          {'\u2022'} CDs & locked deposits
        </Text>
      </View>
    </InfoSheet>
  )
}

/**
 * Tied up assets info bottom sheet
 */
function TiedUpInfoSheet({
  visible,
  onClose,
  colors,
}: {
  visible: boolean
  onClose: () => void
  colors: AssetsColors
}) {
  return (
    <InfoSheet
      visible={visible}
      onClose={onClose}
      title="Tied Up Assets"
      colors={{
        surface: colors.surface,
        text: colors.text,
        textSecondary: colors.textSecondary,
        surfaceAlt: colors.surfaceAlt
      }}
      snapPoints={['70%']}
    >
      <Text style={{ fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.xl }}>
        Assets that cannot be quickly converted to cash without significant loss, penalties, or time.
      </Text>

      <View style={{ marginBottom: spacing.xl }}>
        <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm }}>
          Examples:
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
          {'\u2022'} Retirement accounts (401k, IRA, 403b){'\n'}
          {'\u2022'} Real estate equity{'\n'}
          {'\u2022'} Vehicles{'\n'}
          {'\u2022'} Private investments{'\n'}
          {'\u2022'} CDs & time deposits
        </Text>
      </View>

      <View style={{ marginBottom: spacing.xl }}>
        <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm }}>
          Early withdrawal penalties:
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
          {'\u2022'} 401(k) / IRA: 10% penalty + income tax if withdrawn before age 59½{'\n'}
          {'\u2022'} SIMPLE IRA: 25% penalty if within first 2 years{'\n'}
          {'\u2022'} Real estate: Selling costs typically 6-10% of value
        </Text>
      </View>

      <View style={{ marginBottom: spacing.xl }}>
        <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm }}>
          Why it matters:
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
          This is your long-term wealth. It grows over time but isn't available for emergencies without cost.
        </Text>
      </View>

      <View>
        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.xs }}>
          Sources:
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <Pressable onPress={() => Linking.openURL('https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-exceptions-to-tax-on-early-distributions')}>
            <Text style={{ fontSize: fontSize.xs, color: colors.primary, textDecorationLine: 'underline' }}>
              IRS
            </Text>
          </Pressable>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{'\u2022'}</Text>
          <Pressable onPress={() => Linking.openURL('https://www.investopedia.com/terms/i/illiquid.asp')}>
            <Text style={{ fontSize: fontSize.xs, color: colors.primary, textDecorationLine: 'underline' }}>
              Investopedia
            </Text>
          </Pressable>
        </View>
      </View>
    </InfoSheet>
  )
}

/**
 * Wealth goal info bottom sheet
 */
function WealthGoalInfoSheet({
  visible,
  onClose,
  colors,
  startNetWorth,
  startYearMonth,
  targetNetWorth,
}: {
  visible: boolean
  onClose: () => void
  colors: AssetsColors
  startNetWorth: number
  startYearMonth: string
  targetNetWorth: number
}) {
  return (
    <InfoSheet
      visible={visible}
      onClose={onClose}
      title="Wealth goal"
      colors={{
        surface: colors.surface,
        text: colors.text,
        textSecondary: colors.textSecondary,
        surfaceAlt: colors.surfaceAlt
      }}
      snapPoints={['50%']}
    >
      <Text style={{ fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.xl }}>
        A wealth goal is a target net worth you want to reach by a specific date, usually year-end.
      </Text>

      <View style={{ marginBottom: spacing.xl }}>
        <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm }}>
          Starting point
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
          Your net worth on {formatYearMonth(startYearMonth)}: {formatUsdInt(startNetWorth)}
        </Text>
      </View>

      <View>
        <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm }}>
          Target
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
          Where you want to be by year-end: {formatUsdInt(targetNetWorth)}
        </Text>
      </View>
    </InfoSheet>
  )
}

/**
 * Header row with member tabs (multi-select) and year navigation
 */
function HeaderControls({
  members,
  selectedMemberIds,
  onSelectMembers,
  year,
  canPrev,
  canNext,
  onPrevYear,
  onNextYear,
  colors,
}: {
  members: { id: string; nickname: string }[]
  selectedMemberIds: string[]
  onSelectMembers: (ids: string[]) => void
  year: number
  canPrev: boolean
  canNext: boolean
  onPrevYear: () => void
  onNextYear: () => void
  colors: AssetsColors
}) {
  const allSelected = selectedMemberIds.length === 0

  function handleAllClick() {
    // "All" click always results in empty array (All selected)
    onSelectMembers([])
  }

  function handleMemberClick(memberId: string) {
    if (selectedMemberIds.includes(memberId)) {
      // Deselect this member
      const next = selectedMemberIds.filter(id => id !== memberId)
      onSelectMembers(next)
    } else {
      // Add this member to selection
      onSelectMembers([...selectedMemberIds, memberId])
    }
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      {/* Member tabs (multi-select) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm }}
        style={{ flex: 1 }}
      >
        <Pressable
          onPress={handleAllClick}
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: radius.full,
            backgroundColor: allSelected ? colors.text : 'transparent',
          }}
        >
          <Text
            style={{
              fontSize: fontSize.sm,
              fontWeight: fontWeight.semibold,
              color: allSelected ? colors.surface : colors.textSecondary,
            }}
          >
            Everyone
          </Text>
        </Pressable>
        {members.map((member) => {
          const isSelected = selectedMemberIds.includes(member.id)
          return (
            <Pressable
              key={member.id}
              onPress={() => handleMemberClick(member.id)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radius.full,
                backgroundColor: isSelected ? colors.text : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.semibold,
                  color: isSelected ? colors.surface : colors.textSecondary,
                }}
              >
                {member.nickname}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {/* Year navigation */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.sm, width: '35%', minWidth: 120, maxWidth: 160 }}>
        <Pressable
          onPress={onPrevYear}
          disabled={!canPrev}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ opacity: canPrev ? 1 : 0.2, padding: spacing.xs }}
        >
          <CategoryIcon name="chevron-left" size={18} color={colors.textSecondary} />
        </Pressable>
        <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, minWidth: 44, textAlign: 'center' }}>
          {year}
        </Text>
        <Pressable
          onPress={onNextYear}
          disabled={!canNext}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ opacity: canNext ? 1 : 0.2, padding: spacing.xs }}
        >
          <CategoryIcon name="chevron-right" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  )
}

/**
 * Small info indicator for tappable items
 */
function InfoIndicator({ color }: { color: string }) {
  return (
    <View
      style={{
        width: 14,
        height: 14,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.6,
      }}
    >
      <Text style={{ fontSize: 9, fontWeight: fontWeight.bold, color }}>i</Text>
    </View>
  )
}

export function AssetsBody({ colors, initialYear }: Props) {
  const currentYear = new Date().getFullYear()
  const { data, selectMembers, selectYear } = useAssetsData(initialYear ?? currentYear)
  const [showLiquidityInfo, setShowLiquidityInfo] = useState(false)
  const [showTiedUpInfo, setShowTiedUpInfo] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [balanceSheetFilter, setBalanceSheetFilter] = useState<'all' | 'liquid'>('all')
  const [longTermCollapsed, setLongTermCollapsed] = useState(true) // Default collapsed in Accessible mode

  function toggleCategory(categoryKey: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryKey)) {
        next.delete(categoryKey)
      } else {
        next.add(categoryKey)
      }
      return next
    })
  }

  // Year navigation
  const availableYears = data.availableYears
  const currentYearIndex = availableYears.indexOf(data.year)
  const canGoPrev = currentYearIndex < availableYears.length - 1
  const canGoNext = currentYearIndex > 0

  function handlePrevYear() {
    if (canGoPrev && currentYearIndex + 1 < availableYears.length) {
      selectYear(availableYears[currentYearIndex + 1])
    }
  }

  function handleNextYear() {
    if (canGoNext && currentYearIndex > 0) {
      selectYear(availableYears[currentYearIndex - 1])
    }
  }

  // Calculate breakdown data - organized by field with items
  const breakdownByField = data.fieldGroups.map(group => ({
    field: group.field,
    fieldName: group.fieldName,
    total: group.total,
    isLiability: group.field === 'liabilities',
    categories: group.categories
      .map(cat => ({
        key: cat.category,
        label: cat.categoryName,
        value: Math.abs(cat.total),
        items: cat.items
          .filter(item => item.balance !== 0)
          .map(item => ({
            id: item.id,
            name: item.name,
            value: Math.abs(item.balance),
          }))
          .sort((a, b) => b.value - a.value),
      }))
      .sort((a, b) => b.value - a.value),
  }))

  // Empty state
  if (data.fieldGroups.length === 0 && data.summary.netWorth === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing['2xl'] }}>
        <CategoryIcon name="chart-pie" size={48} color={colors.textSecondary} />
        <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.lg, textAlign: 'center' }}>
          No assets tracked yet
        </Text>
        <Text style={{ fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }}>
          Add your first asset to start tracking your net worth.
        </Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Bottom Sheets */}
      <LiquidityInfoSheet visible={showLiquidityInfo} onClose={() => setShowLiquidityInfo(false)} colors={colors} />
      <TiedUpInfoSheet visible={showTiedUpInfo} onClose={() => setShowTiedUpInfo(false)} colors={colors} />
      <WealthGoalInfoSheet
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        colors={colors}
        startNetWorth={data.goalProgress.startNetWorth}
        startYearMonth={data.goalProgress.startYearMonth}
        targetNetWorth={data.goalProgress.startNetWorth + data.goalProgress.targetGrowth}
      />

      {/* Sticky Header Controls */}
      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.sm }}>
        {data.members.length > 0 ? (
          <HeaderControls
            members={data.members.map(m => ({ id: m.id, nickname: m.nickname }))}
            selectedMemberIds={data.selectedMemberIds}
            onSelectMembers={selectMembers}
            year={data.year}
            canPrev={canGoPrev}
            canNext={canGoNext}
            onPrevYear={handlePrevYear}
            onNextYear={handleNextYear}
            colors={colors}
          />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingVertical: spacing.sm }}>
            <Pressable
              onPress={handlePrevYear}
              disabled={!canGoPrev}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ opacity: canGoPrev ? 1 : 0.2, padding: spacing.xs }}
            >
              <CategoryIcon name="chevron-left" size={20} color={colors.textSecondary} />
            </Pressable>
            <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text }}>{data.year}</Text>
            <Pressable
              onPress={handleNextYear}
              disabled={!canGoNext}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ opacity: canGoNext ? 1 : 0.2, padding: spacing.xs }}
            >
              <CategoryIcon name="chevron-right" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing['3xl'] }}
        showsVerticalScrollIndicator={false}
      >

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* Hero: Current Net Worth */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {(() => {
        // Calculate tied up = total assets - liquid assets
        const accessible = data.summary.liquidifiableAmount
        const tiedUp = data.summary.totalAssets - accessible
        const totalAssets = data.summary.totalAssets
        const accessiblePercent = totalAssets > 0 ? Math.round((accessible / totalAssets) * 100) : 0
        const tiedUpPercent = totalAssets > 0 ? Math.round((tiedUp / totalAssets) * 100) : 0

        return (
          <View style={{ paddingVertical: spacing.xl, marginBottom: spacing.sm }}>
            {/* Net Worth - centered */}
            <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: 0.5, marginBottom: spacing.sm }}>
                Current Net Worth
              </Text>
              <Text style={{ fontSize: displaySize.xl, fontWeight: fontWeight.heavy, color: colors.text, letterSpacing: -1 }}>
                {formatUsdInt(data.summary.netWorth)}
              </Text>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm }}>
                Change since {data.isCurrentYear ? 'Jan 1' : `start of ${data.year}`}{' '}
                <Text style={{ fontWeight: fontWeight.semibold, color: data.yearlySnapshot.growth >= 0 ? colors.success : colors.danger }}>
                  {data.yearlySnapshot.growth >= 0 ? '+' : ''}{formatUsdInt(data.yearlySnapshot.growth)}
                </Text>
              </Text>
            </View>

            {/* Accessible vs Tied up - two columns with subtle middle divider */}
            <View style={{ flexDirection: 'row' }}>
              {/* Accessible */}
              <Pressable
                onPress={() => setShowLiquidityInfo(true)}
                style={{
                  flex: 1,
                  padding: spacing.lg,
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
                  <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: 0.5 }}>
                    Accessible
                  </Text>
                  <InfoIndicator color={colors.textSecondary} />
                </View>
                <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text }}>
                  {formatUsdInt(accessible)}
                </Text>
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs }}>
                  {accessiblePercent}%
                </Text>
              </Pressable>

              {/* Subtle middle divider */}
              <View style={{ width: 1, backgroundColor: colors.border, marginVertical: spacing.sm, opacity: 0.5 }} />

              {/* Tied up */}
              <Pressable
                onPress={() => setShowTiedUpInfo(true)}
                style={{
                  flex: 1,
                  padding: spacing.lg,
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
                  <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: 0.5 }}>
                    Tied up
                  </Text>
                  <InfoIndicator color={colors.textSecondary} />
                </View>
                <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text }}>
                  {formatUsdInt(tiedUp)}
                </Text>
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs }}>
                  {tiedUpPercent}%
                </Text>
              </Pressable>
            </View>
          </View>
        )
      })()}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* Goal Section (after Liquidity - Safety before Ambition) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {data.goalProgress.hasGoal && (() => {
        const targetNetWorth = data.goalProgress.startNetWorth + data.goalProgress.targetGrowth
        const currentNetWorth = data.summary.netWorth
        const remaining = targetNetWorth - currentNetWorth
        const isAchieved = currentNetWorth >= targetNetWorth
        const progressPercent = targetNetWorth > 0 ? Math.min(Math.round((currentNetWorth / targetNetWorth) * 100), 100) : 0

        return (
          <View style={{ marginBottom: spacing['2xl'] }}>
            {/* Divider above */}
            <View style={{ height: 1, backgroundColor: colors.border, marginBottom: spacing.lg, opacity: 0.5 }} />

            {/* Header row: Title + info button + menu button */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
              <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, flex: 1 }}>
                Wealth goal
              </Text>
              <Pressable
                onPress={() => setShowGoalModal(true)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{ marginRight: spacing.md }}
              >
                <InfoIndicator color={colors.textSecondary} />
              </Pressable>
              {/* ⋮ menu button - placeholder for future */}
              <Pressable
                onPress={() => {/* TODO: Open goal settings sheet */}}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={{ fontSize: fontSize.lg, color: colors.textSecondary, fontWeight: fontWeight.semibold }}>⋮</Text>
              </Pressable>
            </View>

            {/* Progress text */}
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md }}>
              {formatUsdInt(currentNetWorth)} of {formatUsdInt(targetNetWorth)}
            </Text>

            {/* Progress bar */}
            <View
              style={{
                height: spacing.sm,
                backgroundColor: colors.surfaceAlt,
                borderRadius: radius.sm,
                overflow: 'hidden',
                marginBottom: spacing.md,
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  backgroundColor: colors.primary,
                  borderRadius: radius.sm,
                }}
              />
            </View>

            {/* Bottom row: remaining + percentage */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: fontSize.sm, color: colors.text }}>
                {isAchieved ? (
                  <>Goal reached! +{formatUsdInt(Math.abs(remaining))} above</>
                ) : (
                  <><Text style={{ fontWeight: fontWeight.semibold }}>{formatUsdInt(remaining)}</Text> to go</>
                )}
              </Text>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
                {progressPercent}% complete
              </Text>
            </View>
          </View>
        )
      })()}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* Balance Sheet */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <View>
        {/* Divider above */}
        <View style={{ height: 1, backgroundColor: colors.border, marginBottom: spacing.lg, opacity: 0.5 }} />

        {/* Header: title + toggle (same style as Wealth goal) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
          <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, flex: 1 }}>
            Balance sheet
          </Text>
          {/* All | Actionable toggle */}
          <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.full, padding: 2 }}>
            <Pressable
              onPress={() => setBalanceSheetFilter('all')}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radius.full,
                backgroundColor: balanceSheetFilter === 'all' ? colors.text : 'transparent',
              }}
            >
              <Text style={{
                fontSize: fontSize.xs,
                fontWeight: fontWeight.semibold,
                color: balanceSheetFilter === 'all' ? colors.surface : colors.textSecondary,
              }}>
                All
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setBalanceSheetFilter('liquid')}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radius.full,
                backgroundColor: balanceSheetFilter === 'liquid' ? colors.text : 'transparent',
              }}
            >
              <Text style={{
                fontSize: fontSize.xs,
                fontWeight: fontWeight.semibold,
                color: balanceSheetFilter === 'liquid' ? colors.surface : colors.textSecondary,
              }}>
                Actionable
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Mode description */}
        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.md, opacity: 0.8 }}>
          {balanceSheetFilter === 'all'
            ? 'Full picture: all assets and liabilities'
            : 'What you can actually use right now'}
        </Text>

        {/* Single column flat list */}
        {(() => {
          // Get all categories
          // Category keys from asset.model.ts:
          // Liquid: cash_savings, investments
          // Long-term: real_estate, retirement_funds, kids
          const liquidCategories = breakdownByField
            .filter(g => g.field !== 'liabilities')
            .flatMap(g => g.categories)
            .filter(c => ['cash_savings', 'investments'].includes(c.key))
            .filter(c => c.value > 0)

          const longTermCategories = breakdownByField
            .filter(g => g.field !== 'liabilities')
            .flatMap(g => g.categories)
            .filter(c => ['retirement_funds', 'real_estate', 'kids'].includes(c.key))
            .filter(c => c.value > 0)

          const liabilityGroup = breakdownByField.find(g => g.field === 'liabilities')
          const liabilityCategories = (liabilityGroup?.categories ?? []).filter(c => c.value > 0)

          // Split liabilities: short-term (due now) vs long-term
          // Category keys: credit_card, loans, other (from asset.model.ts)
          const shortTermLiabilities = liabilityCategories.filter(c => ['credit_card'].includes(c.key))
          const longTermLiabilities = liabilityCategories.filter(c => ['loans', 'other'].includes(c.key))
          const shortTermLiabilitiesTotal = shortTermLiabilities.reduce((sum, cat) => sum + cat.value, 0)

          // Helper to render a category row - ALL AMOUNTS NEUTRAL (white)
          const renderCategoryRow = (cat: typeof liquidCategories[0], isMuted = false) => {
            const isExpanded = expandedCategories.has(cat.key)
            const hasItems = cat.items.length > 0

            return (
              <View key={cat.key}>
                <Pressable
                  onPress={() => hasItems && toggleCategory(cat.key)}
                  disabled={!hasItems}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm }}
                >
                  <Text style={{ fontSize: 10, color: colors.textSecondary, width: 16, opacity: isMuted ? 0.4 : 1 }}>
                    {hasItems ? (isExpanded ? '▼' : '▶') : ''}
                  </Text>
                  <Text style={{
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.semibold,
                    color: isMuted ? colors.textSecondary : colors.text,
                    flex: 1,
                    opacity: isMuted ? 0.6 : 1
                  }} numberOfLines={1}>
                    {cat.label}
                  </Text>
                  <Text style={{
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.semibold,
                    color: isMuted ? colors.textSecondary : colors.text, // NEUTRAL
                    width: 100,
                    textAlign: 'right',
                    fontVariant: ['tabular-nums'],
                    opacity: isMuted ? 0.6 : 1
                  }}>
                    {formatUsdInt(cat.value)}
                  </Text>
                </Pressable>
                {isExpanded && hasItems && (
                  <View style={{ flexDirection: 'row', marginLeft: spacing.lg, marginBottom: spacing.xs }}>
                    <View style={{ width: 1, backgroundColor: colors.border, marginRight: spacing.md, opacity: isMuted ? 0.3 : 0.5 }} />
                    <View style={{ flex: 1 }}>
                      {cat.items.map(item => (
                        <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 3 }}>
                          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, flex: 1, opacity: isMuted ? 0.5 : 1 }} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={{
                            fontSize: fontSize.xs,
                            color: colors.textSecondary, // NEUTRAL
                            width: 90,
                            textAlign: 'right',
                            fontVariant: ['tabular-nums'],
                            opacity: isMuted ? 0.4 : 0.7
                          }}>
                            {formatUsdInt(item.value)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )
          }

          // Calculate totals
          const displayedAssets = balanceSheetFilter === 'liquid' ? data.summary.liquidifiableAmount : data.summary.totalAssets
          // In Actionable mode, only subtract short-term liabilities (credit cards)
          // Long-term debt (loans, mortgage) isn't "due now" so doesn't reduce actionable capital
          const displayedLiabilities = balanceSheetFilter === 'liquid' ? shortTermLiabilitiesTotal : data.summary.totalLiabilities
          const displayedNet = displayedAssets - displayedLiabilities

          // Section header component
          const SectionHeader = ({ title, total, isMuted = false }: { title: string; total: number; isMuted?: boolean }) => (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing.md,
              paddingBottom: spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              opacity: isMuted ? 0.6 : 1
            }}>
              <Text style={{
                fontSize: fontSize.sm,
                fontWeight: fontWeight.semibold,
                color: isMuted ? colors.textSecondary : colors.text,
                flex: 1
              }}>
                {title}
              </Text>
              <Text style={{
                fontSize: fontSize.sm,
                fontWeight: fontWeight.semibold,
                color: isMuted ? colors.textSecondary : colors.text,
                fontVariant: ['tabular-nums']
              }}>
                {formatUsdInt(total)}
              </Text>
            </View>
          )

          return (
            <>
              {/* ══════════════════════════════════════════════════════════════ */}
              {/* ALL MODE */}
              {/* ══════════════════════════════════════════════════════════════ */}
              {balanceSheetFilter === 'all' && (
                <>
                  {/* Assets section */}
                  <SectionHeader title="Assets" total={data.summary.totalAssets} />
                  {liquidCategories.map(cat => renderCategoryRow(cat))}
                  {longTermCategories.map(cat => renderCategoryRow(cat))}

                  {/* Liabilities section */}
                  {liabilityCategories.length > 0 && (
                    <View style={{ marginTop: spacing.xl }}>
                      <SectionHeader title="Liabilities" total={data.summary.totalLiabilities} />
                      {liabilityCategories.map(cat => renderCategoryRow(cat))}
                    </View>
                  )}

                  {/* Equation */}
                  <View style={{ marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
                        Assets − Liabilities
                      </Text>
                      <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, fontVariant: ['tabular-nums'] }}>
                        {formatUsdInt(displayedNet)}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {/* ══════════════════════════════════════════════════════════════ */}
              {/* ACTIONABLE MODE - Same pattern as All mode (equation at bottom) */}
              {/* ══════════════════════════════════════════════════════════════ */}
              {balanceSheetFilter === 'liquid' && (
                <>
                  {/* Accessible assets */}
                  <SectionHeader title="Accessible assets" total={data.summary.liquidifiableAmount} />
                  {liquidCategories.map(cat => renderCategoryRow(cat))}

                  {/* Short-term liabilities (due now) - only these are subtracted */}
                  {shortTermLiabilities.length > 0 && (
                    <View style={{ marginTop: spacing.xl }}>
                      <SectionHeader title="Liabilities due now" total={shortTermLiabilitiesTotal} />
                      {shortTermLiabilities.map(cat => renderCategoryRow(cat))}
                    </View>
                  )}

                  {/* Equation - right after its components */}
                  <View style={{ marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
                        Accessible − Liabilities due now
                      </Text>
                      <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, fontVariant: ['tabular-nums'] }}>
                        {formatUsdInt(displayedNet)}
                      </Text>
                    </View>
                  </View>

                  {/* Long-term section (supplementary, not part of calculation) */}
                  {(longTermCategories.length > 0 || longTermLiabilities.length > 0) && (
                    <View style={{ marginTop: spacing.xl, opacity: 0.6 }}>
                      {/* Thinner divider */}
                      <View style={{ height: 1, backgroundColor: colors.border, marginBottom: spacing.md, opacity: 0.4 }} />

                      {/* Collapsible header */}
                      <Pressable
                        onPress={() => setLongTermCollapsed(!longTermCollapsed)}
                        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs }}
                      >
                        <Text style={{ fontSize: 10, color: colors.textSecondary, width: 16 }}>
                          {longTermCollapsed ? '▶' : '▼'}
                        </Text>
                        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 }}>
                          Long-term
                        </Text>
                        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
                          Included in Net Worth
                        </Text>
                      </Pressable>

                      {/* Expanded content */}
                      {!longTermCollapsed && (
                        <View style={{ marginTop: spacing.sm }}>
                          {/* Long-term assets */}
                          {longTermCategories.length > 0 && (
                            <View style={{ marginBottom: spacing.md }}>
                              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm, opacity: 0.7 }}>
                                Assets
                              </Text>
                              {longTermCategories.map(cat => renderCategoryRow(cat, true))}
                            </View>
                          )}
                          {/* Long-term liabilities */}
                          {longTermLiabilities.length > 0 && (
                            <View>
                              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm, opacity: 0.7 }}>
                                Liabilities
                              </Text>
                              {longTermLiabilities.map(cat => renderCategoryRow(cat, true))}
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  )}
                </>
              )}
            </>
          )
        })()}
      </View>
    </ScrollView>
    </View>
  )
}
