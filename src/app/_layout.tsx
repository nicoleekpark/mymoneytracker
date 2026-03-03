import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import 'react-native-reanimated'

import { HoHThemeProvider } from '@/providers'
import { ToastProvider } from '@/shared/components'
import { ScrollView, Text, View } from 'react-native'
import { fontSize } from '@/theme/tokens/typography'

import { initDbPragmas, migrate, runSystemSeeds } from '@/infrastructure/db'

import { TamaguiProvider } from 'tamagui'
import tamaguiConfig from '../../tamagui.config'

export { ErrorBoundary } from 'expo-router'

/**  Keep the splash screen visible while we fetch resources */
SplashScreen.preventAutoHideAsync()

/** Root layout component - initializes DB and sets up theming/navigation
 * Render logic decides what to show, useEffect does the work after the screen is already decided
 * useEffect runs after render, so even if DB init takes time,
 * we can return null first and keep the splash screen visible to avoid showing a blank or frozen UI
 */
export default function RootLayout() {
  // [variableName, functionToSetVariable] = useState(initialValueOfVariable)
  const [dbReady, setDbReady] = useState(false)
  const [dbError, setDbError] = useState<unknown>(null)
  
  const [loaded, fontError] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font
  })
  
  useEffect(() => {
    if (fontError) throw fontError
  }, [fontError])

  useEffect(() => {
    try {
      initDbPragmas()
      migrate()
      runSystemSeeds()
      setDbReady(true)
    } catch (e) {
      console.error('DB migrate failed', e)
      setDbError(e)
      setDbReady(false)
    }
  }, [])
  
  useEffect(() => {
    if (loaded && dbReady) {
      SplashScreen.hideAsync()
    }
  }, [loaded, dbReady])

  if (!loaded) return null

  if (dbError) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: fontSize.xl, fontWeight: '700', marginBottom: 8 }}>DB init failed</Text>
        <Text selectable>{String((dbError as any)?.message ?? dbError)}</Text>
      </ScrollView>
    )
  }

  if (!dbReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Loading…</Text>
      </View>
    )
  }

  return <RootLayoutNav />
}

function RootLayoutNav() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <HoHThemeProvider initialMode="dark">
          <ToastProvider>
            <TamaguiProvider config={tamaguiConfig}>
              <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="settings" />
              <Stack.Screen
                name="(modal)/add-transaction"
                options={{
                  presentation: 'modal',
                  headerShown: false
                }}
              />
              <Stack.Screen
                name="notifications"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  gestureEnabled: true,
                  gestureDirection: 'horizontal',
                }}
              />
              </Stack>
            </TamaguiProvider>
          </ToastProvider>
        </HoHThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}
