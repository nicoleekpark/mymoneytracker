import FontAwesome from '@expo/vector-icons/FontAwesome'
import React from 'react'
import { UNCATEGORIZED_COLOR } from '@/shared/theme/tokens/viewStyles'

type CategoryIconProps = {
  name: string
  size?: number
  color?: string
}

/**
 * Renders a category icon using FontAwesome.
 * Falls back to 'question-circle' if icon name is invalid.
 */
export function CategoryIcon({ name, size = 16, color = UNCATEGORIZED_COLOR }: CategoryIconProps) {
  return (
    <FontAwesome
      name={name as React.ComponentProps<typeof FontAwesome>['name']}
      size={size}
      color={color}
    />
  )
}
