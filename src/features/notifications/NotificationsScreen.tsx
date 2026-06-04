/**
 * NotificationsScreen
 *
 * Phase 1: System notifications with tabs: All, Unread, Drafts
 * Drafts tab separates draft reminders from system notifications.
 */

import type { Notification, NotificationTab, TimeGroup } from '@/core/domain/notification'
import { TIME_GROUP_LABELS, NOTIFICATION_TABS } from '@/core/domain/notification'
import { useHoHTheme } from '@/shared/providers'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { useNotificationsStore, useDraftsStore, type DraftTransaction } from '@/shared/store'
import { formatCurrency } from '@/shared/format/currency'
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

// Draft time groupings (for displaying actual drafts)
type DraftTimeGroup = 'today' | 'thisWeek' | 'older'
const DRAFT_TIME_LABELS: Record<DraftTimeGroup, string> = {
  today: 'Today',
  thisWeek: 'This Week',
  older: 'Older',
}

export default function NotificationsScreen() {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState<NotificationTab>('all')

  // Notifications store
  const notifications = useNotificationsStore((s) => s.notifications)
  const isLoaded = useNotificationsStore((s) => s.isLoaded)
  const loadNotifications = useNotificationsStore((s) => s.loadNotifications)
  const markAsRead = useNotificationsStore((s) => s.markAsRead)
  const dismissNotification = useNotificationsStore((s) => s.dismissNotification)

  // Drafts store - for actual draft count
  const actualDrafts = useDraftsStore((s) => s.drafts)
  const draftsLoaded = useDraftsStore((s) => s.isLoaded)
  const loadDrafts = useDraftsStore((s) => s.loadDrafts)

  // Load notifications and drafts on mount
  useEffect(() => {
    if (!isLoaded) {
      loadNotifications()
    }
    if (!draftsLoaded) {
      loadDrafts()
    }
  }, [isLoaded, loadNotifications, draftsLoaded, loadDrafts])

  // Separate draft reminders from other notifications
  const { draftReminders, systemNotifications } = useMemo(() => {
    const drafts: Notification[] = []
    const system: Notification[] = []

    notifications.forEach((n) => {
      if (n.subtype === 'draft_reminder') {
        drafts.push(n)
      } else {
        system.push(n)
      }
    })

    return { draftReminders: drafts, systemNotifications: system }
  }, [notifications])

  // Tab configuration with counts
  const tabs = useMemo(() => {
    const unreadCount = systemNotifications.filter((n) => !n.read).length
    // Use actual draft count from drafts store, not draft reminder notifications
    const draftCount = actualDrafts.length

    return NOTIFICATION_TABS.map((tab) => ({
      ...tab,
      count: tab.key === 'unread' ? unreadCount : tab.key === 'drafts' ? draftCount : undefined,
      isWarning: tab.key === 'drafts', // Use warning color for drafts badge
    }))
  }, [systemNotifications, actualDrafts])

  // Filter notifications based on active tab
  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return systemNotifications.filter((n) => !n.read)
      case 'drafts':
        return draftReminders
      case 'all':
      default:
        return systemNotifications
    }
  }, [activeTab, systemNotifications, draftReminders])

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

  // Helper to group actual drafts by time period
  const groupDraftsByTime = (drafts: DraftTransaction[]): Record<DraftTimeGroup, DraftTransaction[]> => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const groups: Record<DraftTimeGroup, DraftTransaction[]> = {
      today: [],
      thisWeek: [],
      older: [],
    }

    // Sort by createdAt descending (most recent first)
    const sorted = [...drafts].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    sorted.forEach((draft) => {
      const date = new Date(draft.createdAt)
      if (date >= today) {
        groups.today.push(draft)
      } else if (date >= weekAgo) {
        groups.thisWeek.push(draft)
      } else {
        groups.older.push(draft)
      }
    })

    return groups
  }

  // Group notifications
  const groupedNotifications = useMemo(() => {
    return groupByTime(filteredItems)
  }, [filteredItems])

  // Group actual drafts by time period
  const groupedDrafts = useMemo(() => {
    return groupDraftsByTime(actualDrafts)
  }, [actualDrafts])

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
    // v2: Navigate to related content based on subtype
  }

  // Handle swipe to dismiss
  const handleDismiss = (notification: Notification) => {
    dismissNotification(notification.id)
  }

  // Navigate to transactions with drafts filter enabled
  const handleGoToTransactions = () => {
    router.push('/transactions?showDrafts=only')
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
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}. ${notification.message}${notification.read ? '' : '. Unread'}`}
      accessibilityHint="Tap to view details. Long press to dismiss"
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

  // Render a single draft row
  const renderDraftRow = (draft: DraftTransaction) => {
    const amount = draft.amountCents > 0 ? formatCurrency(draft.amountCents / 100) : null
    const description = draft.item || draft.merchant || 'Untitled draft'
    const timeAgo = formatTime(draft.createdAt)

    return (
      <Pressable
        key={draft.id}
        onPress={() => handleDraftPress(draft.id)}
        style={[styles.row, { borderBottomColor: theme.semantic.border }]}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.semantic.warning + '20' }]}>
          <FontAwesome name="file-text-o" size={14} color={theme.semantic.warning} />
        </View>
        <View style={styles.rowContent}>
          <View style={styles.rowHeader}>
            <Text style={[styles.rowTitle, { color: theme.semantic.text }]} numberOfLines={1}>
              {description}
            </Text>
            <Text style={[styles.rowTime, { color: theme.semantic.textSecondary }]}>
              {timeAgo}
            </Text>
          </View>
          {amount && (
            <Text style={[styles.rowBody, { color: theme.semantic.textSecondary }]} numberOfLines={1}>
              {amount}
            </Text>
          )}
        </View>
        {draft.starred && (
          <FontAwesome name="star" size={12} color={theme.semantic.warning} style={{ marginLeft: spacing.sm }} />
        )}
      </Pressable>
    )
  }

  // Render draft time group
  const renderDraftTimeGroup = (group: DraftTimeGroup, items: DraftTransaction[]) => {
    if (items.length === 0) return null

    return (
      <View key={group} style={styles.section}>
        <Text style={[styles.sectionHeader, { color: theme.semantic.textSecondary }]}>
          {DRAFT_TIME_LABELS[group]}
        </Text>
        {items.map(renderDraftRow)}
      </View>
    )
  }

  // Handle draft press - navigate to edit
  const handleDraftPress = (draftId: string) => {
    router.push({
      pathname: '/(modal)/add-transaction',
      params: { draftId }
    })
  }

  // Render drafts summary card - shows actual draft count from drafts store
  const renderDraftsSummary = () => {
    if (actualDrafts.length === 0) return null

    return (
      <View style={[styles.draftsSummary, { backgroundColor: theme.semantic.surfaceAlt }]}>
        <Text style={[styles.draftsSummaryTitle, { color: theme.semantic.textSecondary }]}>
          Pending review
        </Text>
        <Text style={[styles.draftsSummaryValue, { color: theme.semantic.warning }]}>
          {actualDrafts.length} {actualDrafts.length === 1 ? 'draft' : 'drafts'}
        </Text>
        <Pressable onPress={handleGoToTransactions} hitSlop={8}>
          <Text style={[styles.draftsSummaryAction, { color: theme.semantic.primary }]}>
            Go to Transactions →
          </Text>
        </Pressable>
      </View>
    )
  }

  // Check if there are any notifications
  const hasNotifications = filteredItems.length > 0

  // Empty state message based on tab
  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'unread':
        return "You're all caught up!"
      case 'drafts':
        return 'No draft reminders'
      default:
        return 'Notifications will appear here'
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.semantic.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <FontAwesome name="chevron-left" size={16} color={theme.semantic.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.semantic.text }]}>
          Notifications
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: theme.semantic.border }]} accessibilityRole="tablist">
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
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
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
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: tab.isWarning ? theme.semantic.warning : theme.semantic.danger },
                  ]}
                >
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
        {activeTab === 'drafts' ? (
          // Drafts tab content - show actual drafts grouped by time
          actualDrafts.length > 0 ? (
            <>
              {renderDraftTimeGroup('today', groupedDrafts.today)}
              {renderDraftTimeGroup('thisWeek', groupedDrafts.thisWeek)}
              {renderDraftTimeGroup('older', groupedDrafts.older)}
            </>
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome
                name="file-text-o"
                size={48}
                color={theme.semantic.textSecondary}
                style={{ opacity: 0.5, marginBottom: spacing.lg }}
              />
              <Text style={[styles.emptyTitle, { color: theme.semantic.text }]}>
                No drafts
              </Text>
              <Text style={[styles.emptyText, { color: theme.semantic.textSecondary }]}>
                Saved drafts will appear here
              </Text>
            </View>
          )
        ) : (
          // All and Unread tabs content
          hasNotifications ? (
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
                {getEmptyStateMessage()}
              </Text>
            </View>
          )
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
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowBody: {
    fontSize: fontSize.sm,
    marginTop: 2,
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
  // Drafts summary card
  draftsSummary: {
    borderRadius: radius.lg,
    margin: spacing.lg,
    padding: spacing.lg,
  },
  draftsSummaryTitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  draftsSummaryValue: {
    fontSize: fontSize.xl + 4,
    fontWeight: fontWeight.bold,
  },
  draftsSummaryAction: {
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
})
