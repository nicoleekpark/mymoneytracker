import FontAwesome from '@expo/vector-icons/FontAwesome'
import React, { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { InfoSheet } from '@/shared/components'
import { componentStyles } from '@/shared/theme/tokens/viewStyles'

import type { InsightCardData, InsightsColors, EvidenceItem, CTAButton } from '../insights.types'
import { BADGE_CONFIG } from '../insights.types'

// Line heights for multi-line text readability
const LINE_HEIGHT_LG = 24 // For lg fontSize (18)
const LINE_HEIGHT_SM = 18 // For sm fontSize (14)
const LINE_HEIGHT_MD = 19 // For md/sm fontSize in paragraphs

// CTA button height (touch target)
const CTA_BUTTON_HEIGHT = 36

type Props = {
  card: InsightCardData
  colors: InsightsColors
  children?: React.ReactNode
  /** Flat = Option A (no evidence/CTAs), card = Option B (full card with evidence/CTAs) */
  variant?: 'flat' | 'card'
}

/**
 * Parse body text and colorize values like $X, +$X, -$X, X%
 * Supports compact format: -$9.8k, +$1.2k
 */
function ColorizedBody({ text, colors }: { text: string; colors: InsightsColors }) {
  // Match patterns: +$9.8k | -$1,234 | $500 | 45%
  const regex = /(\+\$[\d,.]+k?|\-\$[\d,.]+k?|\$[\d,.]+k?|\d+%)/g
  // Split with capturing group includes matches in the result array
  const parts = text.split(regex)

  return (
    <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.medium, color: colors.text, lineHeight: LINE_HEIGHT_LG }}>
      {parts.map((part, i) => {
        if (!part) return null
        // Check if this part is a value (matches our pattern)
        const isValue = regex.test(part)
        // Reset regex lastIndex after test
        regex.lastIndex = 0

        if (isValue) {
          const isNegative = part.startsWith('-')
          const valueColor = isNegative ? colors.danger : colors.success
          return (
            <Text key={i} style={{ fontWeight: fontWeight.bold, color: valueColor }}>
              {part}
            </Text>
          )
        }

        return <Text key={i}>{part}</Text>
      })}
    </Text>
  )
}

/**
 * Evidence section - displays key-value pairs
 */
function EvidenceSection({ items, colors }: { items: EvidenceItem[]; colors: InsightsColors }) {
  if (items.length === 0) return null

  return (
    <View style={{ marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, opacity: 0.8 }}>
      {items.map((item, i) => (
        <View
          key={item.key + i}
          style={{
            flexDirection: 'row',
            gap: spacing.md,
            alignItems: 'flex-start',
            marginBottom: spacing.sm
          }}
        >
          <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: letterSpacing.wide, width: 95 }}>
            {item.key}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text, lineHeight: LINE_HEIGHT_SM }}>
              {item.value}
            </Text>
            {item.detail && (
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs / 2 }}>
                {item.detail}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  )
}

/**
 * CTA buttons row
 * P1: Only first button is primary, rest are text links
 */
function CTARow({ buttons, colors }: { buttons: CTAButton[]; colors: InsightsColors }) {
  if (buttons.length === 0) return null

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.lg }}>
      {buttons.map((btn, i) => {
        // Only first button can be primary, rest are text links
        const isPrimary = i === 0 && btn.variant === 'primary'

        if (isPrimary) {
          return (
            <Pressable
              key={btn.label + i}
              onPress={() => {
                // Placeholder - CTAs don't do anything yet
              }}
              style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                borderRadius: radius.full,
                backgroundColor: colors.primary,
                minHeight: CTA_BUTTON_HEIGHT
              }}
            >
              <Text style={{
                fontSize: fontSize.sm,
                fontWeight: fontWeight.semibold,
                color: colors.surface
              }}>
                {btn.label}
              </Text>
            </Pressable>
          )
        }

        // Text link style for secondary CTAs
        return (
          <Pressable
            key={btn.label + i}
            onPress={() => {
              // Placeholder
            }}
            hitSlop={{ top: spacing.sm, bottom: spacing.sm, left: spacing.sm, right: spacing.sm }}
          >
            <Text style={{
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium,
              color: colors.textSecondary
            }}>
              {btn.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

function ExplainBottomSheet({
  visible,
  onClose,
  card,
  colors
}: {
  visible: boolean
  onClose: () => void
  card: InsightCardData
  colors: InsightsColors
}) {
  return (
    <InfoSheet
      visible={visible}
      onClose={onClose}
      title="About this insight"
      colors={{
        surface: colors.surface,
        text: colors.text,
        textSecondary: colors.textSecondary,
        surfaceAlt: colors.surfaceAlt
      }}
      snapPoints={['40%']}
    >
      {/* Section A: Calculation */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm }}>
          Calculation
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: LINE_HEIGHT_MD }}>
          {card.explanation?.calculation || 'Compares this month to typical.'}
        </Text>
      </View>

      {/* Section B: Why it matters (card-specific) */}
      {card.explanation?.whatMatters && (
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm }}>
            Why it matters
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: LINE_HEIGHT_MD }}>
            {card.explanation.whatMatters}
          </Text>
        </View>
      )}

      {/* Section C: Note */}
      <View>
        <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm }}>
          Note
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: LINE_HEIGHT_MD }}>
          Pattern summary, not a prediction.
        </Text>
      </View>
    </InfoSheet>
  )
}

export function InsightCard({ card, colors, children, variant = 'flat' }: Props) {
  const [showExplain, setShowExplain] = useState(false)
  const isFlat = variant === 'flat'

  return (
    <>
      <View>
        {/* Header row: title + badge + info icon - matching Assets/Monthly */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
            <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text }}>
              {card.title}
            </Text>
            {card.badge && (
              <FontAwesome
                name={BADGE_CONFIG[card.badge].icon as React.ComponentProps<typeof FontAwesome>['name']}
                size={14}
                color={colors[BADGE_CONFIG[card.badge].colorKey as keyof InsightsColors]}
              />
            )}
          </View>
          {card.explanation && (
            <Pressable
              onPress={() => setShowExplain(true)}
              hitSlop={{ top: spacing.md, bottom: spacing.md, left: spacing.md, right: spacing.md }}
              style={[
                componentStyles.infoIndicator.container,
                {
                  borderColor: colors.textSecondary,
                  marginLeft: spacing.sm
                }
              ]}
            >
              <Text style={[componentStyles.infoIndicator.text, { color: colors.textSecondary }]}>i</Text>
            </Pressable>
          )}
        </View>

        {/* Headline (body text) */}
        <ColorizedBody text={card.body} colors={colors} />

        {/* Sub text */}
        {card.sub && (
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: LINE_HEIGHT_MD }}>
            {card.sub}
          </Text>
        )}

        {/* Evidence section - only in card variant */}
        {!isFlat && card.evidence && card.evidence.length > 0 && (
          <EvidenceSection items={card.evidence} colors={colors} />
        )}

        {/* Optional children (charts, etc.) */}
        {children}

        {/* CTA buttons - only in card variant */}
        {!isFlat && card.ctas && card.ctas.length > 0 && (
          <CTARow buttons={card.ctas} colors={colors} />
        )}
      </View>

      {/* Bottom sheet */}
      <ExplainBottomSheet
        visible={showExplain}
        onClose={() => setShowExplain(false)}
        card={card}
        colors={colors}
      />
    </>
  )
}
