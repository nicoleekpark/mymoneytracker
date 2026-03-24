/**
 * Notifications Store
 *
 * Phase 1: System notifications only, persisted to SQLite.
 * Manages notification state including read/unread status.
 */

import type { Notification, CreateNotificationInput } from '@/domain/notification'
import { notificationRepository } from '@/infrastructure/repositories'
import { create } from 'zustand'

type NotificationsState = {
  notifications: Notification[]
  isLoaded: boolean

  /** Load notifications from SQLite */
  loadNotifications: () => void

  /** Add a new notification */
  addNotification: (input: CreateNotificationInput) => Notification

  /** Mark a single notification as read */
  markAsRead: (id: string) => void

  /** Mark all notifications as read */
  markAllAsRead: () => void

  /** Dismiss a notification (soft delete) */
  dismissNotification: (id: string) => void

  /** Delete a notification permanently */
  removeNotification: (id: string) => void

  /** Get unread count */
  getUnreadCount: () => number

  /** Get unread notifications */
  getUnread: () => Notification[]

  /** Check if a recent notification of subtype exists (prevents duplicates) */
  hasRecentBySubtype: (subtype: string, withinHours?: number) => boolean
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  isLoaded: false,

  loadNotifications: () => {
    try {
      const notifications = notificationRepository.list()
      set({ notifications, isLoaded: true })
    } catch (error) {
      console.error('Failed to load notifications:', error)
      set({ notifications: [], isLoaded: true })
    }
  },

  addNotification: (input) => {
    try {
      const notification = notificationRepository.create(input)
      set((state) => ({
        notifications: [notification, ...state.notifications],
      }))
      return notification
    } catch (error) {
      console.error('Failed to add notification:', error)
      throw error
    }
  },

  markAsRead: (id) => {
    try {
      notificationRepository.markAsRead(id)
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
      }))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  },

  markAllAsRead: () => {
    try {
      notificationRepository.markAllAsRead()
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }))
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  },

  dismissNotification: (id) => {
    try {
      notificationRepository.dismiss(id)
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }))
    } catch (error) {
      console.error('Failed to dismiss notification:', error)
    }
  },

  removeNotification: (id) => {
    try {
      notificationRepository.delete(id)
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }))
    } catch (error) {
      console.error('Failed to remove notification:', error)
    }
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length
  },

  getUnread: () => {
    return get().notifications.filter((n) => !n.read)
  },

  hasRecentBySubtype: (subtype, withinHours = 24) => {
    try {
      return notificationRepository.hasRecentBySubtype(subtype, withinHours)
    } catch (error) {
      console.error('Failed to check recent notifications:', error)
      return false
    }
  },
}))
