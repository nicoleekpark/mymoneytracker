import { FEATURE_FLAGS } from '@/config'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native'

import { useHoHTheme } from '@/providers'
import { useDevStore, useDraftsStore, useNotificationsStore } from '@/store'
import { textStyles } from '@/theme/tokens/typography'

type AppBarProps = {
  /** User initials to display in avatar */
  userInitials?: string
}

export function AppBar({ userInitials = 'NP' }: AppBarProps) {
  const theme = useHoHTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  // Get notification and draft counts
  const unreadCount = useNotificationsStore((s) => s.getUnreadCount())
  const draftCount = useDraftsStore((s) => s.drafts.length)
  const hasNotifications = unreadCount > 0 || draftCount > 0

  // Dev tools toggle
  const toggleDevTools = useDevStore((s) => s.toggleDevTools)

  const handleLogoPress = () => {
    if (!FEATURE_FLAGS.devTools) return
    toggleDevTools()
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
        // TODO: Open search
        break
      case 'messages':
        // TODO: Open messages (v2)
        break
      case 'settings':
        router.push('/settings')
        break
      case 'signout':
        // TODO: Sign out
        break
    }
  }

  return (
    <>
      <View style={[styles.container, { borderBottomColor: theme.semantic.border }]}>
        {/* Logo - tap to toggle dev tools */}
        <Pressable
          onPress={handleLogoPress}
          hitSlop={8}
        >
          <Text style={[styles.logo, { color: theme.semantic.text }]}>HoH</Text>
        </Pressable>

        {/* Actions */}
        <View style={styles.actions}>
          {/* Bell */}
          <Pressable
            onPress={handleBellPress}
            style={styles.iconBtn}
            hitSlop={8}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
          >
            <FontAwesome name="bell-o" size={20} color={theme.semantic.textSecondary} />
            {hasNotifications && (
              <View style={[styles.dot, { backgroundColor: theme.semantic.danger }]} />
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
            hitSlop={4}
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
            <MenuItem
              icon="search"
              label="Search"
              onPress={() => handleMenuAction('search')}
              theme={theme}
            />
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
            <MenuItem
              icon="sign-out"
              label="Sign out"
              onPress={() => handleMenuAction('signout')}
              theme={theme}
            />
          </View>
        </Pressable>
      </Modal>
    </>
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
          <Text style={styles.menuBadgeText}>{badge}</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    height: 56,
  },
  logo: {
    ...textStyles.screenHeader,
    letterSpacing: -0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menu: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 200,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  menuDivider: {
    height: 1,
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  menuItemLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  menuItemBadge: {
    fontSize: 11,
    fontWeight: '500',
  },
  menuBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  menuBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
})
