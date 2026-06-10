import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useMemo } from 'react'
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { archiveAccount, getAccountById } from '@/core/services/account'
import { Screen } from '@/shared/layout/Screen'
import { useHoHTheme } from '@/shared/providers'
import { useDataRefreshStore } from '@/shared/store'
import { modalStyles } from '@/shared/theme/tokens/modal'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'

export default function AccountDetailScreen() {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ accountId: string }>()
  const { invalidateTransactions } = useDataRefreshStore()
  const { semantic } = theme

  const account = useMemo(() => {
    if (!params.accountId) return null
    return getAccountById(params.accountId)
  }, [params.accountId])

  const handleClose = useCallback(() => {
    router.back()
  }, [])

  const handleEdit = useCallback(() => {
    if (!account) return
    router.push({
      pathname: '/(modal)/edit-account',
      params: { accountId: account.id }
    })
  }, [account])

  const handleViewTransactions = useCallback(() => {
    if (!account) return
    router.replace({
      pathname: '/(tabs)/transactions',
      params: { accountId: account.id }
    })
  }, [account])

  const handleArchive = useCallback(() => {
    if (!account) return

    Alert.alert(
      'Archive Account',
      `Are you sure you want to archive "${account.name}"? It will be hidden from your accounts list but existing transactions will be preserved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: () => {
            try {
              archiveAccount(account.id)
              invalidateTransactions()
              router.back()
            } catch (error) {
              Alert.alert('Error', 'Failed to archive account')
            }
          }
        }
      ]
    )
  }, [account, invalidateTransactions])

  const handleDelete = useCallback(() => {
    if (!account) return

    Alert.alert(
      'Delete Account',
      `Are you sure you want to permanently delete "${account.name}"? This will also delete all transactions associated with this account. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement deleteAccount in service
            Alert.alert('Not Implemented', 'Delete functionality coming soon. Use Archive instead.')
          }
        }
      ]
    )
  }, [account])

  const handleMoreOptions = useCallback(() => {
    if (!account) return

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Archive Account', 'Delete Account'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleArchive()
          if (buttonIndex === 2) handleDelete()
        }
      )
    } else {
      Alert.alert(
        'Options',
        undefined,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Archive Account', onPress: handleArchive },
          { text: 'Delete Account', onPress: handleDelete, style: 'destructive' },
        ]
      )
    }
  }, [account, handleArchive, handleDelete])

  const getAccountIcon = (kind: string) => {
    switch (kind) {
      case 'credit_card': return 'credit-card'
      case 'cash': return 'money'
      case 'checking':
      case 'savings': return 'bank'
      case 'investment': return 'line-chart'
      case 'loan': return 'file-text-o'
      default: return 'university'
    }
  }

  const getAccountTypeLabel = (kind: string, nature: string) => {
    const typeLabel = kind.replace('_', ' ')
    return nature === 'liability' ? `${typeLabel} • liability` : typeLabel
  }

  if (!account) {
    return (
      <Screen edges={[]} padded={false} topPadding={false} style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: semantic.textSecondary }}>Account not found</Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen
      edges={[]}
      padded={false}
      topPadding={false}
      style={{ flex: 1 }}
      contentStyle={{ flex: 1 }}
    >
      {/* Drag Handle */}
      <View style={modalStyles.dragHandleContainer}>
        <View style={[modalStyles.dragHandle, { backgroundColor: semantic.border }]} />
      </View>

      {/* Header */}
      <View style={[modalStyles.header, { justifyContent: 'space-between' }]}>
        <Pressable onPress={handleClose} hitSlop={12} style={modalStyles.cancelButton}>
          <Text style={[modalStyles.cancelText, { color: semantic.textSecondary }]}>Close</Text>
        </Pressable>
        <Pressable onPress={handleMoreOptions} hitSlop={12} style={{ padding: spacing.xs }}>
          <FontAwesome name="ellipsis-h" size={18} color={semantic.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Info Card */}
        <View style={[styles.card, { backgroundColor: semantic.surfaceAlt }]}>
          {/* Icon + Name */}
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: semantic.surface }]}>
              <FontAwesome
                name={getAccountIcon(account.kind)}
                size={24}
                color={semantic.text}
              />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={[styles.accountName, { color: semantic.text }]}>{account.name}</Text>
              <Text style={[styles.accountType, { color: semantic.textSecondary }]}>
                {getAccountTypeLabel(account.kind, account.nature)}
              </Text>
            </View>
          </View>

          {/* Details */}
          {(account.bankName || account.lastFourDigits) && (
            <View style={[styles.detailsSection, { borderTopColor: semantic.border }]}>
              {account.bankName && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: semantic.textSecondary }]}>Institution</Text>
                  <Text style={[styles.detailValue, { color: semantic.text }]}>{account.bankName}</Text>
                </View>
              )}
              {account.lastFourDigits && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: semantic.textSecondary }]}>Last 4 digits</Text>
                  <Text style={[styles.detailValue, { color: semantic.text }]}>•••• {account.lastFourDigits}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          {/* View Transactions */}
          <Pressable
            onPress={handleViewTransactions}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: semantic.surfaceAlt, opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <FontAwesome name="list" size={16} color={semantic.text} />
            <Text style={[styles.actionButtonText, { color: semantic.text }]}>View Transactions</Text>
            <FontAwesome name="chevron-right" size={12} color={semantic.textSecondary} />
          </Pressable>

          {/* Edit */}
          <Pressable
            onPress={handleEdit}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: semantic.surfaceAlt, opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <FontAwesome name="pencil" size={16} color={semantic.text} />
            <Text style={[styles.actionButtonText, { color: semantic.text }]}>Edit Account</Text>
            <FontAwesome name="chevron-right" size={12} color={semantic.textSecondary} />
          </Pressable>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Pressable
            onPress={handleArchive}
            style={({ pressed }) => [
              styles.dangerButton,
              { borderColor: semantic.border, opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <FontAwesome name="archive" size={14} color={semantic.textSecondary} />
            <Text style={[styles.dangerButtonText, { color: semantic.textSecondary }]}>Archive Account</Text>
          </Pressable>

          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [
              styles.dangerButton,
              { borderColor: semantic.danger, opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <FontAwesome name="trash" size={14} color={semantic.danger} />
            <Text style={[styles.dangerButtonText, { color: semantic.danger }]}>Delete Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  accountName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  accountType: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  detailsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    fontSize: fontSize.sm,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  actionsSection: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  actionButtonText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  dangerSection: {
    gap: spacing.sm,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  dangerButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
})
