import { useHoHTheme } from '@/providers'
import { Text, View } from 'react-native'

export default function SettingsScreen() {
  const theme = useHoHTheme()
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.semantic.background }}>
      <Text style={{ color: theme.semantic.text, fontSize: 20, fontWeight: '700' }}>
        Settings
      </Text>
    </View>
  )
}
