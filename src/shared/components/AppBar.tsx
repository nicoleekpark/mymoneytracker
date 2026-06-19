import { APP_CONFIG, FEATURE_FLAGS } from '@/shared/config'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native'

import {
  resetDbHardDropAllTables,
  seedDbMinimal,
} from '@/infrastructure/db/queries/admin'
import { migrate } from '@/infrastructure/db/migrate'
import { exportDatabase } from '@/infrastructure/db/queries/export-db'
import { runFixtures, runSystemSeeds, seedNotificationsStandalone, clearNotificationsStandalone, seedDraftsStandalone, clearDraftsStandalone } from '@/infrastructure/db/seed'
import { useHoHTheme } from '@/shared/providers'
import { useDevStore, useDraftsStore, useNotificationsStore } from '@/shared/store'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { BACKDROP } from '@/shared/theme/tokens/backdrop'
import { HIT_SLOP_LG, HIT_SLOP_MD, HIT_SLOP_MD_VALUE, OPACITY_PRESSED } from '@/shared/theme/tokens/buttons'

// Component-specific sizes (not in global tokens)
const APPBAR_HEIGHT = 56
const ICON_BUTTON_SIZE = 40
const AVATAR_SIZE = 32
const MENU_WIDTH = 200
const MENU_TOP_OFFSET = 60

type AppBarProps = {
  /** User initials to display in avatar */
  userInitials?: string
}

export function AppBar({ userInitials = 'NP' }: AppBarProps) {
  const theme = useHoHTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [devMenuOpen, setDevMenuOpen] = useState(false)

  // Get notification count
  const unreadCount = useNotificationsStore((s) => s.getUnreadCount())
  const hasNotifications = unreadCount > 0

  // Get draft count
  const draftCount = useDraftsStore((s) => s.drafts.length)
  const hasDrafts = draftCount > 0

  // Dev tools
  const devToolsVisible = useDevStore((s) => s.devToolsVisible)
  const toggleDevTools = useDevStore((s) => s.toggleDevTools)
  const loadDrafts = useDraftsStore((s) => s.loadDrafts)
  const showDevChip = APP_CONFIG.featureFlags.devTools && devToolsVisible

  const handleAddPress = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- expo-router modal route type limitation
    router.push('/(modal)/add-transaction' as any)
  }

  const handleDevToggle = () => {
    // Hidden: tap center area to toggle dev tools visibility
    if (!FEATURE_FLAGS.devTools) return
    toggleDevTools()
  }

  // Dev tools actions
  const seedAll = () => {
    try {
      runFixtures('seed', ['accounts', 'transactions', 'notifications', 'suggestions', 'assets'])
      Alert.alert('Done', 'All fixtures seeded')
    } catch (e: unknown) {
      Alert.alert('Failed', e instanceof Error ? e.message : String(e))
    }
    setDevMenuOpen(false)
  }

  const clearAll = () => {
    try {
      runFixtures('delete', ['accounts', 'transactions', 'notifications', 'suggestions', 'assets'])
      Alert.alert('Done', 'All fixtures cleared')
    } catch (e: unknown) {
      Alert.alert('Failed', e instanceof Error ? e.message : String(e))
    }
    setDevMenuOpen(false)
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
            runSystemSeeds()
            runFixtures('seed', ['accounts', 'transactions', 'notifications', 'suggestions', 'assets'])
            Alert.alert('Done', 'DB reset & all fixtures seeded')
          } catch (e: unknown) {
            Alert.alert('Failed', e instanceof Error ? e.message : String(e))
          }
          setDevMenuOpen(false)
        },
      },
    ])
  }

  const seedDb = () => {
    seedDbMinimal()
    Alert.alert('Done', 'DB seeded')
    setDevMenuOpen(false)
  }

  const seedNotifs = () => {
    try {
      const count = seedNotificationsStandalone()
      Alert.alert('Done', `${count} notifications seeded`)
    } catch (e: unknown) {
      Alert.alert('Failed', e instanceof Error ? e.message : String(e))
    }
    setDevMenuOpen(false)
  }

  const clearNotifs = () => {
    try {
      const count = clearNotificationsStandalone()
      Alert.alert('Done', `${count} notifications cleared`)
    } catch (e: unknown) {
      Alert.alert('Failed', e instanceof Error ? e.message : String(e))
    }
    setDevMenuOpen(false)
  }

  const seedDrafts = () => {
    try {
      const count = seedDraftsStandalone()
      loadDrafts()
      Alert.alert('Done', `${count} drafts seeded`)
    } catch (e: unknown) {
      Alert.alert('Failed', e instanceof Error ? e.message : String(e))
    }
    setDevMenuOpen(false)
  }

  const clearDrafts = () => {
    try {
      const count = clearDraftsStandalone()
      loadDrafts()
      Alert.alert('Done', `${count} drafts cleared`)
    } catch (e: unknown) {
      Alert.alert('Failed', e instanceof Error ? e.message : String(e))
    }
    setDevMenuOpen(false)
  }

  const handleExport = () => {
    exportDatabase()
    setDevMenuOpen(false)
  }

  const handleDraftsPress = () => {
    // Use replace instead of push to ensure params update even when already on transactions page
    router.replace({ pathname: '/transactions', params: { showDrafts: 'only' } })
  }

  const handleBellPress = () => {
    router.push('/notifications')
  }

  const handleAvatarPress = () => {
    setMenuOpen(true)
  }

  const handleMenuClose = () => {
    setMenuOpen(false)
  }

  const handleMenuAction = (action: string) => {
    setMenuOpen(false)
    switch (action) {
      case 'search':
        // v2: Open search
        break
      case 'messages':
        // v2: Open messages
        break
      case 'settings':
        router.push('/settings')
        break
      case 'signout':
        // v2: Sign out
        break
    }
  }

  return (
    <>
      <View style={[styles.container, { borderBottomColor: theme.semantic.border }]}>
        {/* Add button - 44pt minimum touch target (Apple HIG) */}
        <Pressable
          onPress={handleAddPress}
          hitSlop={HIT_SLOP_LG}
          style={({ pressed }) => [
            styles.addButton,
            { opacity: pressed ? OPACITY_PRESSED : 1 }
          ]}
        >
          <FontAwesome name="plus" size={20} color={theme.semantic.text} />
        </Pressable>

        {/* Center: tap to toggle dev tools, or open menu if already enabled */}
        <Pressable
          onPress={() => {
            if (devToolsVisible) {
              setDevMenuOpen(true)
            } else {
              handleDevToggle()
            }
          }}
          style={styles.centerTouch}
          hitSlop={16}
        />

        {/* Actions */}
        <View style={styles.actions}>
          {/* Drafts */}
          {hasDrafts && (
            <Pressable
              onPress={handleDraftsPress}
              style={styles.iconBtn}
              hitSlop={HIT_SLOP_LG}
              accessibilityLabel={`${draftCount} drafts`}
              accessibilityRole="button"
            >
              <FontAwesome name="pencil-square-o" size={20} color={theme.semantic.warning} />
              <View style={[styles.badge, { backgroundColor: theme.semantic.warning }]} pointerEvents="none">
                <Text style={[styles.badgeText, { color: theme.semantic.onWarning }]}>{draftCount}</Text>
              </View>
            </Pressable>
          )}

          {/* Bell */}
          <Pressable
            onPress={handleBellPress}
            style={styles.iconBtn}
            hitSlop={HIT_SLOP_LG}
            accessibilityLabel={hasNotifications ? `${unreadCount} notifications` : 'Notifications'}
            accessibilityRole="button"
          >
            <FontAwesome
              name="bell-o"
              size={20}
              color={hasNotifications ? theme.semantic.danger : theme.semantic.textSecondary}
            />
            {hasNotifications && (
              <View style={[styles.badge, { backgroundColor: theme.semantic.danger }]} pointerEvents="none">
                <Text style={[styles.badgeText, { color: theme.semantic.onDanger }]}>{unreadCount}</Text>
              </View>
            )}
          </Pressable>

          {/* Avatar */}
          <Pressable
            onPress={handleAvatarPress}
            style={[
              styles.avatar,
              {
                backgroundColor: theme.semantic.surface,
                borderColor: menuOpen ? theme.semantic.primary : theme.semantic.border
              }
            ]}
            hitSlop={HIT_SLOP_MD}
            accessibilityLabel="Open menu"
            accessibilityRole="button"
          >
            <Text style={[styles.avatarText, { color: theme.semantic.textSecondary }]}>
              {userInitials}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={handleMenuClose}
      >
        <Pressable style={styles.overlay} onPress={handleMenuClose}>
          <View
            style={[
              styles.menu,
              {
                backgroundColor: theme.semantic.surface,
                borderColor: theme.semantic.border
              }
            ]}
          >
            {/* v2: Search disabled for v1 */}
            <MenuItem
              icon="search"
              label="Search"
              onPress={() => handleMenuAction('search')}
              theme={theme}
              disabled
            />
            {/* v2: Messages disabled for v1 */}
            <MenuItem
              icon="comment-o"
              label="Messages"
              badge={0}
              onPress={() => handleMenuAction('messages')}
              theme={theme}
              disabled
            />
            <View style={[styles.menuDivider, { backgroundColor: theme.semantic.border }]} />
            <MenuItem
              icon="cog"
              label="Settings"
              onPress={() => handleMenuAction('settings')}
              theme={theme}
            />
          </View>
        </Pressable>
      </Modal>

      {/* Dev Tools Modal */}
      <Modal
        visible={devMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDevMenuOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setDevMenuOpen(false)}>
          <View
            style={[
              styles.devMenu,
              {
                backgroundColor: theme.semantic.surface,
                borderColor: theme.semantic.border
              }
            ]}
          >
            <View style={styles.devRow}>
              <DevBtn label="Seed All" onPress={seedAll} theme={theme} />
              <DevBtn label="Clear All" onPress={clearAll} theme={theme} />
            </View>
            <View style={styles.devRow}>
              <DevBtn label="Seed Notifs" onPress={seedNotifs} theme={theme} />
              <DevBtn label="Clear Notifs" onPress={clearNotifs} theme={theme} />
            </View>
            <View style={styles.devRow}>
              <DevBtn label="Seed Drafts" onPress={seedDrafts} theme={theme} />
              <DevBtn label="Clear Drafts" onPress={clearDrafts} theme={theme} />
            </View>
            <View style={styles.devRow}>
              <DevBtn label="Reset DB" onPress={resetDb} theme={theme} />
              <DevBtn label="Seed DB" onPress={seedDb} theme={theme} />
            </View>
            <View style={styles.devRow}>
              <DevBtn label="Export" onPress={handleExport} theme={theme} />
              <Pressable
                onPress={() => setDevMenuOpen(false)}
                style={[styles.devBtn, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.background }]}
              >
                <Text style={{ color: theme.semantic.textSecondary, fontWeight: fontWeight.bold, fontSize: fontSize.xs }}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

function DevBtn({
  label,
  onPress,
  theme,
}: {
  label: string
  onPress: () => void
  theme: ReturnType<typeof useHoHTheme>
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.devBtn, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.background }]}
    >
      <Text style={{ color: theme.semantic.text, fontWeight: fontWeight.bold, fontSize: fontSize.xs }}>{label}</Text>
    </Pressable>
  )
}

type MenuItemProps = {
  icon: React.ComponentProps<typeof FontAwesome>['name']
  label: string
  badge?: number
  onPress: () => void
  theme: ReturnType<typeof useHoHTheme>
  disabled?: boolean
}

function MenuItem({ icon, label, badge, onPress, theme, disabled }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && { backgroundColor: theme.semantic.surfaceAlt }
      ]}
    >
      <FontAwesome
        name={icon}
        size={18}
        color={disabled ? theme.semantic.border : theme.semantic.textSecondary}
      />
      <Text
        style={[
          styles.menuItemLabel,
          { color: disabled ? theme.semantic.textSecondary : theme.semantic.text }
        ]}
      >
        {label}
      </Text>
      {disabled && (
        <Text style={[styles.menuItemBadge, { color: theme.semantic.textSecondary }]}>v2</Text>
      )}
      {badge !== undefined && badge > 0 && (
        <View style={[styles.menuBadge, { backgroundColor: theme.semantic.danger }]}>
          <Text style={[styles.menuBadgeText, { color: theme.semantic.onPrimary }]}>{badge}</Text>
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, // 16px - matches Screen default
    paddingVertical: spacing.md,
    height: APPBAR_HEIGHT,
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTouch: {
    flex: 1,
    height: APPBAR_HEIGHT,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconBtn: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  avatarText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  overlay: {
    flex: 1,
    backgroundColor: BACKDROP.light,
  },
  menu: {
    position: 'absolute',
    top: MENU_TOP_OFFSET,
    right: spacing.xl,
    width: MENU_WIDTH,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  menuDivider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + spacing.xs / 2, // 10
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  menuItemLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    flex: 1,
  },
  menuItemBadge: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  menuBadge: {
    paddingHorizontal: spacing.sm - spacing.xs / 2, // 6
    paddingVertical: spacing.xs / 2, // 2
    borderRadius: radius.md,
  },
  menuBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  // Dev tools styles
  devChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: radius.full,
  },
  devChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    letterSpacing: letterSpacing.wide,
  },
  devMenu: {
    position: 'absolute',
    top: MENU_TOP_OFFSET,
    left: spacing.xl,
    width: 220,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  devRow: {
    flexDirection: 'row',
    gap: 6,
  },
  devBtn: {
    flex: 1,
    paddingVertical: 8,
    marginVertical: 3,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
  },
})
