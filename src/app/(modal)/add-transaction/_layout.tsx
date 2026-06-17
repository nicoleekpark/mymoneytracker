import { Stack } from 'expo-router'
import { useHoHTheme } from '@/shared/providers'

/**
 * Add Transaction Stack Layout
 *
 * Nested stack navigator within the add-transaction modal.
 * Child screens slide from right (like Notifications).
 */
export default function AddTransactionLayout() {
  const { semantic } = useHoHTheme()

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        // Remove iOS card shadow that causes black line
        contentStyle: { backgroundColor: semantic.surface },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          animation: 'none', // No animation for the initial screen
        }}
      />
      <Stack.Screen name="category-selection" />
      <Stack.Screen name="account-selection" />
      <Stack.Screen name="add-account" />
    </Stack>
  )
}
