import React from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { fontSize, fontWeight } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'
import { spacing } from '@/theme/tokens/spacing'

type MemberTabsColors = {
  primary: string
  onPrimary: string
  surfaceAlt: string
  textSecondary: string
}

// Single-select props (backward compatible)
type SingleSelectProps = {
  members: { id: string; nickname: string }[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  colors: MemberTabsColors
  multiSelect?: false
}

// Multi-select props
type MultiSelectProps = {
  members: { id: string; nickname: string }[]
  selectedIds: string[]  // empty = All
  onSelectMulti: (ids: string[]) => void
  colors: MemberTabsColors
  multiSelect: true
}

type Props = SingleSelectProps | MultiSelectProps

export function MemberTabs(props: Props) {
  const { members, colors } = props

  // Multi-select mode
  if (props.multiSelect === true) {
    const { selectedIds, onSelectMulti } = props
    const allSelected = selectedIds.length === 0

    function handleAllClick() {
      // "All" click always results in empty array (All selected)
      onSelectMulti([])
    }

    function handleMemberClick(memberId: string) {
      if (selectedIds.includes(memberId)) {
        // Deselect this member
        const next = selectedIds.filter(id => id !== memberId)
        onSelectMulti(next)
      } else {
        // Add this member to selection
        onSelectMulti([...selectedIds, memberId])
      }
    }

    return (
      <View style={{ paddingVertical: spacing.sm }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg, alignItems: 'center' }}
        >
          {/* All tab */}
          <Pressable
            onPress={handleAllClick}
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
              borderRadius: radius.full,
              backgroundColor: allSelected ? colors.primary : colors.surfaceAlt,
            }}
          >
            <Text
              style={{
                fontSize: fontSize.sm,
                fontWeight: fontWeight.semibold,
                color: allSelected ? colors.onPrimary : colors.textSecondary,
              }}
            >
              All
            </Text>
          </Pressable>

          {/* Member tabs */}
          {members.map((member) => {
            const isSelected = selectedIds.includes(member.id)
            return (
              <Pressable
                key={member.id}
                onPress={() => handleMemberClick(member.id)}
                style={{
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.full,
                  backgroundColor: isSelected ? colors.primary : colors.surfaceAlt,
                }}
              >
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.semibold,
                    color: isSelected ? colors.onPrimary : colors.textSecondary,
                  }}
                >
                  {member.nickname}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>
    )
  }

  // Single-select mode (default, backward compatible)
  const { selectedId, onSelect } = props
  const allSelected = selectedId === null

  return (
    <View style={{ paddingVertical: spacing.sm }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg, alignItems: 'center' }}
      >
        {/* All tab */}
        <Pressable
          onPress={() => onSelect(null)}
          style={{
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            borderRadius: radius.full,
            backgroundColor: allSelected ? colors.primary : colors.surfaceAlt,
          }}
        >
          <Text
            style={{
              fontSize: fontSize.sm,
              fontWeight: fontWeight.semibold,
              color: allSelected ? colors.onPrimary : colors.textSecondary,
            }}
          >
            All
          </Text>
        </Pressable>

        {/* Member tabs */}
        {members.map((member) => {
          const isSelected = selectedId === member.id
          return (
            <Pressable
              key={member.id}
              onPress={() => onSelect(member.id)}
              style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                borderRadius: radius.full,
                backgroundColor: isSelected ? colors.primary : colors.surfaceAlt,
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.semibold,
                  color: isSelected ? colors.onPrimary : colors.textSecondary,
                }}
              >
                {member.nickname}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}
