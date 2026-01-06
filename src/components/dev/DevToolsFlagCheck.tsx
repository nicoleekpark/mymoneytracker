import { FEATURE_FLAGS } from '@/config/feature-flags.config'
import { Text, View } from 'react-native'

export function DevToolsFlagCheck() {
  const raw = process.env.EXPO_PUBLIC_DEV_TOOLS
  const computed = FEATURE_FLAGS.devTools

  return (
    <View style={{ position: 'absolute', bottom: 40, right: 20, padding: 12, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8, zIndex: 9999 }}>
      <Text style={{ color: 'white', fontSize: 12 }}>devTools_env</Text>
      <Text style={{ color: 'white', fontSize: 12 }}>{String(raw)}</Text>

      <Text style={{ color: 'white', fontSize: 12, marginTop: 8 }}>devTools_flag</Text>
      <Text style={{ color: computed ? 'lime' : 'red', fontWeight: 'bold' }}>{String(computed)}</Text>
    </View>
  )
}
