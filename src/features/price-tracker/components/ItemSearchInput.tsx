import React from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useHoHTheme } from '@/shared/providers'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize } from '@/shared/theme/tokens/typography'

type Props = {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export function ItemSearchInput({ value, onChangeText, placeholder = 'Search items...' }: Props) {
  const theme = useHoHTheme()

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.semantic.surface, borderColor: theme.semantic.border },
      ]}
    >
      <FontAwesome name="search" size={14} color={theme.semantic.textSecondary as string} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.semantic.textSecondary as string}
        style={[styles.input, { color: theme.semantic.text }]}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    padding: 0,
  },
})
