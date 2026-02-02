/**
 * Notifications Store
 *
 * Manages notification state including read/unread status.
 */

import type { Notification, NotificationType } from '@/domain/notification'
import { create } from 'zustand'

type NotificationsState = {
  notifications: Notification[]

  /** Add a new notification */
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void

  /** Mark a single notification as read */
  markAsRead: (id: string) => void

  /** Mark all notifications as read */
  markAllAsRead: () => void

  /** Remove a notification */
  removeNotification: (id: string) => void

  /** Get unread count */
  getUnreadCount: () => number

  /** Get notifications by type */
  getByType: (type: NotificationType) => Notification[]

  /** Get unread notifications */
  getUnread: () => Notification[]

  /** Get notifications for messages */
  getMessages: () => Notification[]

  /** Get notifications for reactions */
  getReactions: () => Notification[]

  /** Get notifications for groups */
  getGroups: () => Notification[]
}

// Seed data for demo
const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'system',
    title: 'System',
    message: 'Maintenance scheduled tonight at 12 AM',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
    read: false,
  },
  {
    id: '2',
    type: 'user_action',
    title: 'Nicole',
    message: 'Added "Lunch" – $15.50',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1h ago
    read: false,
    senderId: 'nicole',
    senderName: 'Nicole',
    senderAvatar: 'N',
  },
  {
    id: '3',
    type: 'message',
    title: 'Drake',
    message: 'Can you add the grocery receipt?',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1d ago
    read: true,
    senderId: 'drake',
    senderName: 'Drake',
    senderAvatar: 'D',
  },
  {
    id: '4',
    type: 'reaction',
    title: 'Nicole',
    message: '❤️ liked "Coffee at Starbucks"',
    timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 1d ago
    read: true,
    senderId: 'nicole',
    senderName: 'Nicole',
    senderAvatar: 'N',
    reactionType: 'love',
  },
  {
    id: '5',
    type: 'group',
    title: 'Family',
    message: 'Drake added "Gas" – $45.00',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5d ago
    read: true,
    groupId: 'family',
    groupName: 'Family',
  },
]

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: SEED_NOTIFICATIONS,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false,
    }
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }))
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }))
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }))
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length
  },

  getByType: (type) => {
    return get().notifications.filter((n) => n.type === type)
  },

  getUnread: () => {
    return get().notifications.filter((n) => !n.read)
  },

  getMessages: () => {
    return get().notifications.filter((n) => n.type === 'message')
  },

  getReactions: () => {
    return get().notifications.filter((n) => n.type === 'reaction')
  },

  getGroups: () => {
    return get().notifications.filter((n) => n.type === 'group')
  },
}))
