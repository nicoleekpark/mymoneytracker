import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import 'react-native-reanimated'

import { HoHThemeProvider } from '@/providers'
import { ScrollView, Text, View } from 'react-native'

import { initDbPragmas, migrate, runSystemSeeds } from '@/lib/db'

import { TamaguiProvider } from 'tamagui'
import tamaguiConfig from '../../tamagui.config'

export { ErrorBoundary } from 'expo-router'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
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
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>DB init failed</Text>
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
    <HoHThemeProvider initialMode="dark">
      <TamaguiProvider config={tamaguiConfig}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="settings" />
          <Stack.Screen name="(modal)/add-transaction" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
      </TamaguiProvider>
    </HoHThemeProvider>
  )
}
