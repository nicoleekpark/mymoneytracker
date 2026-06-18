/**
 * Notification Service
 *
 * Phase 1:
 * - App launch checks for draft reminders
 * - Transaction save checks for budget alerts
 */

import { draftRepository, notificationRepository, transactionRepository } from '@/infrastructure/repositories'
import { logError } from '@/shared/utils/logger'
import { useSettingsStore } from '@/shared/store/settings.store'
import { useNotificationsStore } from '@/shared/store/notifications.store'

const DRAFT_REMINDER_SUBTYPE = 'draft_reminder'
const BUDGET_ALERT_SUBTYPE = 'budget_alert'

/**
 * Check for drafts and create a notification if any exist.
 * Only creates one notification per 24h to avoid spam.
 */
export function checkDraftReminder(): void {
  try {
    // Don't create duplicate notification if one exists within 24h
    if (notificationRepository.hasRecentBySubtype(DRAFT_REMINDER_SUBTYPE, 24)) {
      return
    }

    // Get all drafts
    const drafts = draftRepository.list()
    if (drafts.length === 0) return

    // Create notification for any pending drafts
    const count = drafts.length
    notificationRepository.create({
      type: 'system',
      subtype: DRAFT_REMINDER_SUBTYPE,
      title: 'Draft Reminder',
      message: count === 1
        ? 'You have 1 pending draft'
        : `You have ${count} pending drafts`,
      metadata: {
        draftCount: count,
        draftIds: drafts.map((d) => d.id),
      },
    })
    // Refresh store to update badge
    useNotificationsStore.getState().loadNotifications()
  } catch (error) {
    logError('NotificationTriggers', error)
  }
}

/**
 * Check if monthly budget threshold is exceeded and create notification.
 * Called after each transaction save.
 */
export function checkBudgetAlert(): void {
  try {
    const settings = useSettingsStore.getState()

    // Skip if budget alerts disabled or no budget set
    if (!settings.budgetAlertEnabled || settings.monthlyBudget <= 0) {
      return
    }

    // Get current month's expenses
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Query transactions for current month
    const result = transactionRepository.listInDateRange(
      startOfMonth.toISOString(),
      endOfMonth.toISOString()
    )

    // Sum up expenses only
    const totalExpensesCents = result.items
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.money.amount, 0)

    // Calculate threshold in cents
    const thresholdCents = Math.round(settings.monthlyBudget * (settings.budgetAlertThreshold / 100))

    // Check if expenses exceed threshold
    if (totalExpensesCents < thresholdCents) {
      return // Not yet at threshold, no alert needed
    }

    // Find ALL non-dismissed budget alerts for this month
    // Check if any was created with the current budget amount
    const existingAlerts = notificationRepository.listBySubtype(BUDGET_ALERT_SUBTYPE)

    const alertForCurrentBudget = existingAlerts.find(alert => {
      const meta = alert.metadata
      if (!meta) return false
      // Match by month/year AND same budget amount
      return (
        meta.month === currentMonth &&
        meta.year === currentYear &&
        meta.monthlyBudget === settings.monthlyBudget
      )
    })

    if (alertForCurrentBudget) {
      return // Already alerted for this budget amount this month
    }

    // Create alert - either first alert this month, or budget changed and threshold exceeded
    const percentUsed = Math.round((totalExpensesCents / settings.monthlyBudget) * 100)
    const amountSpent = (totalExpensesCents / 100).toFixed(0)
    const budgetAmount = (settings.monthlyBudget / 100).toFixed(0)
    const monthYear = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

    notificationRepository.create({
      type: 'system',
      subtype: BUDGET_ALERT_SUBTYPE,
      title: 'Budget Alert',
      message: `[${monthYear}] You've spent $${amountSpent} of your $${budgetAmount} budget (${percentUsed}%)`,
      metadata: {
        totalExpensesCents,
        monthlyBudget: settings.monthlyBudget,
        percentUsed,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    })
    // Refresh store to update badge
    useNotificationsStore.getState().loadNotifications()
  } catch (error) {
    logError('NotificationTriggers', error)
  }
}

/**
 * Run all app launch notification triggers.
 * Called once after DB initialization.
 */
export function runAppLaunchTriggers(): void {
  checkDraftReminder()
  checkBudgetAlert()
}
