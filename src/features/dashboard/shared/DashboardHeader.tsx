// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED DASHBOARD HEADER
// Configurable header used by all dashboard modes (overview, insights, accounts, assets)
// ═══════════════════════════════════════════════════════════════════════════
import React from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import { useHoHTheme } from '@/shared/providers'
import { CategoryIcon } from '@/shared/components'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'

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

// ─── Constants ───────────────────────────────────────────────────────────────

const SCOPES: ReadonlyArray<{ key: Scope; label: string }> = [
  { key: 'month', label: 'Monthly' },
  { key: 'year', label: 'Yearly' },
  { key: 'all', label: 'All' }
]

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
    <View style={{ paddingBottom: spacing.sm }}>
      {/* Row 1: Members (left) + Period nav (right) */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm
      }}>
        {/* Members selector - only show if multiple members exist */}
        {hasMultipleMembers && (
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
                backgroundColor: allMembersSelected ? colors.text : 'transparent',
              }}
            >
              <Text style={{
                fontSize: fontSize.sm,
                fontWeight: fontWeight.semibold,
                color: allMembersSelected ? colors.surface : colors.textSecondary,
              }}>
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
                <Text style={{
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.semibold,
                  color: isSelected ? colors.surface : colors.textSecondary,
                }}>
                  {member.nickname}
                </Text>
              </Pressable>
            )
          })}
          </ScrollView>
        )}

        {/* Spacer when no members selector */}
        {!hasMultipleMembers && <View style={{ flex: 1 }} />}

        {/* Period navigation */}
        {showNav ? (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: spacing.sm,
            width: '35%',
            minWidth: 120,
            maxWidth: 160
          }}>
            <Pressable
              onPress={onPrev}
              disabled={!canPrev}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ opacity: canPrev ? 1 : 0.2, padding: spacing.xs }}
            >
              <CategoryIcon name="chevron-left" size={18} color={colors.textSecondary} />
            </Pressable>
            <Pressable onPress={onOpenPicker} disabled={!onOpenPicker}>
              <Text style={{
                fontSize: fontSize.md,
                fontWeight: fontWeight.semibold,
                color: colors.text,
                minWidth: 100,
                textAlign: 'center'
              }}>
                {periodLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={onNext}
              disabled={!canNext}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ opacity: canNext ? 1 : 0.2, padding: spacing.xs }}
            >
              <CategoryIcon name="chevron-right" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        ) : (
          <View style={{ alignItems: 'flex-end', width: '35%', minWidth: 120, maxWidth: 160 }}>
            <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text }}>
              {periodLabel}
            </Text>
          </View>
        )}
      </View>

      {/* Row 2: Scope tabs (optional) */}
      {showScopeTabs && scopeTabsProps && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingHorizontal: spacing.lg,
          gap: spacing.xl
        }}>
          {/* Today button - only show when not at current period */}
          {!isCurrent && showNav && scopeTabsProps.onToday && (
            <Pressable
              onPress={scopeTabsProps.onToday}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ paddingVertical: spacing.sm }}
            >
              <Text style={{
                fontSize: fontSize.sm,
                fontWeight: fontWeight.normal,
                color: colors.textSecondary
              }}>
                Today
              </Text>
            </Pressable>
          )}
          {SCOPES.map((s) => {
            const isActive = s.key === scopeTabsProps.scope
            return (
              <Pressable
                key={s.key}
                onPress={() => scopeTabsProps.onScopeChange(s.key)}
                style={{ paddingVertical: spacing.sm }}
              >
                <Text style={{
                  fontSize: fontSize.sm,
                  fontWeight: isActive ? fontWeight.semibold : fontWeight.normal,
                  color: isActive ? colors.text : colors.textSecondary,
                }}>
                  {s.label}
                </Text>
                {/* Underline indicator */}
                <View style={{
                  height: 2,
                  backgroundColor: isActive ? colors.text : 'transparent',
                  marginTop: spacing.xs,
                  borderRadius: 1,
                }}/>
              </Pressable>
            )
          })}
        </View>
      )}
    </View>
  )
}
