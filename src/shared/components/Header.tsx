import { useHoHTheme } from '@/shared/providers'
import { textStyles } from '@/shared/theme/tokens/typography'
import React from 'react'
import { Text, View, type StyleProp, type ViewStyle } from 'react-native'

type HeaderVariant = 'screen' | 'section' | 'accent' | 'card'
type HeaderAlign = 'left' | 'center' | 'right'

type HeaderProps = {
  children: string
  variant?: HeaderVariant
  align?: HeaderAlign
  style?: StyleProp<ViewStyle>
  muted?: boolean // Use textSecondary color (for accent headers)
}

const variantMap = {
  screen: textStyles.screenHeader,
  section: textStyles.sectionHeader,
  accent: textStyles.accentHeader,
  card: textStyles.cardHeader,
} as const

export function Header({
  children,
  variant = 'section',
  align = 'left',
  style,
  muted = false,
}: HeaderProps) {
  const theme = useHoHTheme()

  const isAccent = variant === 'accent'
  const textColor = muted || isAccent ? theme.semantic.textSecondary : theme.semantic.text

  return (
    <View style={[align === 'center' && { alignItems: 'center' }, style]}>
      <Text style={[variantMap[variant], { color: textColor }]}>
        {isAccent ? children.toUpperCase() : children}
      </Text>
    </View>
  )
}
