import { Platform, StyleSheet } from 'react-native'

import type { useHoHTheme } from '@/shared/providers'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { MODAL_GRABBER_WIDTH, MODAL_GRABBER_HEIGHT, getSheetBottomPadding } from '@/shared/theme/tokens/modal'

const PICKER_HEIGHT = 200

export function createDashboardPeriodPickerStyles(theme: ReturnType<typeof useHoHTheme>) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end'
    },
    sheet: {
      backgroundColor: theme.semantic.surface,
      borderTopLeftRadius: radius.sheet,
      borderTopRightRadius: radius.sheet,
      paddingBottom: getSheetBottomPadding(Platform.OS === 'ios' ? 34 : 20)
    },
    handle: {
      width: MODAL_GRABBER_WIDTH,
      height: MODAL_GRABBER_HEIGHT,
      backgroundColor: theme.semantic.border,
      borderRadius: radius.xs,
      alignSelf: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.xs
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.semantic.border
    },
    headerTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: theme.semantic.text
    },
    doneBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm - spacing.xs / 2, // 6
      backgroundColor: theme.semantic.primary,
      borderRadius: radius.md
    },
    doneBtnText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: theme.semantic.onPrimary
    },
    pickerContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg
    },
    pickerColumn: {
      flex: 1
    },
    picker: {
      height: PICKER_HEIGHT
    },
    pickerItem: {
      fontSize: fontSize.xl,
      color: theme.semantic.text
    }
  })
}

export type DashboardPeriodPickerStyles = ReturnType<typeof createDashboardPeriodPickerStyles>
