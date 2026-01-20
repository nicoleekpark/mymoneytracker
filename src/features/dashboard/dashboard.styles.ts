import type { useHoHTheme } from '@/providers'
import { StyleSheet } from 'react-native'

export type DashboardStyles = ReturnType<typeof createDashboardStyles>

export function createDashboardStyles(theme: ReturnType<typeof useHoHTheme>) {
  const onPrimary = '#FFFFFF'

  return StyleSheet.create({
    modeRow: { paddingBottom: 10 },

    pill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      marginRight: 8,
      backgroundColor: theme.semantic.surface,
      borderColor: theme.semantic.border
    },
    pillSelected: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      marginRight: 8,
      backgroundColor: theme.semantic.primary,
      borderColor: theme.semantic.primary
    },
    pillText: { color: theme.semantic.text, fontSize: 13, fontWeight: '600' },
    pillTextSelected: { color: onPrimary, fontSize: 13, fontWeight: '700' },

    scopeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 12,
      gap: 10
    },

    segment: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: theme.semantic.border,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: theme.semantic.surface
    },
    segmentBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'transparent' },
    segmentBtnSelected: { backgroundColor: theme.semantic.surfaceAlt },
    segmentText: { color: theme.semantic.text, fontSize: 13, fontWeight: '600' },

    periodControls: { flexDirection: 'row', alignItems: 'center', minWidth: 0 },
    iconBtn: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.semantic.border,
      backgroundColor: theme.semantic.surface
    },
    iconBtnLeft: { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
    iconBtnRight: { borderTopRightRadius: 10, borderBottomRightRadius: 10 },
    iconBtnText: { color: theme.semantic.text, fontSize: 12, fontWeight: '700' },

    periodBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.semantic.border,
      backgroundColor: theme.semantic.surface
    },
    periodBtnText: { color: theme.semantic.text, fontSize: 13, fontWeight: '600' },

    divider: { height: 1, backgroundColor: theme.semantic.border },
    body: { flex: 1, paddingTop: 14 }
  })
}
