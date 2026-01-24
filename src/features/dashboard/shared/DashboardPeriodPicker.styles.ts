import { Platform, StyleSheet } from 'react-native'

import type { useHoHTheme } from '@/providers'

export function createDashboardPeriodPickerStyles(theme: ReturnType<typeof useHoHTheme>) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end'
    },
    sheet: {
      backgroundColor: theme.semantic.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: Platform.OS === 'ios' ? 34 : 20
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: theme.semantic.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 8,
      marginBottom: 4
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.semantic.border
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.semantic.text
    },
    doneBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.semantic.primary,
      borderRadius: 8
    },
    doneBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF'
    },
    pickerContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16
    },
    pickerColumn: {
      flex: 1
    },
    picker: {
      height: 200
    },
    pickerItem: {
      fontSize: 18,
      color: theme.semantic.text
    }
  })
}

export type DashboardPeriodPickerStyles = ReturnType<typeof createDashboardPeriodPickerStyles>
