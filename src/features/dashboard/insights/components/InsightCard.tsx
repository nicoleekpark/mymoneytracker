import React, { useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'

import type { InsightCardData, InsightsColors } from '../insights.types'

type Props = {
  card: InsightCardData
  colors: InsightsColors
}

/**
 * Parse body text and colorize values like $X, +$X, -$X, X%
 */
function ColorizedBody({ text, colors }: { text: string; colors: InsightsColors }) {
  // Match patterns: +$ 1,234 | -$ 1,234 | $ 1,234 | 45%
  const regex = /(\+\$\s?[\d,]+|\-\$\s?[\d,]+|\$\s?[\d,]+|\d+%)/g
  // Split with capturing group includes matches in the result array
  const parts = text.split(regex)

  return (
    <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text, lineHeight: 24 }}>
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
            <Text key={i} style={{ fontWeight: '700', color: valueColor }}>
              {part}
            </Text>
          )
        }

        return <Text key={i}>{part}</Text>
      })}
    </Text>
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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 24,
            paddingBottom: 40,
            maxHeight: '50%'
          }}
        >
          {/* Header */}
          <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 20 }}>
            Why you're seeing this
          </Text>

          {/* Section A: How this is calculated (common) */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
              How this is calculated
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19 }}>
              Based on your last 6 months of transactions.{'\n'}
              {card.explanation?.calculation || 'We compare this month to your typical baseline.'}
            </Text>
          </View>

          {/* Section B: What matters here (card-specific) */}
          {card.explanation?.whatMatters && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
                What matters here
              </Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19 }}>
                {card.explanation.whatMatters}
              </Text>
            </View>
          )}

          {/* Section C: What this is not (common) */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
              What this is not
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19 }}>
              This isn't a warning or a prediction.{'\n'}
              It's a summary of recent patterns.
            </Text>
          </View>

          {/* Close button */}
          <Pressable
            onPress={onClose}
            style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>Got it</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export function InsightCard({ card, colors }: Props) {
  const [showExplain, setShowExplain] = useState(false)

  return (
    <>
      <View style={{ paddingVertical: 8 }}>
        {/* Header row: title + info icon */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 }}>
            {card.title}
          </Text>
          {card.explanation && (
            <Pressable
              onPress={() => setShowExplain(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.textMuted,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.5,
                marginLeft: 8
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textMuted }}>i</Text>
            </Pressable>
          )}
        </View>

        {/* Body text */}
        <ColorizedBody text={card.body} colors={colors} />
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
