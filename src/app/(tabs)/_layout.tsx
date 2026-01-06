import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Tabs } from 'expo-router'
import React from 'react'

import { DevToolsFlagCheck } from '@/components/dev/DevToolsFlagCheck'
import { DevToolsOverlay } from '@/components/dev/DevToolsOverlay'
import { APP_CONFIG } from '@/config'
import { useHoHTheme } from '@/providers'
import { useColorScheme, View } from 'react-native'

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name']
  color: string
}) {
  return <FontAwesome size={20} style={{ marginBottom: -3 }} {...props} />
}

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const theme = useHoHTheme()
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.semantic.background
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: theme.semantic.text
          },
          tabBarActiveTintColor: theme.semantic.primary,
          tabBarInactiveTintColor: theme.semantic.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.semantic.background
          },
          // tabBarLabelStyle: {
          //   fontSize: 12,
          //   fontWeight: '600',
          // },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'dashboard',
            headerTitle: 'Dashboard',
            tabBarIcon: ({ color }) => <TabBarIcon name="th-large" color={color} />
          }}
        />
        {/* <Tabs.Screen
          name="cashflow"
          options={{
            title: 'Cashflow',
            headerTitle: 'Cashflow',
            tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart-o" color={color} />
          }}
        /> */}
        {/* <Tabs.Screen
          name="accounts"
          options={{
            title: 'Accounts',
            headerTitle: 'Accounts',
            tabBarIcon: ({ color }) => <TabBarIcon name="bank" color={color} />
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: 'Categories',
            headerTitle: 'Categories',
            tabBarIcon: ({ color }) => <TabBarIcon name="tag" color={color} />
          }}
        /> */}
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'transactions',
            headerTitle: 'Transactions',
            tabBarIcon: ({ color }) => <TabBarIcon name="files-o" color={color} />
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: 'add transaction',
            // headerTitle: 'Add Transaction',
            tabBarIcon: ({ color }) => <TabBarIcon name="plus" color={color} />
          }}
        />
      </Tabs>
      {APP_CONFIG.featureFlags.devTools && <DevToolsOverlay />}
      <DevToolsFlagCheck />
    </View>
  )
}
