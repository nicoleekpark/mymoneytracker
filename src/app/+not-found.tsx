import { useHoHTheme } from '@/providers'
import { Link, Stack } from 'expo-router'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function NotFoundScreen() {
  const theme = useHoHTheme()
  const styles = useMemo(() => createStyles(theme), [theme])

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container]}>
        <Text style={[styles.title]}>
          This screen doesn't exist.
        </Text>

        <Link href="/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  )
}

function createStyles(theme: ReturnType<typeof useHoHTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: theme.semantic.background
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.semantic.text
    },
    link: {
      marginTop: 15,
      paddingVertical: 15
    },
    linkText: {
      fontSize: 14,
      color: theme.semantic.primary
    }
  })
}
