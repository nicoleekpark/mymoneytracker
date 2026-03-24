import React from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import { useHoHTheme } from '@/providers'
import { CategoryIcon } from '@/shared/components'
import { fontSize, fontWeight } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'
import { spacing } from '@/theme/tokens/spacing'

import type { Period } from '../types'
import { formatPeriodLabelFull } from '../types'

type Props = {
  // Members
  members: { id: string; nickname: string }[]
  selectedMemberIds: string[]
  onSelectMembers: (ids: string[]) => void
  // Period
  period: Period
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  onOpenPicker: () => void
}

export function InsightsHeader({
  members,
  selectedMemberIds,
  onSelectMembers,
  period,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onOpenPicker
}: Props) {
  const theme = useHoHTheme()
  const colors = theme.semantic

  const allMembersSelected = selectedMemberIds.length === 0
  const periodLabel = formatPeriodLabelFull('month', period)

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

  return (
    <View style={{ paddingBottom: spacing.sm }}>
      {/* Row 1: Members (left) + Period nav (right) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }}>
        {/* Members */}
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
            <Text
              style={{
                fontSize: fontSize.sm,
                fontWeight: fontWeight.semibold,
                color: allMembersSelected ? colors.surface : colors.textSecondary,
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

        {/* Period navigation */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.sm, width: '35%', minWidth: 120, maxWidth: 160 }}>
          <Pressable
            onPress={onPrev}
            disabled={!canPrev}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ opacity: canPrev ? 1 : 0.2, padding: spacing.xs }}
          >
            <CategoryIcon name="chevron-left" size={18} color={colors.textSecondary} />
          </Pressable>
          <Pressable onPress={onOpenPicker}>
            <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, minWidth: 100, textAlign: 'center' }}>
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
      </View>
    </View>
  )
}
