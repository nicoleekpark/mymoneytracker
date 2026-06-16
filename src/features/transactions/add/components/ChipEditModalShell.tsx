/**
 * ChipEditModalShell
 *
 * Reusable shell for chip edit/reorder modals.
 * Provides: Modal, backdrop, sheet, header (title + Done), ScrollView wrapper.
 */

import { useHoHTheme } from '@/shared/providers'
import { chipEditStyles, getSheetBottomPadding } from '@/shared/theme/tokens/modal'
import React from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  type ScrollViewProps,
  Text,
  View,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = {
  visible: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

export function ChipEditModalShell({ visible, title, onClose, children }: Props) {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <GestureHandlerRootView style={chipEditStyles.gestureRoot}>
        <Pressable style={chipEditStyles.backdrop} onPress={onClose} />

        <View style={[chipEditStyles.sheet, { backgroundColor: theme.semantic.surface, paddingBottom: getSheetBottomPadding(insets.bottom) }]}>
          {/* Header */}
          <View style={[chipEditStyles.header, { borderBottomColor: theme.semantic.border }]}>
            <Text style={[chipEditStyles.headerTitle, { color: theme.semantic.text }]}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={[chipEditStyles.headerDone, { color: theme.semantic.primary }]}>Done</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={chipEditStyles.content}
            showsVerticalScrollIndicator={false}
            {...({ delaysContentTouches: false } as ScrollViewProps)}
          >
            {children}
          </ScrollView>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}
