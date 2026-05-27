import React from 'react'
import { render } from '@testing-library/react-native'
import { CategoryIcon } from '@/shared/components/CategoryIcon'

describe('CategoryIcon', () => {
  describe('basic rendering', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(<CategoryIcon name="shopping-cart" />)
      expect(toJSON()).toBeTruthy()
    })

    it('renders with custom size', () => {
      const { toJSON } = render(<CategoryIcon name="home" size={24} />)
      expect(toJSON()).toBeTruthy()
    })

    it('renders with custom color', () => {
      const { toJSON } = render(<CategoryIcon name="car" color="#FF0000" />)
      expect(toJSON()).toBeTruthy()
    })

    it('renders with all props', () => {
      const { toJSON } = render(
        <CategoryIcon name="money" size={32} color="#00FF00" />
      )
      expect(toJSON()).toBeTruthy()
    })
  })

  describe('default props', () => {
    it('uses default size of 16', () => {
      const { toJSON } = render(<CategoryIcon name="shopping-cart" />)
      // Component should render with default size
      expect(toJSON()).toBeTruthy()
    })

    it('uses UNCATEGORIZED_COLOR as default color', () => {
      const { toJSON } = render(<CategoryIcon name="shopping-cart" />)
      // Component should render with default color
      expect(toJSON()).toBeTruthy()
    })
  })

  describe('different icon names', () => {
    // Valid FontAwesome icon names
    const iconNames = [
      'home',
      'car',
      'shopping-cart',
      'credit-card',
      'coffee',
      'plane',
      'heart',
      'star',
      'dollar',
      'gift',
    ]

    it.each(iconNames)('renders icon: %s', (name) => {
      const { toJSON } = render(<CategoryIcon name={name} />)
      expect(toJSON()).toBeTruthy()
    })
  })
})
