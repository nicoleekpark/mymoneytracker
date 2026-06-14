/**
 * Unified Dashboard Header
 *
 * Configurable header used by all dashboard modes (overview, insights, accounts, assets).
 * Uses design tokens from dashboard.ts for consistent styling.
 */
import React from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import { useHoHTheme } from '@/shared/providers'
import { CategoryIcon } from '@/shared/components'
import {
  dashboardStyles,
  SCOPE_OPTIONS,
  getMemberChipStyle,
  getMemberChipTextColor,
  getScopeTabTextStyle,
  getScopeTabUnderlineColor,
} from '@/shared/theme/tokens/dashboard'
import { fontWeight } from '@/shared/theme/tokens/typography'

import type { Period, Scope } from '../types'
import { formatPeriodLabelFull, isCurrentPeriod } from '../utils'

// ─── Types ───────────────────────────────────────────────────────────────────

type MemberProps = {
  members: { id: string; nickname: string }[]
  selectedMemberIds: string[]
  onSelectMembers: (ids: string[]) => void
}

type PeriodNavProps = {
  period: Period
  scope: Scope
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  onOpenPicker?: () => void
}

type ScopeTabsProps = {
  scope: Scope
  onScopeChange: (scope: Scope) => void
  onToday?: () => void
}

type Props = MemberProps & PeriodNavProps & {
  /** Show scope tabs (Monthly/Yearly/All) - default false */
  showScopeTabs?: boolean
  /** Scope tab callbacks - required if showScopeTabs is true */
  scopeTabsProps?: ScopeTabsProps
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DashboardHeader({
  // Members
  members,
  selectedMemberIds,
  onSelectMembers,
  // Period
  period,
  scope,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onOpenPicker,
  // Scope tabs (optional)
  showScopeTabs = false,
  scopeTabsProps,
}: Props) {
  const theme = useHoHTheme()
  const colors = theme.semantic

  const allMembersSelected = selectedMemberIds.length === 0
  const periodLabel = formatPeriodLabelFull(scope, period)
  const showNav = scope !== 'all'
  const isCurrent = isCurrentPeriod(scope, period)

  // Only show "Everyone" chip if there are 2+ members (family/friend group)
  const hasMultipleMembers = members.length > 1

  // ─── Member Selection Handlers ─────────────────────────────────────────────

  function handleAllClick() {
    onSelectMembers([])
  }

  function handleMemberClick(memberId: string) {
    if (selectedMemberIds.includes(memberId)) {
      const next = selectedMemberIds.filter(id => id !== memberId)
      onSelectMembers(next)
    } else {
      onSelectMembers([...selectedMemberIds, memberId])
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={dashboardStyles.headerContainer}>
      {/* Row 1: Members (left) + Period nav (right) */}
      <View style={dashboardStyles.headerRow}>
        {/* Members selector - only show if multiple members exist */}
        {hasMultipleMembers && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={dashboardStyles.memberChipsContent}
            style={dashboardStyles.memberChipsContainer}
          >
            <Pressable
              onPress={handleAllClick}
              style={[
                dashboardStyles.memberChip,
                getMemberChipStyle(allMembersSelected, colors),
              ]}
            >
              <Text style={[
                dashboardStyles.memberChipText,
                { color: getMemberChipTextColor(allMembersSelected, colors) },
              ]}>
                Everyone
              </Text>
            </Pressable>
            {members.map((member) => {
              const isSelected = selectedMemberIds.includes(member.id)
              return (
                <Pressable
                  key={member.id}
                  onPress={() => handleMemberClick(member.id)}
                  style={[
                    dashboardStyles.memberChip,
                    getMemberChipStyle(isSelected, colors),
                  ]}
                >
                  <Text style={[
                    dashboardStyles.memberChipText,
                    { color: getMemberChipTextColor(isSelected, colors) },
                  ]}>
                    {member.nickname}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>
        )}

        {/* Spacer when no members selector */}
        {!hasMultipleMembers && <View style={{ flex: 1 }} />}

        {/* Period navigation - always render container for consistent height */}
        <View style={dashboardStyles.periodNavContainer}>
          {showNav ? (
            <>
              <Pressable
                onPress={onPrev}
                disabled={!canPrev}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[dashboardStyles.periodNavArrow, { opacity: canPrev ? 1 : 0.2 }]}
              >
                <CategoryIcon name="chevron-left" size={18} color={colors.textSecondary} />
              </Pressable>
              <Pressable onPress={onOpenPicker} disabled={!onOpenPicker}>
                <Text style={[dashboardStyles.periodLabel, { color: colors.text }]}>
                  {periodLabel}
                </Text>
              </Pressable>
              <Pressable
                onPress={onNext}
                disabled={!canNext}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[dashboardStyles.periodNavArrow, { opacity: canNext ? 1 : 0.2 }]}
              >
                <CategoryIcon name="chevron-right" size={18} color={colors.textSecondary} />
              </Pressable>
            </>
          ) : (
            <Text style={[dashboardStyles.periodLabel, { color: colors.text }]}>
              {periodLabel}
            </Text>
          )}
        </View>
      </View>

      {/* Row 2: Scope tabs (optional) - always render for consistent height when enabled */}
      {showScopeTabs && scopeTabsProps && (
        <View style={dashboardStyles.scopeTabsRow}>
          {/* Today button - only show when not at current period and nav is enabled */}
          {!isCurrent && showNav && scopeTabsProps.onToday ? (
            <Pressable
              onPress={scopeTabsProps.onToday}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={dashboardStyles.todayButton}
            >
              <Text style={[dashboardStyles.todayButtonText, { color: colors.textSecondary }]}>
                Today
              </Text>
            </Pressable>
          ) : (
            // Invisible placeholder to maintain consistent spacing
            <View style={dashboardStyles.todayButton}>
              <Text style={[dashboardStyles.todayButtonText, { opacity: 0 }]}>
                Today
              </Text>
            </View>
          )}
          {SCOPE_OPTIONS.map((s) => {
            const isActive = s.key === scopeTabsProps.scope
            const textStyle = getScopeTabTextStyle(isActive, colors)
            return (
              <Pressable
                key={s.key}
                onPress={() => scopeTabsProps.onScopeChange(s.key)}
                style={dashboardStyles.scopeTab}
              >
                <Text style={[
                  dashboardStyles.scopeTabText,
                  { fontWeight: textStyle.fontWeight as any, color: textStyle.color },
                ]}>
                  {s.label}
                </Text>
                <View style={[
                  dashboardStyles.scopeTabUnderline,
                  { backgroundColor: getScopeTabUnderlineColor(isActive, colors) },
                ]}/>
              </Pressable>
            )
          })}
        </View>
      )}
    </View>
  )
}
