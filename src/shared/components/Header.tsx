import { useHoHTheme } from '@/providers'
import { textStyles } from '@/theme/tokens/typography'
import React from 'react'
import { Text, View, type StyleProp, type ViewStyle } from 'react-native'

type HeaderVariant = 'screen' | 'section' | 'card'
type HeaderAlign = 'left' | 'center' | 'right'

type HeaderProps = {
  children: string
  variant?: HeaderVariant
  align?: HeaderAlign
  style?: StyleProp<ViewStyle>
}

const variantMap = {
  screen: textStyles.screenHeader,
  section: textStyles.sectionHeader,
  card: textStyles.cardHeader,
} as const

export function Header({
  children,
  variant = 'section',
  align = 'left',
  style,
}: HeaderProps) {
  const theme = useHoHTheme()

  return (
    <View style={[align === 'center' && { alignItems: 'center' }, style]}>
      <Text style={[variantMap[variant], { color: theme.semantic.text }]}>
        {children}
      </Text>
    </View>
  )
}
