/**
 * Notifications Store
 *
 * @persistence SQLITE - Persisted to notifications table via notificationRepository.
 * @scope PERMANENT - Survives app restarts, user-facing data.
 *
 * Phase 1: System notifications only.
 * Manages notification state including read/unread/dismissed status.
 */

import type { Notification, CreateNotificationInput } from '@/core/domain/notification'
import { NOTIFICATION_SUBTYPES } from '@/core/domain/notification'
import { notificationRepository } from '@/infrastructure/repositories'
import { logError } from '@/shared/utils/logger'
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

  /** Get unread count (excludes draft reminders) */
  getUnreadCount: () => number

  /** Get unread notifications (excludes draft reminders) */
  getUnread: () => Notification[]

  /** Get draft reminder count */
  getDraftCount: () => number

  /** Get draft reminders */
  getDraftReminders: () => Notification[]

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
      logError('Notifications', error)
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
      logError('Notifications', error)
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
      logError('Notifications', error)
    }
  },

  markAllAsRead: () => {
    try {
      notificationRepository.markAllAsRead()
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }))
    } catch (error) {
      logError('Notifications', error)
    }
  },

  dismissNotification: (id) => {
    try {
      notificationRepository.dismiss(id)
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }))
    } catch (error) {
      logError('Notifications', error)
    }
  },

  removeNotification: (id) => {
    try {
      notificationRepository.delete(id)
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }))
    } catch (error) {
      logError('Notifications', error)
    }
  },

  getUnreadCount: () => {
    // Exclude draft reminders from unread count
    return get().notifications.filter((n) => !n.read && n.subtype !== NOTIFICATION_SUBTYPES.DRAFT_REMINDER).length
  },

  getUnread: () => {
    // Exclude draft reminders from unread list
    return get().notifications.filter((n) => !n.read && n.subtype !== NOTIFICATION_SUBTYPES.DRAFT_REMINDER)
  },

  getDraftCount: () => {
    return get().notifications.filter((n) => n.subtype === NOTIFICATION_SUBTYPES.DRAFT_REMINDER).length
  },

  getDraftReminders: () => {
    return get().notifications.filter((n) => n.subtype === NOTIFICATION_SUBTYPES.DRAFT_REMINDER)
  },

  hasRecentBySubtype: (subtype, withinHours = 24) => {
    try {
      return notificationRepository.hasRecentBySubtype(subtype, withinHours)
    } catch (error) {
      logError('Notifications', error)
      return false
    }
  },
}))
