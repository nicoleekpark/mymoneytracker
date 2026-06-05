import React, { useEffect, useRef } from 'react'
import { LayoutAnimation, Platform, Pressable, Text, UIManager, View } from 'react-native'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { SECTION_GAP } from '@/shared/theme/tokens/viewStyles'

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

type CollapsibleSectionColors = {
  text: string
  textSecondary: string
  border: string
}

type Props = {
  title: string
  hint: string // e.g., "2+ mo"
  hasData: boolean // true if data requirements met
  isExpanded: boolean
  onToggle: () => void
  onUnlock: () => void // called when data becomes available
  placeholder: React.ReactNode // shown when expanded but no data
  children: React.ReactNode // shown when expanded and has data
  colors: CollapsibleSectionColors
}

/**
 * Collapsible section for dashboard.
 * - Collapsed by default when no data
 * - Shows hint in collapsed state
 * - Expands to show placeholder (no data) or children (has data)
 * - Auto-expands when data becomes available (first time only)
 */
export function CollapsibleSection({
  title,
  hint,
  hasData,
  isExpanded,
  onToggle,
  onUnlock,
  placeholder,
  children,
  colors,
}: Props) {
  const wasUnlockedRef = useRef(hasData)

  // Auto-expand when data becomes available for the first time
  useEffect(() => {
    if (hasData && !wasUnlockedRef.current) {
      wasUnlockedRef.current = true
      onUnlock()
    }
  }, [hasData, onUnlock])

  function handleToggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    onToggle()
  }

  return (
    <View style={{ marginBottom: SECTION_GAP }}>
      {/* Header - always visible */}
      <Pressable
        onPress={handleToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: spacing.sm,
        }}
        accessibilityRole="button"
        accessibilityLabel={`${title}${!hasData ? `, ${hint} required` : ''}`}
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Text
            style={{
              fontSize: fontSize.lg,
              fontWeight: fontWeight.semibold,
              color: hasData ? colors.text : colors.textSecondary,
            }}
          >
            {title}
          </Text>
          {/* Hint badge - shown when no data */}
          {!hasData && (
            <View
              style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: 4,
                backgroundColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: fontWeight.medium,
                  color: colors.textSecondary,
                  letterSpacing: letterSpacing.wide,
                }}
              >
                {hint}
              </Text>
            </View>
          )}
        </View>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
          {isExpanded ? '▲' : '▼'}
        </Text>
      </Pressable>

      {/* Content - only when expanded */}
      {isExpanded && (
        <View style={{ marginTop: spacing.sm }}>
          {hasData ? children : placeholder}
        </View>
      )}
    </View>
  )
}
