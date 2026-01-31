import FontAwesome from '@expo/vector-icons/FontAwesome'
import React from 'react'

type CategoryIconProps = {
  name: string
  size?: number
  color?: string
}

/**
 * Renders a category icon using FontAwesome.
 * Falls back to 'question-circle' if icon name is invalid.
 */
export function CategoryIcon({ name, size = 16, color = '#666' }: CategoryIconProps) {
  return (
    <FontAwesome
      name={name as React.ComponentProps<typeof FontAwesome>['name']}
      size={size}
      color={color}
    />
  )
}
