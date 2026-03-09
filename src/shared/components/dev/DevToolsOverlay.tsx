import { APP_CONFIG } from '@/config'
import {
  resetDbHardDropAllTables,
  seedDbMinimal,
} from '@/infrastructure/db/queries/admin'
import { migrate } from '@/infrastructure/db/migrate'
import { exportDatabase } from '@/infrastructure/db/queries/export-db'
import { runFixtures, runSystemSeeds, seedNotificationsStandalone, clearNotificationsStandalone, seedDraftsStandalone, clearDraftsStandalone } from '@/infrastructure/db/seed'
import { useDraftsStore } from '@/store'

import { useHoHTheme } from '@/providers'
import { useDevStore } from '@/store'
import { fontSize, fontWeight, letterSpacing } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'
import React, { useMemo, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function DevToolsOverlay() {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const [open, setOpen] = useState(false)
  const devToolsVisible = useDevStore((s) => s.devToolsVisible)

  const colors = useMemo(
    () => ({
      border: theme.semantic.border,
      surface: theme.semantic.surface,
      bg: theme.semantic.background,
      text: theme.semantic.text,
      text2: theme.semantic.textSecondary,
    }),
    [theme]
  )

  if (!APP_CONFIG.featureFlags.devTools || !devToolsVisible) return null

  const seedAll = () => {
    try {
      runFixtures('seed', ['accounts', 'transactions', 'notifications', 'suggestions', 'assets'])
      Alert.alert('Done', 'All fixtures seeded')
    } catch (e: any) {
      Alert.alert('Failed', String(e?.message ?? e))
    }
  }

  const clearAll = () => {
    try {
      runFixtures('delete', ['accounts', 'transactions', 'notifications', 'suggestions', 'assets'])
      Alert.alert('Done', 'All fixtures cleared')
    } catch (e: any) {
      Alert.alert('Failed', String(e?.message ?? e))
    }
  }

  const resetDb = () => {
    Alert.alert('Reset DB?', 'Drop all tables and recreate schema', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          try {
            resetDbHardDropAllTables()
            migrate()
            runSystemSeeds() // Seed categories, accounts, tags
            runFixtures('seed', ['accounts', 'transactions', 'notifications', 'suggestions', 'assets'])
            Alert.alert('Done', 'DB reset & all fixtures seeded')
          } catch (e: any) {
            Alert.alert('Failed', String(e?.message ?? e))
          }
        },
      },
    ])
  }

  const seedDb = () => {
    seedDbMinimal()
    Alert.alert('Done', 'DB seeded')
  }

  const seedNotifs = () => {
    try {
      const count = seedNotificationsStandalone()
      Alert.alert('Done', `${count} notifications seeded`)
    } catch (e: any) {
      Alert.alert('Failed', String(e?.message ?? e))
    }
  }

  const clearNotifs = () => {
    try {
      const count = clearNotificationsStandalone()
      Alert.alert('Done', `${count} notifications cleared`)
    } catch (e: any) {
      Alert.alert('Failed', String(e?.message ?? e))
    }
  }

  const loadDrafts = useDraftsStore((s) => s.loadDrafts)

  const seedDrafts = () => {
    try {
      const count = seedDraftsStandalone()
      loadDrafts() // Reload store from DB
      Alert.alert('Done', `${count} drafts seeded`)
    } catch (e: any) {
      Alert.alert('Failed', String(e?.message ?? e))
    }
  }

  const clearDrafts = () => {
    try {
      const count = clearDraftsStandalone()
      loadDrafts() // Reload store from DB
      Alert.alert('Done', `${count} drafts cleared`)
    } catch (e: any) {
      Alert.alert('Failed', String(e?.message ?? e))
    }
  }

  const top = Math.max(8, insets.top + 6)
  const left = Math.max(8, insets.left + 8)

  return (
    <View pointerEvents="box-none" style={[styles.root, { top, left }]}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
        hitSlop={10}
      >
        <Text style={[styles.chipText, { color: colors.text }]}>DEV {open ? '▾' : '▸'}</Text>
      </Pressable>

      {open && (
        <View style={[styles.body, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <DevBtn label="Seed All" onPress={seedAll} colors={colors} />
            <DevBtn label="Clear All" onPress={clearAll} colors={colors} />
          </View>
          <View style={styles.row}>
            <DevBtn label="Seed Notifs" onPress={seedNotifs} colors={colors} />
            <DevBtn label="Clear Notifs" onPress={clearNotifs} colors={colors} />
          </View>
          <View style={styles.row}>
            <DevBtn label="Seed Drafts" onPress={seedDrafts} colors={colors} />
            <DevBtn label="Clear Drafts" onPress={clearDrafts} colors={colors} />
          </View>
          <View style={styles.row}>
            <DevBtn label="Reset DB" onPress={resetDb} colors={colors} />
            <DevBtn label="Seed DB" onPress={seedDb} colors={colors} />
          </View>
          <View style={styles.row}>
            <DevBtn label="Export" onPress={exportDatabase} colors={colors} />
            <Pressable onPress={() => setOpen(false)} style={[styles.btn, { borderColor: colors.border, backgroundColor: colors.bg }]}>
              <Text style={{ color: colors.text2, fontWeight: fontWeight.bold, fontSize: fontSize.xs }}>Close</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  )
}

function DevBtn({
  label,
  onPress,
  colors,
}: {
  label: string
  onPress: () => void
  colors: { border: string; bg: string; text: string }
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.btn, { borderColor: colors.border, backgroundColor: colors.bg }]}
    >
      <Text style={{ color: colors.text, fontWeight: fontWeight.bold, fontSize: fontSize.xs }}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    zIndex: 9999,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: radius.full,
  },
  chipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    letterSpacing: letterSpacing.wide,
  },
  body: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 6,
    width: 220,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    marginVertical: 3,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
  },
})
