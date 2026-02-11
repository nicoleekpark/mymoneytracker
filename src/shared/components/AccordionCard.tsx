import React, { useState } from 'react'
import { LayoutAnimation, Platform, Pressable, Text, UIManager, View } from 'react-native'
import { fontSize } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

type Colors = {
  text: string
  textSecondary: string
  surface: string
  surfaceAlt: string
  border: string
}

type AccordionCardProps = {
  title: string
  colors: Colors
  /** Summary content shown when collapsed (hidden when expanded if hideSummaryOnExpand is true) */
  summary?: React.ReactNode
  /** Expanded content shown below summary */
  children: React.ReactNode
  /** Initial expanded state */
  defaultExpanded?: boolean
  /** Right side of header (e.g., total amount) */
  headerRight?: React.ReactNode
  /** Hide summary when expanded (default: false) */
  hideSummaryOnExpand?: boolean
  /** Text shown at bottom when collapsed (e.g., "Tap to expand full calendar") */
  expandHintText?: string
}

export function AccordionCard({
  title,
  colors,
  summary,
  children,
  defaultExpanded = false,
  headerRight,
  hideSummaryOnExpand = false,
  expandHintText,
}: AccordionCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  function toggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded((v) => !v)
  }

  const showSummary = summary && (!expanded || !hideSummaryOnExpand)

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      {/* Header - always visible, tappable */}
      <Pressable
        onPress={toggle}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          paddingBottom: showSummary ? 12 : 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          <Text style={{ fontSize: fontSize.lg, fontWeight: '800', color: colors.text, letterSpacing: 0.2 }}>
            {title}
          </Text>
          {headerRight}
        </View>
        <Text style={{ fontSize: fontSize.md, color: colors.textSecondary }}>
          {expanded ? '▲' : '▼'}
        </Text>
      </Pressable>

      {/* Summary - visible based on hideSummaryOnExpand setting */}
      {showSummary && (
        <Pressable onPress={toggle} style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          {summary}
        </Pressable>
      )}

      {/* Expand hint text at bottom when collapsed */}
      {!expanded && expandHintText && (
        <Pressable onPress={toggle} style={{ paddingBottom: 16 }}>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'center' }}>
            {expandHintText}
          </Text>
        </Pressable>
      )}

      {/* Expanded content */}
      {expanded && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            padding: 16,
            backgroundColor: colors.surfaceAlt,
          }}
        >
          {children}
        </View>
      )}
    </View>
  )
}

/**
 * Summary row component for consistent summary layout
 */
type SummaryRowProps = {
  items: Array<{
    label: string
    value: string
    color?: string
  }>
  colors: Colors
}

export function AccordionSummaryRow({ items, colors }: SummaryRowProps) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {items.map((item, idx) => (
        <View
          key={idx}
          style={{
            flex: 1,
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.md,
            padding: 10,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: fontSize.xs,
              fontWeight: '600',
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 4,
            }}
          >
            {item.label}
          </Text>
          <Text
            style={{
              fontSize: fontSize.lg,
              fontWeight: '800',
              color: item.color || colors.text,
            }}
          >
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  )
}
