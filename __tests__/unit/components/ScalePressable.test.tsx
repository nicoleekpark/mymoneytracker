import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import { ScalePressable } from '@/shared/components/ScalePressable'

// Mock reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  return {
    ...Reanimated,
    useSharedValue: jest.fn((initial) => ({ value: initial })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((value) => value),
  }
})

describe('ScalePressable', () => {
  describe('basic rendering', () => {
    it('renders children', () => {
      render(
        <ScalePressable>
          <Text>Press me</Text>
        </ScalePressable>
      )

      expect(screen.getByText('Press me')).toBeTruthy()
    })

    it('renders with custom style', () => {
      const { toJSON } = render(
        <ScalePressable style={{ padding: 16 }}>
          <Text>Styled</Text>
        </ScalePressable>
      )

      expect(toJSON()).toBeTruthy()
    })
  })

  describe('onPress handling', () => {
    it('calls onPress when pressed', () => {
      const onPress = jest.fn()

      render(
        <ScalePressable onPress={onPress}>
          <Text>Press me</Text>
        </ScalePressable>
      )

      fireEvent.press(screen.getByText('Press me'))
      expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('calls onPressIn when press starts', () => {
      const onPressIn = jest.fn()

      const { getByText } = render(
        <ScalePressable onPressIn={onPressIn}>
          <Text>Press me</Text>
        </ScalePressable>
      )

      fireEvent(getByText('Press me'), 'pressIn')
      expect(onPressIn).toHaveBeenCalledTimes(1)
    })

    it('calls onPressOut when press ends', () => {
      const onPressOut = jest.fn()

      const { getByText } = render(
        <ScalePressable onPressOut={onPressOut}>
          <Text>Press me</Text>
        </ScalePressable>
      )

      fireEvent(getByText('Press me'), 'pressOut')
      expect(onPressOut).toHaveBeenCalledTimes(1)
    })
  })

  describe('disabled state', () => {
    it('does not call onPress when disabled', () => {
      const onPress = jest.fn()

      render(
        <ScalePressable disabled onPress={onPress}>
          <Text>Disabled</Text>
        </ScalePressable>
      )

      fireEvent.press(screen.getByText('Disabled'))
      expect(onPress).not.toHaveBeenCalled()
    })
  })

  describe('custom scaleValue', () => {
    it('accepts custom scaleValue prop', () => {
      const { toJSON } = render(
        <ScalePressable scaleValue={0.9}>
          <Text>Custom scale</Text>
        </ScalePressable>
      )

      expect(toJSON()).toBeTruthy()
    })
  })

  describe('accessibility', () => {
    it('passes accessibilityLabel to pressable', () => {
      render(
        <ScalePressable accessibilityLabel="Custom button">
          <Text>Button</Text>
        </ScalePressable>
      )

      expect(screen.getByLabelText('Custom button')).toBeTruthy()
    })

    it('passes accessibilityRole to pressable', () => {
      render(
        <ScalePressable accessibilityRole="button">
          <Text>Button</Text>
        </ScalePressable>
      )

      expect(screen.getByRole('button')).toBeTruthy()
    })
  })
})
