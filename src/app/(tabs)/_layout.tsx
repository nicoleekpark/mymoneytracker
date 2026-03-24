import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Tabs } from 'expo-router'
import React from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useHoHTheme } from '@/providers'
import { AppBar } from '@/shared/components/AppBar'

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={20} style={{ marginBottom: -3 }} {...props} />
}

export default function TabLayout() {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()

  return (
    <View style={{ flex: 1, backgroundColor: theme.semantic.background }}>
      {/* Persistent AppBar - stays mounted across tab switches */}
      <View style={{ paddingTop: insets.top }}>
        <AppBar />
      </View>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.semantic.text,
          tabBarInactiveTintColor: theme.semantic.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.semantic.background,
            height: 72,
            paddingTop: 8,
            paddingBottom: 8
          },
          tabBarShowLabel: false
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabBarIcon name="pie-chart" color={color} />
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          href: null, // Hide from tab bar
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />
        }}
      />

      {/* v2: Price Tracker - hidden for v1 release */}
      <Tabs.Screen
        name="price-tracker"
        options={{
          href: null, // Hidden for v1
        }}
      />
    </Tabs>
    </View>
  )
}
