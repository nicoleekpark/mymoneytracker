/**
 * Notification Types
 *
 * Defines notification categories and data structures.
 */

export type NotificationType =
  | 'system'      // App updates, maintenance
  | 'user_action' // Someone added/edited transaction
  | 'message'     // DM from group member
  | 'reaction'    // Like, comment on transaction
  | 'group'       // Group-related activity

export type ReactionType = 'like' | 'love' | 'question' | 'exclamation' | 'thanks'

export type Notification = {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string // ISO date
  read: boolean

  // Optional fields based on type
  senderId?: string      // User who triggered notification
  senderName?: string    // Display name
  senderAvatar?: string  // Avatar URL or initial
  groupId?: string       // For group notifications
  groupName?: string
  transactionId?: string // For transaction-related
  reactionType?: ReactionType
}

export type NotificationTab = 'all' | 'unread' | 'drafts' | 'groups' | 'messages' | 'reactions'

/**
 * Tab configuration
 */
export const NOTIFICATION_TABS: { key: NotificationTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'drafts', label: 'Drafts' },
  { key: 'groups', label: 'Groups' },
  { key: 'messages', label: 'Messages' },
  { key: 'reactions', label: 'Reactions' },
]

/**
 * Time group labels for notification list
 */
export type TimeGroup = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'older'

export const TIME_GROUP_LABELS: Record<TimeGroup, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last7days: 'Last 7 Days',
  last30days: 'Last 30 Days',
  older: 'Older',
}
