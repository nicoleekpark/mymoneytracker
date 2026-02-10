import React, { useState, useRef, useMemo } from 'react'
import { View, Pressable, PanResponder, LayoutChangeEvent } from 'react-native'

import type { InsightsColors } from '../insights.types'

type Props = {
  children: React.ReactNode
  colors: InsightsColors
}

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
 * Simple carousel showing one card at a time with swipe support
 * Container height adjusts to tallest card
 */
export function InsightCarousel({ children, colors }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [heights, setHeights] = useState<number[]>([])

  const validChildren = flattenChildren(children)
  const count = validChildren.length

  // Calculate max height from measured heights
  const maxHeight = heights.length > 0 ? Math.max(...heights) : undefined

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -50 && activeIndex < count - 1) {
        setActiveIndex(prev => Math.min(prev + 1, count - 1))
      } else if (gestureState.dx > 50 && activeIndex > 0) {
        setActiveIndex(prev => Math.max(prev - 1, 0))
      }
    }
  }), [activeIndex, count])

  const handleLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout
    setHeights(prev => {
      const newHeights = [...prev]
      newHeights[index] = height
      return newHeights
    })
  }

  if (count === 0) return null
  if (count === 1) {
    return <View>{validChildren[0]}</View>
  }

  return (
    <View>
      {/* Card container with fixed height */}
      <View
        {...panResponder.panHandlers}
        style={{ height: maxHeight, overflow: 'hidden' }}
      >
        {validChildren.map((child, i) => (
          <View
            key={i}
            onLayout={handleLayout(i)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              opacity: i === activeIndex ? 1 : 0,
              pointerEvents: i === activeIndex ? 'auto' : 'none'
            }}
          >
            {child}
          </View>
        ))}
      </View>

      {/* Dot indicators */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 }}>
        {validChildren.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => setActiveIndex(i)}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <View
              style={{
                width: i === activeIndex ? 16 : 6,
                height: 6,
                borderRadius: 3,
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
