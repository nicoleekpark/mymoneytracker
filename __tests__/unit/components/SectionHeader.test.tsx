import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { SectionHeader } from '@/shared/components/SectionHeader'

// Mock colors to use in tests
const mockColors = {
  text: '#000000',
  textSecondary: '#666666',
  border: '#CCCCCC',
}

describe('SectionHeader', () => {
  describe('basic rendering', () => {
    it('renders title text', () => {
      render(<SectionHeader title="Test Section" colors={mockColors} />)

      expect(screen.getByText('Test Section')).toBeTruthy()
    })

    it('renders with only required props', () => {
      const { toJSON } = render(
        <SectionHeader title="Minimal Section" colors={mockColors} />
      )

      expect(toJSON()).toBeTruthy()
    })
  })

  describe('rightText prop', () => {
    it('renders rightText when provided', () => {
      render(
        <SectionHeader
          title="Section"
          rightText="$ 1,234"
          colors={mockColors}
        />
      )

      expect(screen.getByText('$ 1,234')).toBeTruthy()
    })

    it('does not render rightText when not provided', () => {
      render(<SectionHeader title="Section" colors={mockColors} />)

      expect(screen.queryByText('$ 1,234')).toBeNull()
    })
  })

  describe('rightLabel prop', () => {
    it('renders rightLabel when provided and no rightText', () => {
      render(
        <SectionHeader
          title="Section"
          rightLabel="View All"
          colors={mockColors}
        />
      )

      expect(screen.getByText('View All')).toBeTruthy()
    })

    it('does not render rightLabel when rightText is provided', () => {
      render(
        <SectionHeader
          title="Section"
          rightText="$ 500"
          rightLabel="View All"
          colors={mockColors}
        />
      )

      // rightText should be shown
      expect(screen.getByText('$ 500')).toBeTruthy()
      // rightLabel should NOT be shown when rightText exists
      expect(screen.queryByText('View All')).toBeNull()
    })
  })

  describe('description prop', () => {
    it('renders description when provided', () => {
      render(
        <SectionHeader
          title="Section"
          description="This is a description"
          colors={mockColors}
        />
      )

      expect(screen.getByText('This is a description')).toBeTruthy()
    })

    it('does not render description when not provided', () => {
      render(<SectionHeader title="Section" colors={mockColors} />)

      expect(screen.queryByText('This is a description')).toBeNull()
    })
  })

  describe('all props combined', () => {
    it('renders with all optional props', () => {
      render(
        <SectionHeader
          title="Full Section"
          rightText="$ 2,500"
          rightColor="#FF0000"
          description="Section description text"
          colors={mockColors}
        />
      )

      expect(screen.getByText('Full Section')).toBeTruthy()
      expect(screen.getByText('$ 2,500')).toBeTruthy()
      expect(screen.getByText('Section description text')).toBeTruthy()
    })
  })
})
