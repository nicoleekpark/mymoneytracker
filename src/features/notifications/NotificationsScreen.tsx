/**
 * NotificationsScreen
 *
 * Phase 1: System notifications only with tabs: All, Unread
 * Compact single-line rows with time groupings.
 */

import type { Notification, NotificationTab, TimeGroup } from '@/core/domain/notification'
import { TIME_GROUP_LABELS, NOTIFICATION_TABS } from '@/core/domain/notification'
import { useHoHTheme } from '@/shared/providers'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { useNotificationsStore } from '@/shared/store'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function NotificationsScreen() {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState<NotificationTab>('all')

  // Store
  const notifications = useNotificationsStore((s) => s.notifications)
  const isLoaded = useNotificationsStore((s) => s.isLoaded)
  const loadNotifications = useNotificationsStore((s) => s.loadNotifications)
  const markAsRead = useNotificationsStore((s) => s.markAsRead)
  const dismissNotification = useNotificationsStore((s) => s.dismissNotification)
  const getUnread = useNotificationsStore((s) => s.getUnread)

  // Load notifications from SQLite on mount
  useEffect(() => {
    if (!isLoaded) {
      loadNotifications()
    }
  }, [isLoaded, loadNotifications])

  // Tab configuration with counts
  const tabs = useMemo(() => {
    const unreadCount = getUnread().length
    return NOTIFICATION_TABS.map((tab) => ({
      ...tab,
      count: tab.key === 'unread' ? unreadCount : undefined,
    }))
  }, [getUnread, notifications])

  // Filter notifications based on active tab
  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return getUnread()
      case 'all':
      default:
        return notifications
    }
  }, [activeTab, notifications, getUnread])

  // Helper to group items by time
  const groupByTime = (items: Notification[]): Record<TimeGroup, Notification[]> => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const groups: Record<TimeGroup, Notification[]> = {
      today: [],
      yesterday: [],
      last7days: [],
      last30days: [],
      older: [],
    }

    items.forEach((item) => {
      const date = new Date(item.createdAt)
      if (date >= today) {
        groups.today.push(item)
      } else if (date >= yesterday) {
        groups.yesterday.push(item)
      } else if (date >= last7Days) {
        groups.last7days.push(item)
      } else if (date >= last30Days) {
        groups.last30days.push(item)
      } else {
        groups.older.push(item)
      }
    })

    return groups
  }

  // Group notifications by time
  const groupedNotifications = useMemo(() => {
    return groupByTime(filteredItems)
  }, [filteredItems])

  // Format relative time
  const formatTime = (timestamp: string): string => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Get icon for notification subtype
  const getIcon = (notification: Notification): { name: string; color: string } => {
    switch (notification.subtype) {
      case 'draft_reminder':
        return { name: 'file-text-o', color: theme.semantic.warning }
      case 'budget_alert':
        return { name: 'exclamation-triangle', color: theme.semantic.danger }
      case 'inactivity_nudge':
        return { name: 'clock-o', color: theme.semantic.textSecondary }
      case 'anomaly_detected':
        return { name: 'question-circle', color: theme.semantic.warning }
      default:
        return { name: 'bell-o', color: theme.semantic.textSecondary }
    }
  }

  // Handle notification tap
  const handleNotificationTap = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    // TODO: Navigate to related content based on subtype
  }

  // Handle swipe to dismiss
  const handleDismiss = (notification: Notification) => {
    dismissNotification(notification.id)
  }

  // Render icon
  const renderIcon = (notification: Notification) => {
    const icon = getIcon(notification)
    return (
      <View style={[styles.iconContainer, { backgroundColor: theme.semantic.surfaceAlt }]}>
        <FontAwesome name={icon.name as any} size={14} color={icon.color} />
      </View>
    )
  }

  // Render notification row
  const renderNotificationRow = (notification: Notification) => (
    <Pressable
      key={notification.id}
      onPress={() => handleNotificationTap(notification)}
      onLongPress={() => handleDismiss(notification)}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: theme.semantic.surfaceAlt },
      ]}
    >
      {renderIcon(notification)}
      <View style={styles.rowContent}>
        <Text
          style={[
            styles.rowTitle,
            { color: theme.semantic.text },
            !notification.read && styles.rowTitleUnread,
          ]}
          numberOfLines={1}
        >
          {notification.title}
        </Text>
        <Text
          style={[styles.rowMessage, { color: theme.semantic.textSecondary }]}
          numberOfLines={1}
        >
          {notification.message}
        </Text>
      </View>
      <View style={styles.rowRight}>
        {!notification.read && (
          <View style={[styles.unreadDot, { backgroundColor: theme.semantic.danger }]} />
        )}
        <Text style={[styles.rowTime, { color: theme.semantic.textSecondary }]}>
          {formatTime(notification.createdAt)}
        </Text>
      </View>
    </Pressable>
  )

  // Render time group section
  const renderTimeGroup = (group: TimeGroup, items: Notification[]) => {
    if (items.length === 0) return null

    return (
      <View key={group} style={styles.section}>
        <Text style={[styles.sectionHeader, { color: theme.semantic.textSecondary }]}>
          {TIME_GROUP_LABELS[group]}
        </Text>
        {items.map(renderNotificationRow)}
      </View>
    )
  }

  // Check if there are any notifications
  const hasNotifications = filteredItems.length > 0

  return (
    <View style={[styles.container, { backgroundColor: theme.semantic.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={16} color={theme.semantic.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.semantic.text }]}>
          Notifications
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: theme.semantic.border }]}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tab,
                { borderBottomColor: isActive ? theme.semantic.primary : 'transparent' },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? theme.semantic.text : theme.semantic.textSecondary,
                    fontWeight: isActive ? '600' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
              {tab.count !== undefined && tab.count > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.semantic.danger }]}>
                  <Text style={[styles.badgeText, { color: '#fff' }]}>{tab.count}</Text>
                </View>
              )}
            </Pressable>
          )
        })}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {hasNotifications ? (
          <>
            {renderTimeGroup('today', groupedNotifications.today)}
            {renderTimeGroup('yesterday', groupedNotifications.yesterday)}
            {renderTimeGroup('last7days', groupedNotifications.last7days)}
            {renderTimeGroup('last30days', groupedNotifications.last30days)}
            {renderTimeGroup('older', groupedNotifications.older)}
          </>
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome
              name="bell-o"
              size={48}
              color={theme.semantic.textSecondary}
              style={{ opacity: 0.5, marginBottom: spacing.lg }}
            />
            <Text style={[styles.emptyTitle, { color: theme.semantic.text }]}>
              No notifications
            </Text>
            <Text style={[styles.emptyText, { color: theme.semantic.textSecondary }]}>
              {activeTab === 'unread'
                ? "You're all caught up!"
                : "Notifications will appear here"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

// Component-specific sizes
const HEADER_BUTTON_SIZE = 32
const BADGE_MIN_SIZE = 18
const ICON_CONTAINER_SIZE = 32
const UNREAD_DOT_SIZE = 6

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: HEADER_BUTTON_SIZE,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  headerSpacer: {
    width: HEADER_BUTTON_SIZE,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 2,
    marginBottom: -1,
    gap: spacing.sm,
  },
  tabText: {
    fontSize: fontSize.md,
  },
  badge: {
    minWidth: BADGE_MIN_SIZE,
    height: BADGE_MIN_SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingTop: spacing.lg,
  },
  sectionHeader: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.wider,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  iconContainer: {
    width: ICON_CONTAINER_SIZE,
    height: ICON_CONTAINER_SIZE,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: fontSize.md,
  },
  rowTitleUnread: {
    fontWeight: fontWeight.semibold,
  },
  rowMessage: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
  },
  unreadDot: {
    width: UNREAD_DOT_SIZE,
    height: UNREAD_DOT_SIZE,
    borderRadius: radius.xs,
  },
  rowTime: {
    fontSize: fontSize.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
})
