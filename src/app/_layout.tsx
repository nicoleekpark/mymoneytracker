// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: EXTERNAL LIBRARIES
// These are npm packages installed in node_modules
// ═══════════════════════════════════════════════════════════════════════════
import FontAwesome from '@expo/vector-icons/FontAwesome' // Icon library (pie-chart, list, etc)
import { useFonts } from 'expo-font'                     // Hook to load custom fonts async
import { Stack } from 'expo-router'                       // Stack = screen stack navigation
import * as SplashScreen from 'expo-splash-screen'       // Native splash screen control
import { useEffect, useRef, useState } from 'react'      // React hooks for state & side effects
import { GestureHandlerRootView } from 'react-native-gesture-handler' // Enables swipe gestures
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'       // Context for bottom sheets
import 'react-native-reanimated'                         // Side-effect import: initializes animations

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: APP-SPECIFIC IMPORTS
// @/ is alias for src/ (configured in tsconfig.json)
// ═══════════════════════════════════════════════════════════════════════════
import { HoHThemeProvider } from '@/shared/providers'           // Theme context (light/dark mode)
import { ToastProvider } from '@/shared/components'      // Toast notification context
import { ScrollView, Text, View } from 'react-native'    // Basic RN components for error UI
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography' // Design tokens
import { spacing } from '@/shared/theme/tokens/spacing' // Spacing tokens

import { initDbPragmas, migrate, runSystemSeeds } from '@/infrastructure/db' // DB setup functions
import { runAppLaunchTriggers } from '@/core/services/notification' // Checks for notifications on launch
import { useSettingsStore } from '@/shared/store/settings.store' // Settings persistence
import { useTagsStore } from '@/shared/store/tags.store' // Tags persistence
import { useQuickChipsStore } from '@/shared/store/quickChips.store' // Quick chips persistence
import { usePaymentChipsOrderStore } from '@/shared/store/paymentChipsOrder.store' // Payment chips order
import { useDraftsStore } from '@/shared/store/drafts.store' // Drafts persistence
import { logError } from '@/shared/utils/logger' // Centralized error logging


export { ErrorBoundary } from 'expo-router'              // Re-export for Expo Router error handling

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: SPLASH SCREEN CONTROL
// Without this, user would see blank white screen while DB initializes
// ═══════════════════════════════════════════════════════════════════════════
SplashScreen.preventAutoHideAsync() // Keep splash visible until WE say to hide it

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: ROOT LAYOUT COMPONENT
// This is the FIRST component that renders. It's a state machine:
//   State 1: Loading fonts → return null (splash still visible)
//   State 2: DB error → show error screen
//   State 3: Everything ready → show actual app (RootLayoutNav)
// ═══════════════════════════════════════════════════════════════════════════
// Minimum time to show splash screen (ms)
const MIN_SPLASH_DURATION = 2000

export default function RootLayout() {
  // ─── State Variables ─────────────────────────────────────────────────────
  // useState returns [currentValue, setterFunction]
  const [dbReady, setDbReady] = useState(false)      // Has database initialized?
  const [dbError, setDbError] = useState<unknown>(null) // Any DB errors?
  const splashStartTime = useRef(Date.now())         // Track when splash started

  // useFonts returns [loaded: boolean, error: Error | null]
  const [loaded, fontError] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font // Spread operator: includes all FontAwesome fonts
  })

  // ─── Effect 1: Font Error Handling ───────────────────────────────────────
  // useEffect runs AFTER render. [fontError] = only run when fontError changes
  useEffect(() => {
    if (fontError) throw fontError // Crash app if fonts fail (critical error)
  }, [fontError])

  // ─── Effect 2: Database Initialization ───────────────────────────────────
  // [] = empty dependency array = runs ONCE when component mounts
  // This is where the database is set up!
  useEffect(() => {
    try {
      initDbPragmas()         // 1. Set SQLite performance flags (foreign keys, journal mode)
      migrate()               // 2. Run all pending migrations (create/update tables)

      // Ensure new columns exist (in case migrations didn't run properly on existing installs)
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const sqlite = require('@/infrastructure/db/sqlite')
        const cols = (sqlite.queryAll(`PRAGMA table_info(transactions);`) as { name: string }[]).map((r) => r.name)
        if (!cols.includes('fee_cents')) {
          sqlite.exec(`ALTER TABLE transactions ADD COLUMN fee_cents INTEGER DEFAULT NULL;`)
        }
        if (!cols.includes('parent_transaction_id')) {
          sqlite.exec(`ALTER TABLE transactions ADD COLUMN parent_transaction_id TEXT REFERENCES transactions(id) ON DELETE CASCADE;`)
        }
        if (!cols.includes('is_opening_balance')) {
          sqlite.exec(`ALTER TABLE transactions ADD COLUMN is_opening_balance INTEGER NOT NULL DEFAULT 0 CHECK (is_opening_balance IN (0, 1));`)
          sqlite.exec(`UPDATE transactions SET is_opening_balance = 1 WHERE item = 'Opening Balance' AND type = 'income';`)
        }
      } catch {
        // Column migration already applied or failed - continue
      }
      runSystemSeeds()        // 3. Seed default data (categories, accounts)
      runAppLaunchTriggers()  // 4. Check for notifications (budget alerts, draft reminders)

      // 5. Hydrate Zustand stores from SQLite persistence
      useSettingsStore.getState()._hydrate()
      useTagsStore.getState()._hydrate()
      useQuickChipsStore.getState()._hydrate()
      usePaymentChipsOrderStore.getState()._hydrate()
      useDraftsStore.getState().loadDrafts() // Load drafts for FAB visibility

      setDbReady(true)        // 6. Signal: DB is ready!
    } catch (e) {
      logError('Database', e)
      setDbError(e)           // Store error for display
      setDbReady(false)
    }
  }, [])

  // ─── Effect 3: Hide Splash When Ready ────────────────────────────────────
  // Runs when either 'loaded' or 'dbReady' changes
  // Only hides splash when BOTH are true AND minimum duration has passed
  useEffect(() => {
    if (loaded && dbReady) {
      const elapsed = Date.now() - splashStartTime.current
      const remaining = MIN_SPLASH_DURATION - elapsed

      if (remaining > 0) {
        // Wait for remaining time before hiding splash
        const timer = setTimeout(() => {
          SplashScreen.hideAsync()
        }, remaining)
        return () => clearTimeout(timer)
      } else {
        // Already past minimum duration, hide immediately
        SplashScreen.hideAsync()
      }
    }
  }, [loaded, dbReady])

  // ─── Conditional Rendering (State Machine) ───────────────────────────────
  // These if statements determine what the user sees

  // State 1: Fonts still loading → show nothing (splash screen stays visible)
  if (!loaded) return null

  // State 2: Database failed → show error screen (debugging)
  if (dbError) {
    const errorMessage = dbError instanceof Error ? dbError.message : String(dbError)
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: spacing.sm }}>
          Database initialization failed
        </Text>
        <Text selectable style={{ fontSize: fontSize.sm, marginBottom: spacing.lg }}>
          {errorMessage}
        </Text>
        <Text style={{ fontSize: fontSize.xs, color: '#666' }}>
          Try closing and reopening the app. If the issue persists, reinstall the app.
        </Text>
      </ScrollView>
    )
  }

  // State 3: Fonts loaded but DB not ready → show loading (rare, DB is fast)
  if (!dbReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.medium }}>Loading…</Text>
      </View>
    )
  }

  // State 4: Everything ready → show the actual app!
  return <RootLayoutNav />
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5: ROOT LAYOUT NAV - THE ACTUAL APP UI
// This sets up the "provider hierarchy" - nested contexts that provide
// features to ALL child components. Order matters: inner can access outer.
// ═══════════════════════════════════════════════════════════════════════════
function RootLayoutNav() {
  return (
    // Layer 1: Gesture support (swipes, drags)
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Layer 2: Theme context (useHoHTheme() works anywhere inside) */}
      <HoHThemeProvider initialMode="dark">
        {/* Layer 3: Bottom sheet context (can access theme if needed) */}
        <BottomSheetModalProvider>
          {/* Layer 4: Toast context (useToast() works anywhere inside) */}
          <ToastProvider>
            {/* ─── Navigation Stack ─────────────────────────────────── */}
            {/* Stack = screens stacked on top of each other */}
            {/* name = file path in src/app/ folder */}
            <Stack>
                {/* Main tabs (Dashboard, Transactions) - headerShown:false = we use custom AppBar */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                {/* Settings screen (pushes on top of tabs) */}
                <Stack.Screen name="settings" options={{ headerShown: false }} />

                {/* Add transaction - slides up as modal */}
                <Stack.Screen
                  name="(modal)/add-transaction"
                  options={{
                    presentation: 'modal',
                    headerShown: false
                  }}
                />

                {/* Edit transaction - also a modal */}
                <Stack.Screen
                  name="(modal)/edit-transaction"
                  options={{
                    presentation: 'modal',
                    headerShown: false
                  }}
                />

                {/* Add account - slides up as modal */}
                <Stack.Screen
                  name="(modal)/add-account"
                  options={{
                    presentation: 'modal',
                    headerShown: false
                  }}
                />

                {/* Account detail - slides up as modal */}
                <Stack.Screen
                  name="(modal)/account-detail"
                  options={{
                    presentation: 'modal',
                    headerShown: false
                  }}
                />

                {/* Edit account - slides up as modal */}
                <Stack.Screen
                  name="(modal)/edit-account"
                  options={{
                    presentation: 'modal',
                    headerShown: false
                  }}
                />

                {/* Account settings - slides up as modal */}
                <Stack.Screen
                  name="(modal)/account-settings"
                  options={{
                    presentation: 'modal',
                    headerShown: false
                  }}
                />

                {/* Asset settings - slides up as modal */}
                <Stack.Screen
                  name="(modal)/asset-settings"
                  options={{
                    presentation: 'modal',
                    headerShown: false
                  }}
                />

                {/* Net worth history - slides up as modal */}
                <Stack.Screen
                  name="(modal)/net-worth-history"
                  options={{
                    presentation: 'modal',
                    headerShown: false
                  }}
                />

                {/* Notifications - slides from right like normal screen */}
                <Stack.Screen
                  name="notifications"
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    gestureEnabled: true,        // Can swipe back
                    gestureDirection: 'horizontal',
                  }}
                />
            </Stack>
          </ToastProvider>
        </BottomSheetModalProvider>
      </HoHThemeProvider>
    </GestureHandlerRootView>
  )
}
