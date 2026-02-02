/**
 * NotificationsScreen
 *
 * Displays notifications with tabs: All, Unread, Drafts, Groups, Messages, Reactions
 * Compact single-line rows with time groupings.
 */

import type { Notification, NotificationTab, TimeGroup } from '@/domain/notification'
import { TIME_GROUP_LABELS } from '@/domain/notification'
import { useHoHTheme } from '@/providers'
import { useDraftsStore, useNotificationsStore } from '@/store'
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

type TabConfig = {
  key: NotificationTab
  label: string
  count?: number
  hidden?: boolean
}

type DraftFilter = 'all' | 'starred' | 'needs-amount' | 'add-details'

export default function NotificationsScreen() {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState<NotificationTab>('all')
  const [draftFilter, setDraftFilter] = useState<DraftFilter>('all')

  // Stores
  const notifications = useNotificationsStore((s) => s.notifications)
  const markAsRead = useNotificationsStore((s) => s.markAsRead)
  const getUnread = useNotificationsStore((s) => s.getUnread)
  const getMessages = useNotificationsStore((s) => s.getMessages)
  const getReactions = useNotificationsStore((s) => s.getReactions)
  const getGroups = useNotificationsStore((s) => s.getGroups)
  const drafts = useDraftsStore((s) => s.drafts)
  const isLoaded = useDraftsStore((s) => s.isLoaded)
  const loadDrafts = useDraftsStore((s) => s.loadDrafts)
  const toggleStar = useDraftsStore((s) => s.toggleStar)

  // Load drafts from SQLite on mount
  useEffect(() => {
    if (!isLoaded) {
      loadDrafts()
    }
  }, [isLoaded, loadDrafts])

  // Check if user has groups (for now, check if any group notifications exist)
  const hasGroups = useMemo(() => getGroups().length > 0, [getGroups])

  // Tab configuration with counts
  const tabs: TabConfig[] = useMemo(() => [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread', count: getUnread().length },
    { key: 'drafts', label: 'Drafts', count: drafts.length },
    { key: 'groups', label: 'Groups', count: getGroups().length, hidden: !hasGroups },
    { key: 'messages', label: 'Messages', count: getMessages().length },
    { key: 'reactions', label: 'Reactions', count: getReactions().length },
  ], [getUnread, drafts.length, getGroups, getMessages, getReactions, hasGroups])

  // Draft filter helpers
  const hasAmount = (draft: typeof drafts[0]) => (draft.amountCents ?? 0) > 0
  const hasOptionalDetails = (draft: typeof drafts[0]) =>
    !!(draft.categoryRef || (draft.item && draft.item.trim()) || draft.merchant)
  const needsAmount = (draft: typeof drafts[0]) => !hasAmount(draft)
  const canAddDetails = (draft: typeof drafts[0]) =>
    hasAmount(draft) && (!draft.categoryRef || !draft.item?.trim() || !draft.merchant)

  // Draft filter counts
  const draftFilterCounts = useMemo(() => ({
    all: drafts.length,
    starred: drafts.filter((d) => d.starred).length,
    'needs-amount': drafts.filter(needsAmount).length,
    'add-details': drafts.filter(canAddDetails).length,
  }), [drafts])

  // Filtered drafts based on selected filter
  const filteredDrafts = useMemo(() => {
    switch (draftFilter) {
      case 'starred':
        return drafts.filter((d) => d.starred)
      case 'needs-amount':
        return drafts.filter(needsAmount)
      case 'add-details':
        return drafts.filter(canAddDetails)
      default:
        return drafts
    }
  }, [drafts, draftFilter])

  // Filter notifications based on active tab
  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case 'all':
        return notifications
      case 'unread':
        return getUnread()
      case 'drafts':
        return [] // Handled separately
      case 'groups':
        return getGroups()
      case 'messages':
        return getMessages()
      case 'reactions':
        return getReactions()
      default:
        return notifications
    }
  }, [activeTab, notifications, getUnread, getGroups, getMessages, getReactions])

  // Helper to group items by time
  const groupByTime = <T extends { timestamp?: string; createdAt?: string }>(
    items: T[],
    getDate: (item: T) => Date
  ): Record<TimeGroup, T[]> => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const groups: Record<TimeGroup, T[]> = {
      today: [],
      yesterday: [],
      last7days: [],
      last30days: [],
      older: [],
    }

    items.forEach((item) => {
      const date = getDate(item)
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
    return groupByTime(filteredItems, (n) => new Date(n.timestamp))
  }, [filteredItems])

  // Group unread notifications by type
  const unreadByType = useMemo(() => {
    const unread = getUnread()
    return {
      groups: unread.filter((n) => n.type === 'group'),
      messages: unread.filter((n) => n.type === 'message'),
      reactions: unread.filter((n) => n.type === 'reaction'),
      system: unread.filter((n) => n.type === 'system'),
      userAction: unread.filter((n) => n.type === 'user_action'),
    }
  }, [getUnread, notifications])

  // Group drafts by time (using filtered drafts)
  const groupedDrafts = useMemo(() => {
    return groupByTime(filteredDrafts, (d) => new Date(d.createdAt))
  }, [filteredDrafts])

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

  // Get icon for notification type
  const getIcon = (notification: Notification): { name: string; color: string } => {
    switch (notification.type) {
      case 'system':
        return { name: 'cog', color: theme.semantic.textSecondary }
      case 'message':
        return { name: 'comment', color: theme.semantic.primary }
      case 'group':
        return { name: 'users', color: theme.semantic.primary }
      default:
        return { name: 'user', color: theme.semantic.text }
    }
  }

  // Handle notification tap
  const handleNotificationTap = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    // TODO: Navigate to related content based on type
  }

  // Handle draft edit
  const handleDraftEdit = (draftId: string) => {
    router.push({
      pathname: '/(modal)/add-transaction',
      params: { draftId },
    } as any)
  }

  // Render avatar or icon
  const renderAvatar = (notification: Notification) => {
    if (notification.senderAvatar) {
      return (
        <View style={[styles.avatar, { backgroundColor: theme.semantic.primary }]}>
          <Text style={[styles.avatarText, { color: '#fff' }]}>
            {notification.senderAvatar}
          </Text>
        </View>
      )
    }

    if (notification.type === 'group') {
      return (
        <View style={[styles.avatar, { backgroundColor: theme.semantic.surfaceAlt }]}>
          <FontAwesome name="users" size={12} color={theme.semantic.primary} />
        </View>
      )
    }

    const icon = getIcon(notification)
    return (
      <View style={[styles.avatar, { backgroundColor: theme.semantic.surfaceAlt }]}>
        <FontAwesome name={icon.name as any} size={12} color={icon.color} />
      </View>
    )
  }

  // Render notification row
  const renderNotificationRow = (notification: Notification) => (
    <Pressable
      key={notification.id}
      onPress={() => handleNotificationTap(notification)}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: theme.semantic.surfaceAlt },
      ]}
    >
      {renderAvatar(notification)}
      <Text
        style={[
          styles.rowText,
          { color: theme.semantic.text },
          !notification.read && styles.rowTextUnread,
        ]}
        numberOfLines={1}
      >
        <Text style={styles.rowTitle}>{notification.title}</Text>
        {'  '}
        {notification.message}
      </Text>
      <View style={styles.rowRight}>
        <View style={[styles.unreadDot, { backgroundColor: !notification.read ? theme.semantic.danger : 'transparent' }]} />
        <Text style={[styles.rowTime, { color: theme.semantic.textSecondary }]}>
          {formatTime(notification.timestamp)}
        </Text>
      </View>
    </Pressable>
  )

  // Format amount display - actual value or placeholder
  const formatAmount = (amountCents: number | undefined): { text: string; isPlaceholder: boolean } => {
    if (amountCents && amountCents > 0) {
      return { text: `$${(amountCents / 100).toFixed(2)}`, isPlaceholder: false }
    }
    return { text: '$ ——', isPlaceholder: true }
  }

  // Format transaction date for display
  const formatTxDate = (occurredAt: string): string => {
    const date = new Date(occurredAt)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Build draft title from item name
  const getDraftTitle = (draft: typeof drafts[0]): string => {
    if (draft.item && draft.item.trim()) return draft.item
    return 'Untitled'
  }

  // Handle star toggle
  const handleStarToggle = (e: any, draftId: string) => {
    e.stopPropagation()
    toggleStar(draftId)
  }

  // Render draft row - entire row tappable
  const renderDraftRow = (draft: typeof drafts[0]) => {
    const amount = formatAmount(draft.amountCents)

    return (
      <Pressable
        key={draft.id}
        onPress={() => handleDraftEdit(draft.id)}
        style={({ pressed }) => [
          styles.row,
          pressed && { backgroundColor: theme.semantic.surfaceAlt },
        ]}
      >
        <Pressable
          onPress={(e) => handleStarToggle(e, draft.id)}
          hitSlop={8}
          style={styles.starButton}
        >
          <FontAwesome
            name={draft.starred ? 'star' : 'star-o'}
            size={16}
            color={draft.starred ? '#fbbf24' : theme.semantic.textSecondary}
            style={{ opacity: draft.starred ? 1 : 0.4 }}
          />
        </Pressable>
        <View style={styles.draftContent}>
          <Text style={[styles.draftTitle, { color: theme.semantic.text }]} numberOfLines={1}>
            {getDraftTitle(draft)}
          </Text>
        </View>
        <Text
          style={[
            styles.draftAmount,
            {
              color: amount.isPlaceholder ? theme.semantic.textSecondary : theme.semantic.text,
              opacity: amount.isPlaceholder ? 0.5 : 1,
            },
          ]}
        >
          {amount.text}
        </Text>
        <Text style={[styles.draftDate, { color: theme.semantic.textSecondary }]}>
          {formatTxDate(draft.occurredAt)}
        </Text>
        <FontAwesome name="chevron-right" size={10} color={theme.semantic.textSecondary} style={{ opacity: 0.5 }} />
      </Pressable>
    )
  }

  // Render draft time group
  const renderDraftTimeGroup = (group: TimeGroup, items: typeof drafts) => {
    if (items.length === 0) return null

    return (
      <View key={group} style={styles.section}>
        <Text style={[styles.sectionHeader, { color: theme.semantic.textSecondary }]}>
          {TIME_GROUP_LABELS[group]}
        </Text>
        {items.map(renderDraftRow)}
      </View>
    )
  }

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

  // Render unread section by type
  const renderUnreadTypeSection = (
    label: string,
    items: Notification[],
    count: number
  ) => {
    if (items.length === 0) return null

    return (
      <View key={label} style={styles.section}>
        <View style={styles.typeSectionHeader}>
          <Text style={[styles.sectionHeader, { color: theme.semantic.textSecondary, marginBottom: 0 }]}>
            {label}
          </Text>
          {count > 0 && (
            <View style={[styles.typeBadge, { backgroundColor: theme.semantic.danger }]}>
              <Text style={styles.typeBadgeText}>{count}</Text>
            </View>
          )}
        </View>
        {items.map(renderNotificationRow)}
      </View>
    )
  }

  // Render unread content organized by type
  const renderUnreadContent = () => {
    const totalUnread = getUnread().length
    if (totalUnread === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.semantic.textSecondary }]}>
            No unread notifications
          </Text>
        </View>
      )
    }

    return (
      <>
        {renderUnreadTypeSection('Groups', unreadByType.groups, unreadByType.groups.length)}
        {renderUnreadTypeSection('Messages', unreadByType.messages, unreadByType.messages.length)}
        {renderUnreadTypeSection('Reactions', unreadByType.reactions, unreadByType.reactions.length)}
        {renderUnreadTypeSection('Activity', unreadByType.userAction, unreadByType.userAction.length)}
        {renderUnreadTypeSection('System', unreadByType.system, unreadByType.system.length)}
      </>
    )
  }

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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabsContainer, { borderBottomColor: theme.semantic.border }]}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.filter((t) => !t.hidden).map((tab) => {
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
                  <Text style={styles.badgeText}>{tab.count}</Text>
                </View>
              )}
            </Pressable>
          )
        })}
      </ScrollView>

      {/* Draft Filter Pills - only show on drafts tab */}
      {activeTab === 'drafts' && drafts.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.filterContainer, { borderBottomColor: theme.semantic.border }]}
          contentContainerStyle={styles.filterContent}
        >
          {([
            { key: 'all' as const, label: 'All', icon: null },
            { key: 'starred' as const, label: 'Starred', icon: 'star' as const },
            { key: 'needs-amount' as const, label: 'Needs amount', icon: null },
            { key: 'add-details' as const, label: 'Add details', icon: null },
          ]).map((filter) => {
            const isActive = draftFilter === filter.key
            const count = draftFilterCounts[filter.key]
            return (
              <Pressable
                key={filter.key}
                onPress={() => setDraftFilter(filter.key)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isActive ? theme.semantic.text : theme.semantic.surfaceAlt,
                  },
                ]}
              >
                {filter.icon && (
                  <FontAwesome
                    name={filter.icon}
                    size={11}
                    color={isActive ? theme.semantic.background : '#fbbf24'}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text
                  style={[
                    styles.filterPillText,
                    { color: isActive ? theme.semantic.background : theme.semantic.text },
                  ]}
                >
                  {filter.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.filterPillCount,
                      {
                        backgroundColor: isActive
                          ? 'rgba(255,255,255,0.2)'
                          : 'rgba(0,0,0,0.08)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterPillCountText,
                        { color: isActive ? theme.semantic.background : theme.semantic.textSecondary },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </Pressable>
            )
          })}
        </ScrollView>
      )}

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'drafts' ? (
          // Drafts tab content with time groupings
          filteredDrafts.length > 0 ? (
            <>
              {renderDraftTimeGroup('today', groupedDrafts.today)}
              {renderDraftTimeGroup('yesterday', groupedDrafts.yesterday)}
              {renderDraftTimeGroup('last7days', groupedDrafts.last7days)}
              {renderDraftTimeGroup('last30days', groupedDrafts.last30days)}
              {renderDraftTimeGroup('older', groupedDrafts.older)}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.semantic.textSecondary }]}>
                {draftFilter === 'all' ? 'No drafts' : `No ${draftFilter.replace('-', ' ')} drafts`}
              </Text>
            </View>
          )
        ) : activeTab === 'unread' ? (
          // Unread tab content organized by type
          renderUnreadContent()
        ) : (
          // Other notification tabs content (time-grouped)
          filteredItems.length > 0 ? (
            <>
              {renderTimeGroup('today', groupedNotifications.today)}
              {renderTimeGroup('yesterday', groupedNotifications.yesterday)}
              {renderTimeGroup('last7days', groupedNotifications.last7days)}
              {renderTimeGroup('last30days', groupedNotifications.last30days)}
              {renderTimeGroup('older', groupedNotifications.older)}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.semantic.textSecondary }]}>
                No notifications
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 32,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 32,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    maxHeight: 44,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    marginBottom: -1,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingTop: 16,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  typeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  typeBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rowText: {
    flex: 1,
    fontSize: 14,
  },
  rowTextUnread: {
    fontWeight: '500',
  },
  rowTitle: {
    fontWeight: '600',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  rowTime: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
  },
  draftContent: {
    flex: 1,
  },
  draftTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  draftSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  draftAmount: {
    fontSize: 14,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
    marginLeft: 8,
  },
  draftDate: {
    fontSize: 12,
    marginLeft: 12,
    marginRight: 8,
  },
  filterContainer: {
    maxHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterPillCount: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  filterPillCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  starButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
