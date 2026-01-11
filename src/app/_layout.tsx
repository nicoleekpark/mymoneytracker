import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFonts } from 'expo-font'
import { router, Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import { Pressable } from 'react-native'
import 'react-native-reanimated'

import { HoHThemeProvider } from '@/providers'
import { ScrollView, Text, useColorScheme, View } from 'react-native'

import { initDbPragmas } from '@/lib/db/sqlite'

import { DevToolsOverlay } from '@/components/dev/DevToolsOverlay'
import { APP_CONFIG } from '@/config'
import { migrate } from '@/lib/db/migrate'
import { TamaguiProvider } from 'tamagui'
import tamaguiConfig from '../../tamagui.config'
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router'

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const [dbReady, setDbReady] = useState(false)
  const [dbError, setDbError] = useState<unknown>(null)

  const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  })

  useEffect(() => {
    console.log('DEV_TOOLS', process.env.EXPO_PUBLIC_DEV_TOOLS)
  }, [])

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    try {
      initDbPragmas()
      migrate()
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
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
          DB init failed
        </Text>
        <Text selectable>
          {String((dbError as any)?.message ?? dbError)}
        </Text>
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

  return <RootLayoutNav initialMode={isDark ? 'dark' : 'light'} />
}

function RootLayoutNav({ initialMode }: { initialMode: 'light' | 'dark' }) {
  return (
    <HoHThemeProvider initialMode={initialMode}>
      <TamaguiProvider config={tamaguiConfig}>
        <>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: '' }} />
            <Stack.Screen
              name="add-transaction"
              options={{
                title: 'Add Transaction',
                presentation: 'modal',
                headerTitleAlign: 'center',
                 headerLeft: () => (
                  <Pressable onPress={() => router.back()} hitSlop={12} style={{ paddingHorizontal: 12 }}>
                    <FontAwesome name="close" size={20} />
                  </Pressable>
                )
              }}
            />
            <Stack.Screen name="settings" options={{
              title: 'Settings',
              headerTitleAlign: 'center',
              headerBackTitle: '' }} />
          </Stack>
          {__DEV__ && APP_CONFIG.featureFlags.devTools && <DevToolsOverlay />}
        </>
      </TamaguiProvider>
    </HoHThemeProvider>
  )
}
