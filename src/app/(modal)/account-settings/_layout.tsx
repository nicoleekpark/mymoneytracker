import { Stack } from 'expo-router'

/**
 * Account Settings Stack Layout
 *
 * Nested stack navigator within the account-settings modal.
 * Child screens slide from right (like add-transaction pattern).
 */
export default function AccountSettingsLayout() {
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
          animation: 'none', // No animation for the initial screen
        }}
      />
      <Stack.Screen name="add-account" />
      <Stack.Screen name="account-detail" />
    </Stack>
  )
}
