import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, Tabs } from 'expo-router'
import React from 'react'

import { useHoHTheme } from '@/providers'

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={20} style={{ marginBottom: -3 }} {...props} />
}

export default function TabLayout() {
  const theme = useHoHTheme()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.semantic.primary,
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
          title: 'dashboard',
          tabBarIcon: ({ color }) => <TabBarIcon name="th-large" color={color} />
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: () => <FontAwesome name="plus-circle" size={26} color={theme.semantic.primary as any} />
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault()
            router.push('/(modal)/add-transaction' as any)
          }
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: 'transactions',
          tabBarIcon: ({ color }) => <TabBarIcon name="files-o" color={color} />
        }}
      />
    </Tabs>
  )
}
