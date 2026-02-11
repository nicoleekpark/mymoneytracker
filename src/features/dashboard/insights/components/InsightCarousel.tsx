import React, { useState, useMemo } from 'react'
import { View, Pressable, Dimensions, ScrollView, LayoutChangeEvent } from 'react-native'

import { radius } from '@/theme/tokens/radius'

import type { InsightsColors } from '../insights.types'

type Props = {
  children: React.ReactNode
  colors: InsightsColors
}

// Peek amount on each side
const PEEK_WIDTH = 24
const CARD_GAP = 12

// Helper to properly flatten children
function flattenChildren(children: React.ReactNode): React.ReactNode[] {
  const result: React.ReactNode[] = []
  React.Children.forEach(children, child => {
    if (Array.isArray(child)) {
      result.push(...child.filter(Boolean))
    } else if (child) {
      result.push(child)
    }
  })
  return result
}

/**
 * Carousel with peek effect - shows partial adjacent cards
 * Uses horizontal ScrollView with snap behavior
 */
export function InsightCarousel({ children, colors }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width - 32)

  const validChildren = flattenChildren(children)
  const count = validChildren.length

  // Card width = container - peek on both sides - gaps
  const cardWidth = containerWidth - (PEEK_WIDTH * 2) - CARD_GAP

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width)
  }

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const offsetX = event.nativeEvent.contentOffset.x
    const newIndex = Math.round(offsetX / (cardWidth + CARD_GAP))
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < count) {
      setActiveIndex(newIndex)
    }
  }

  if (count === 0) return null
  if (count === 1) {
    return <View>{validChildren[0]}</View>
  }

  return (
    <View onLayout={handleContainerLayout}>
      {/* Horizontal scroll with snap */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + CARD_GAP}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: PEEK_WIDTH
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {validChildren.map((child, i) => (
          <View
            key={i}
            style={{
              width: cardWidth,
              marginRight: i < count - 1 ? CARD_GAP : 0,
              opacity: i === activeIndex ? 1 : 0.5
            }}
          >
            {child}
          </View>
        ))}
      </ScrollView>

      {/* Dot indicators */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 }}>
        {validChildren.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => {
              // Note: ScrollView doesn't expose scrollTo in this pattern
              // Dots just indicate position, tapping shows current index
              setActiveIndex(i)
            }}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <View
              style={{
                width: i === activeIndex ? 16 : 6,
                height: 6,
                borderRadius: radius.full,
                backgroundColor: i === activeIndex ? colors.text : colors.border,
                opacity: i === activeIndex ? 0.8 : 0.4
              }}
            />
          </Pressable>
        ))}
      </View>
    </View>
  )
}
