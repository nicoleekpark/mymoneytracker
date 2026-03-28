// ═══════════════════════════════════════════════════════════════════════════
// TAB NAVIGATION LAYOUT
// This file controls the bottom tab bar. The (tabs) folder name is special -
// parentheses mean "group" in Expo Router (doesn't affect URL path).
// ═══════════════════════════════════════════════════════════════════════════
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Tabs } from 'expo-router'           // Tab navigator component
import React from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context' // iPhone notch/home bar

import { useHoHTheme } from '@/shared/providers'    // Theme hook (works because HoHThemeProvider wraps us)
import { AppBar } from '@/shared/components/AppBar' // Top bar with menu
import { TAB_BAR_HEIGHT, TAB_BAR_ICON_SIZE, TAB_BAR_ICON_OFFSET } from '@/shared/theme/tokens/viewStyles' // Layout constants
import { spacing } from '@/shared/theme/tokens/spacing' // Spacing tokens

// ─── Helper Component ──────────────────────────────────────────────────────
// Creates tab bar icons with consistent size
function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={TAB_BAR_ICON_SIZE} style={{ marginBottom: TAB_BAR_ICON_OFFSET }} {...props} />
}

// ─── Main Tab Layout ───────────────────────────────────────────────────────
export default function TabLayout() {
  const theme = useHoHTheme()              // Get current theme colors
  const insets = useSafeAreaInsets()       // Get safe area measurements (notch height, etc)

  return (
    <View style={{ flex: 1, backgroundColor: theme.semantic.background }}>

      {/* ─── AppBar (Top) ─────────────────────────────────────────────────
          Placed OUTSIDE Tabs = stays mounted when switching tabs (no re-render)
          paddingTop: insets.top = pushes below iPhone notch */}
      <View style={{ paddingTop: insets.top }}>
        <AppBar />
      </View>

      {/* ─── Tab Navigator ────────────────────────────────────────────────
          screenOptions = default settings for ALL tabs */}
      <Tabs
        screenOptions={{
          headerShown: false,                              // We use custom AppBar, not default header
          tabBarActiveTintColor: theme.semantic.text,      // Selected tab icon color
          tabBarInactiveTintColor: theme.semantic.textSecondary, // Unselected tab icon color
          tabBarStyle: {
            backgroundColor: theme.semantic.background,
            height: TAB_BAR_HEIGHT,                        // Shared constant (used by DraftsFAB too)
            paddingTop: spacing.sm,
            paddingBottom: spacing.sm
          },
          tabBarShowLabel: false                           // Icons only, no text labels
        }}
      >

        {/* Tab 1: Dashboard (default tab because file is named "index") */}
        <Tabs.Screen
          name="index"                                     // Maps to src/app/(tabs)/index.tsx
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <TabBarIcon name="pie-chart" color={color} />
          }}
        />

        {/* Hidden: Add screen exists but not in tab bar */}
        <Tabs.Screen
          name="add"                                       // Maps to src/app/(tabs)/add.tsx
          options={{
            href: null,                                    // href: null = hide from tab bar
          }}
        />

        {/* Tab 2: Transactions */}
        <Tabs.Screen
          name="transactions"                              // Maps to src/app/(tabs)/transactions.tsx
          options={{
            title: 'Transactions',
            tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />
          }}
        />

        {/* Hidden for v1: Price Tracker (coming in v2) */}
        <Tabs.Screen
          name="price-tracker"                             // Maps to src/app/(tabs)/price-tracker.tsx
          options={{
            href: null,                                    // Hidden for v1 release
          }}
        />

      </Tabs>
    </View>
  )
}
