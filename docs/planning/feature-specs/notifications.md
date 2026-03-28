# Notifications

## Context
Scope: Focus on Single-user usage. Eventually the application will be multi-user.

## User story
- As a user, I want to be reminded when I have incomplete drafts so I don't forget to finish them
- As a user, I want to see system announcements (maintenance, new features)
- Single-user MVP doesn't need user_action/message/reaction/group stories yet

## Features
- Current
  - Types: 5 notification types (system, user_action, message, reaction, group)
  - Store: In-memory Zustand with hardcoded seed data
  - DB: Migration exists but store doesn't use it
  - UI: NotificationsScreen with 6 tabs, drafts are separate concern mixed in
  - AppBar: Bell icon with dot indicator (unread + drafts combined)

- Change
  - Types: In phase 1, implement system notification only. Hide/not display unused types
    - Phase 1: scheduled reminders, budget alerts, nudge notification (inactivity), anomaly detection
    - Phase 2: app updates (requires backend)

  - Need persistence
    - Simplified schema for phase 1
    - Fields: id, type, title, message, timestamp, read, dismissed
    - Drop multi-user fields: senderId, senderName, senderAvatar, groupId, groupName, transactionId, reactionType

  - Triggers
    - Real-time: user action triggers notification (ex. budget limit hit on transaction save)
    - App launch: check drafts age (> 7 days), budget status, inactivity

  - Draft
    - Remove Drafts from NotificationsScreen
    - **FAB (Floating Action Button)**
      - Position: Bottom-right of Transactions screen
      - Shows draft count badge
      - Visibility: Only when drafts > 0
      - Tap action: Navigate to Transactions with "Drafts" filter auto-selected
    - **View mode toggle**: In Transactions screen header filter
      - "Drafts section" = grouped at top before transactions
      - "Timeline" = drafts appear inline with their dates (current behavior)

  - Notification type
    - Phase 1: In-app badge only
    - Phase 2: Push notifications for multi-user events

  - Budget alerts
    - Threshold: User configurable in Settings
    - Trigger: On transaction save when threshold exceeded

---

## Decisions Log
| Question | Decision |
|----------|----------|
| Floating indicator type | FAB with draft count |
| FAB action | Navigate to Transactions with "Drafts" filter selected |
| FAB visibility | Only when drafts > 0 |
| Draft view mode toggle location | Transactions screen header filter |
| Draft reminder trigger | App launch check |
| Draft age threshold | 7 days |
| Budget alert threshold | User configurable in Settings |
| App updates notification | Deferred to phase 2 |

---

## Implementation Plan

### Phase 1 (Single-user)

**Notifications**
- [ ] Simplify notification schema (drop multi-user fields)
- [ ] Connect notification store to SQLite
- [ ] Remove drafts tab from NotificationsScreen
- [ ] Hide Groups/Messages/Reactions tabs (show only "All" and "Unread")
- [ ] Implement draft reminder notification (app launch, drafts > 7 days)
- [ ] Implement budget alert notification (on transaction save, threshold configurable)

**Drafts UX**
- [ ] Add FAB to Transactions screen (bottom-right, draft count badge)
- [ ] FAB only visible when drafts > 0
- [ ] FAB tap → navigate to Transactions with "Drafts" filter selected
- [ ] Add draft view mode toggle in Transactions filter (grouped vs timeline)

**Settings**
- [ ] Add budget alert threshold setting

### Phase 2 (Multi-user prep)
- [ ] App update notifications (requires backend)
- [ ] Add user_action notifications when household member adds transaction
- [ ] Push notification infrastructure
- [ ] Reaction system
