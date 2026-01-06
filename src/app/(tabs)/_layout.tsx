import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, Tabs } from 'expo-router'
import React from 'react'

import { useHoHTheme } from '@/providers'
import { Pressable, Text, View } from 'react-native'

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name']
  color: string
}) {
  return <FontAwesome size={20} style={{ marginBottom: -3 }} {...props} />
}

/******************************************* */
/*             PROFILE BUTTON                  */
/******************************************* */

function ProfileButton() {
  const theme = useHoHTheme()

  const onPress = () => {
    // MVP용 action sheet 대체
    // iOS에서도 Alert 버튼들이 액션 시트처럼 뜨는 편이야
    // 더 예쁜 바텀시트는 Day 3에
    // eslint-disable-next-line no-alert
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

/******************************************* */
/*             CENTER ADD                    */
/******************************************* */

function CenterAddButton() {
  const theme = useHoHTheme()

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Pressable
        onPress={() => router.push('/add')}
        hitSlop={12}
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: theme.semantic.primary,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ translateY: -14 }],

          // iOS shadow
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 6 },

          // Android shadow
          elevation: 6,
        }}
      >
        <FontAwesome name="plus" size={22} color={theme.semantic.background} />
      </Pressable>
    </View>
  )
}

/******************************************* */
/*                  TABS                     */
/******************************************* */

export default function TabLayout() {
  const theme = useHoHTheme()
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: true,
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
          name="index"
          options={{
            title: 'dashboard',
            headerTitle: 'Dashboard',
            tabBarIcon: ({ color }) => <TabBarIcon name="th-large" color={color} />
          }}
        />
         <Tabs.Screen
          name="_add"
          options={{
            title: '',
            headerShown: false,
            // tabBarIcon: ({ color }) => <TabBarIcon name="plus" color={color} />
            tabBarIcon: () => null,
            tabBarButton: () => <CenterAddButton />
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'transactions',
            headerTitle: 'Transactions',
            tabBarIcon: ({ color }) => <TabBarIcon name="files-o" color={color} />
          }}
        />
      </Tabs>
    </View>
  )
}
