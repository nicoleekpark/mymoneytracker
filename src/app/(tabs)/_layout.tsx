import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, Tabs } from 'expo-router'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

import AddTransactionModal from '@/features/transactions/AddTransactionModal'
import { useHoHTheme } from '@/providers'
import { useAppStore } from '@/store/app.store'

export const unstable_settings = {
  initialRouteName: 'dashboard'
}

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={20} style={{ marginBottom: -3 }} {...props} />
}

function ProfileButton() {
  const theme = useHoHTheme()

  const onPress = () => {
    const Alert = require('react-native').Alert as typeof import('react-native').Alert
    Alert.alert('Menu', undefined, [
      { text: 'Settings', onPress: () => router.push('/settings') },
      { text: 'Cancel', style: 'cancel' }
    ])
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.semantic.surface,
        borderWidth: 1,
        borderColor: theme.semantic.border,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Text style={{ color: theme.semantic.text, fontSize: 12 }}>NP</Text>
    </Pressable>
  )
}

export default function TabLayout() {
  const theme = useHoHTheme()

  const isOpen = useAppStore((s) => s.isAddTransactionOpen)
  const openAddTx = useAppStore((s) => s.openAddTransactionModal)
  const closeAddTx = useAppStore((s) => s.closeAddTransactionModal)

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: theme.semantic.background },
          headerTitleStyle: { fontWeight: 'bold', color: theme.semantic.text },
          headerRight: () => <ProfileButton />,
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
          name="dashboard/index"
          options={{
            title: 'dashboard',
            tabBarIcon: ({ color }) => <TabBarIcon name="th-large" color={color} />
          }}
        />

        <Tabs.Screen
          name="add"
          options={{
            title: '',
            tabBarIcon: () => (
              <FontAwesome name="plus-circle" size={26} color={theme.semantic.primary as any} />
            )
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault()
              openAddTx()
            }
          }}
        />

        <Tabs.Screen
          name="transactions/index"
          options={{
            title: 'transactions',
            headerTitle: 'Transactions',
            tabBarIcon: ({ color }) => <TabBarIcon name="files-o" color={color} />
          }}
        />
      </Tabs>

      <AddTransactionModal visible={isOpen} onClose={closeAddTx} />
    </View>
  )
}
