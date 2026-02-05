import React, { useState } from 'react'
import { LayoutAnimation, Platform, Pressable, Text, UIManager, View } from 'react-native'

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
  /** Summary content shown when collapsed (and when expanded) */
  summary?: React.ReactNode
  /** Expanded content shown below summary */
  children: React.ReactNode
  /** Initial expanded state */
  defaultExpanded?: boolean
  /** Right side of header (e.g., total amount) */
  headerRight?: React.ReactNode
}

export function AccordionCard({
  title,
  colors,
  summary,
  children,
  defaultExpanded = false,
  headerRight,
}: AccordionCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  function toggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded((v) => !v)
  }

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
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
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text, letterSpacing: 0.2 }}>
            {title}
          </Text>
          {headerRight}
        </View>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            backgroundColor: colors.surfaceAlt,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textSecondary }}>
            {expanded ? 'Collapse ▲' : 'Expand ▼'}
          </Text>
        </View>
      </Pressable>

      {/* Summary - always visible if provided */}
      {summary && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          {summary}
        </View>
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
            borderRadius: 10,
            padding: 10,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 9,
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
              fontSize: 15,
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
