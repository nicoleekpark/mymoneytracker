import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import 'react-native-reanimated'

import { HoHThemeProvider } from '@/providers'
import { useColorScheme } from 'react-native'

import { migrate } from '@/lib/db/migrations'

import { DevToolsOverlay } from '@/components/dev/DevToolsOverlay'
import { APP_CONFIG } from '@/config'
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
      migrate()
      setDbReady(true)
    } catch (e) {
      console.error('DB migrate failed', e)
      setDbReady(true)
    }
  }, [])

  useEffect(() => {
    if (loaded && dbReady) {
      SplashScreen.hideAsync()
    }
  }, [loaded, dbReady])

  if (!loaded || !dbReady) {
    return null
  }

  return <RootLayoutNav initialMode={isDark ? 'dark' : 'light'} />
}

function RootLayoutNav({ initialMode }: { initialMode: 'light' | 'dark' }) {
  return (
    <HoHThemeProvider initialMode={initialMode}>
      <TamaguiProvider config={tamaguiConfig}>
        <>
          <Stack screenOptions={{ headerShown: false }}>
            {/* <Stack.Screen name="index" /> */}
            {/* <Stack.Screen name="cashflow" options={{ title: 'Cashflow' }} />
            <Stack.Screen name="accounts" options={{ title: 'Accounts' }} />
            <Stack.Screen name="transactions" options={{ title: 'Transactions' }} />
            <Stack.Screen name="categories" options={{ title: 'Categories' }} /> */}
            {/* <Stack.Screen name="add" options={{ title: 'Add Transaction' }} /> */}
            {/* <Stack.Screen name="investments" options={{ title: 'Investments' }} />
            <Stack.Screen name="assets" options={{ title: 'Assets' }} />
            <Stack.Screen name="budget" options={{ title: 'Budget' }} />
            <Stack.Screen name="reports" options={{ title: 'Reports' }} /> */}
          </Stack>
          {APP_CONFIG.featureFlags.devTools && <DevToolsOverlay />}
        </>
      </TamaguiProvider>
    </HoHThemeProvider>
  )
}
