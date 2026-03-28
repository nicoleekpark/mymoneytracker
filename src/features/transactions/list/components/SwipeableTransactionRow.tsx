import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import FontAwesome from '@expo/vector-icons/FontAwesome'

import type { Transaction } from '@/core/domain/transaction'
import { safeDate, TransactionType } from '@/core/domain/transaction'
import { formatCurrency } from '@/shared/format/currency'
import { ymd, formatDayHeader } from '@/shared/format/date'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'

const ACTION_WIDTH = 80
const SWIPE_THRESHOLD = 60
const DAY_COL_W = 28
const DAY_GAP = 8

type Props = {
  transaction: Transaction
  accountName: string
  isHighlighted: boolean
  showDayHeader: boolean
  theme: {
    text: string
    textSecondary: string
    border: string
    surface: string
    primary: string
    primarySoft?: string
    surfaceAlt: string
    success: string
    successSoft: string
    danger: string
    dangerSoft: string
    info: string
    infoSoft: string
  }
  onPress: () => void
  onEdit: () => void
  onDelete: () => void
}

export function SwipeableTransactionRow({
  transaction,
  accountName,
  isHighlighted,
  showDayHeader,
  theme,
  onPress,
  onEdit,
  onDelete,
}: Props) {
  const translateX = useSharedValue(0)

  const handleEdit = useCallback(() => {
    onEdit()
  }, [onEdit])

  const handleDelete = useCallback(() => {
    onDelete()
  }, [onDelete])

  const handlePress = useCallback(() => {
    onPress()
  }, [onPress])

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((event) => {
      // Only allow swipe left (negative)
      translateX.value = Math.max(-ACTION_WIDTH * 2, Math.min(0, event.translationX))
    })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD) {
        // Snap to reveal actions
        translateX.value = withSpring(-ACTION_WIDTH * 2, { damping: 20, stiffness: 200 })
      } else {
        // Snap back
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 })
      }
    })

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (translateX.value < -10) {
        // If actions revealed, snap back
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 })
      } else {
        runOnJS(handlePress)()
      }
    })

  const composedGesture = Gesture.Race(panGesture, tapGesture)

  const rowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const actionsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-ACTION_WIDTH * 2, -ACTION_WIDTH, 0],
      [1, 0.8, 0],
      Extrapolation.CLAMP
    ),
  }))

  // Transaction data
  const amt = transaction.money.amount
  const t = transaction.type
  const itemText = transaction.item || transaction.note || 'Untitled'
  const merchantRaw = (transaction.merchant ?? '').trim()
  const merchantText = merchantRaw.length ? merchantRaw : null

  const d = safeDate(transaction)
  const dayText = Number.isFinite(d.getTime()) ? String(d.getDate()) : '--'
  const rowYmd = Number.isFinite(d.getTime()) ? ymd(d) : null

  const stripBg = getStripBg(t, theme)
  const amountColor = t === 'income' ? theme.success : theme.text

  return (
    <View style={styles.container}>
      {/* Day header */}
      {showDayHeader && rowYmd && (
        <View style={styles.dayHeader}>
          <Text style={[styles.dayHeaderText, { color: theme.textSecondary }]}>
            {formatDayHeader(d)}
          </Text>
        </View>
      )}

      {/* Actions revealed behind row */}
      <Animated.View style={[styles.actionsContainer, actionsAnimatedStyle]}>
        <GestureDetector gesture={Gesture.Tap().onEnd(() => {
          translateX.value = withSpring(0, { damping: 20, stiffness: 200 })
          runOnJS(handleEdit)()
        })}>
          <View style={[styles.actionButton, styles.editAction, { backgroundColor: theme.info }]}>
            <FontAwesome name="pencil" size={18} color="#fff" />
            <Text style={styles.actionText}>Edit</Text>
          </View>
        </GestureDetector>

        <GestureDetector gesture={Gesture.Tap().onEnd(() => {
          translateX.value = withSpring(0, { damping: 20, stiffness: 200 })
          runOnJS(handleDelete)()
        })}>
          <View style={[styles.actionButton, styles.deleteAction, { backgroundColor: theme.danger }]}>
            <FontAwesome name="trash" size={18} color="#fff" />
            <Text style={styles.actionText}>Delete</Text>
          </View>
        </GestureDetector>
      </Animated.View>

      {/* Main row content */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            styles.rowCard,
            {
              borderColor: isHighlighted ? theme.primary : theme.border,
              backgroundColor: isHighlighted
                ? (theme.primarySoft ?? theme.surfaceAlt)
                : theme.surface
            },
            rowAnimatedStyle
          ]}
        >
          <View style={[styles.leftStrip, { backgroundColor: stripBg }]} />

          <View style={styles.rowBody}>
            <View style={styles.rowTop}>
              <Text style={[styles.dayText, { color: theme.textSecondary }]}>{dayText}</Text>
              <Text style={[styles.itemText, { color: theme.text }]} numberOfLines={1}>
                {itemText}
              </Text>
              <Text style={[styles.amountText, { color: amountColor }]} numberOfLines={1}>
                {formatCurrency(amt)}
              </Text>
            </View>

            <View style={styles.rowSecond}>
              <Text style={[styles.merchantText, { color: theme.textSecondary }]} numberOfLines={1}>
                {merchantText ?? ''}
              </Text>
              <Text style={[styles.accountText, { color: theme.textSecondary }]} numberOfLines={1}>
                {accountName}
              </Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

function getStripBg(t: TransactionType, theme: Props['theme']): string {
  if (t === 'income') return theme.successSoft
  if (t === 'transfer') return theme.infoSoft
  return theme.dangerSoft
}

// Component-specific sizes
const ROW_MIN_HEIGHT = 50
const LEFT_STRIP_WIDTH = 10

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  dayHeader: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm - spacing.xs / 2, // 6
  },
  dayHeaderText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.heavy,
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  actionButton: {
    width: ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  editAction: {
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  deleteAction: {
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  actionText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    // color set inline via theme.semantic.onPrimary
  },
  rowCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
    minHeight: ROW_MIN_HEIGHT,
    // backgroundColor set inline via theme
  },
  leftStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: LEFT_STRIP_WIDTH,
  },
  rowBody: {
    flex: 1,
    paddingVertical: spacing.sm + spacing.xs / 2, // 10
    paddingHorizontal: spacing.md,
    paddingLeft: spacing.md + LEFT_STRIP_WIDTH,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  dayText: {
    width: DAY_COL_W,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    marginRight: DAY_GAP,
  },
  itemText: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    paddingRight: spacing.sm + spacing.xs / 2, // 10
  },
  amountText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
  },
  rowSecond: {
    marginTop: spacing.xs,
    marginLeft: DAY_COL_W + DAY_GAP,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm + spacing.xs / 2, // 10
  },
  merchantText: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  accountText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textAlign: 'right',
  },
})
