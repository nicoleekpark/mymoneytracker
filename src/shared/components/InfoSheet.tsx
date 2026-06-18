import React, { forwardRef, useImperativeHandle } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { modalStyles } from '@/shared/theme/tokens/modal'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'

export type InfoSheetColors = {
  surface: string
  text: string
  textSecondary: string
  surfaceAlt: string
  primary?: string
}

export type InfoSheetRef = {
  present: () => void
  dismiss: () => void
}

type Props = {
  visible: boolean
  onClose: () => void
  title: string
  colors: InfoSheetColors
  children: React.ReactNode
  showCloseButton?: boolean
  closeButtonText?: string
}

export const InfoSheet = forwardRef<InfoSheetRef, Props>(
  (
    {
      visible,
      onClose,
      title,
      colors,
      children,
      showCloseButton = true,
      closeButtonText = 'Got it',
    },
    ref
  ) => {
    const insets = useSafeAreaInsets()

    // Expose present/dismiss methods for compatibility
    useImperativeHandle(ref, () => ({
      present: () => {}, // No-op, controlled by visible prop
      dismiss: () => onClose(),
    }))

    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Drag Handle */}
          <View style={modalStyles.dragHandleContainer}>
            <View
              style={[
                modalStyles.dragHandle,
                { backgroundColor: colors.textSecondary, opacity: 0.4 },
              ]}
            />
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + (showCloseButton ? 100 : spacing.xl) },
            ]}
          >
            {children}
          </ScrollView>

          {/* Footer with close button */}
          {showCloseButton && (
            <View
              style={[
                styles.footer,
                {
                  backgroundColor: colors.surface,
                  borderTopColor: colors.textSecondary + '20',
                  paddingBottom: Math.max(insets.bottom, spacing.lg),
                },
              ]}
            >
              <Pressable
                onPress={onClose}
                style={[
                  modalStyles.saveButton,
                  { backgroundColor: colors.primary ?? colors.surfaceAlt },
                ]}
              >
                <Text
                  style={[
                    modalStyles.saveButtonText,
                    { color: colors.primary ? '#fff' : colors.text },
                  ]}
                >
                  {closeButtonText}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
    )
  }
)

InfoSheet.displayName = 'InfoSheet'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
  },
  titleContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
})
