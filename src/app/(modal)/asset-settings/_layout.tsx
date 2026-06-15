import { Stack } from 'expo-router'

/**
 * Asset Settings Stack Layout
 *
 * Nested stack navigator within the asset-settings modal.
 * Child screens slide from right (like account-settings pattern).
 */
export default function AssetSettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          animation: 'none',
        }}
      />
      <Stack.Screen name="asset-detail" />
      <Stack.Screen name="add" />
    </Stack>
  )
}
