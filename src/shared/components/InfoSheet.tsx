import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { modalStyles } from '@/shared/theme/tokens/modal'
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
  /** Fixed snap points - defaults to ['90%'] for full height */
  snapPoints?: string[]
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
      snapPoints: customSnapPoints,
    },
    ref
  ) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null)
    const insets = useSafeAreaInsets()
    // Full height like other modals
    const snapPoints = customSnapPoints ?? ['90%']

    // Expose present/dismiss methods
    useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.present(),
      dismiss: () => bottomSheetRef.current?.dismiss(),
    }))

    // Present/dismiss based on visible prop
    useEffect(() => {
      if (visible) {
        bottomSheetRef.current?.present()
      } else {
        bottomSheetRef.current?.dismiss()
      }
    }, [visible])

    // Handle sheet dismissal
    const handleDismiss = useCallback(() => {
      onClose()
    }, [onClose])

    // Backdrop
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      ),
      []
    )

    // Custom handle with grabber
    const renderHandle = useCallback(
      () => (
        <View style={modalStyles.dragHandleContainer}>
          <View
            style={[
              modalStyles.dragHandle,
              { backgroundColor: colors.textSecondary, opacity: 0.4 },
            ]}
          />
        </View>
      ),
      [colors.textSecondary]
    )

    // Footer with fixed close button
    const renderFooter = useCallback(
      (props: BottomSheetFooterProps) => {
        if (!showCloseButton) return null

        return (
          <BottomSheetFooter {...props} bottomInset={0}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderTopWidth: 1,
                borderTopColor: colors.textSecondary + '20',
                paddingHorizontal: spacing.xl,
                paddingTop: spacing.md,
                paddingBottom: Math.max(insets.bottom, spacing.lg),
              }}
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
          </BottomSheetFooter>
        )
      },
      [showCloseButton, colors, insets.bottom, onClose, closeButtonText]
    )

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        bottomInset={0}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        footerComponent={renderFooter}
        backgroundStyle={[
          modalStyles.modal,
          {
            backgroundColor: colors.surface,
            borderWidth: 0,
            shadowOpacity: 0,
            elevation: 0,
          },
        ]}
        enablePanDownToClose
        onDismiss={handleDismiss}
      >
        {/* Header with Close button */}
        <View style={[modalStyles.header, { borderBottomWidth: 0 }]}>
          <Pressable onPress={onClose} hitSlop={12} style={modalStyles.cancelButton}>
            <Text style={[modalStyles.cancelText, { color: colors.textSecondary }]}>Close</Text>
          </Pressable>
        </View>

        {/* Title - Center aligned */}
        <View
          style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.lg, alignItems: 'center' }}
        >
          <Text
            style={{
              fontSize: fontSize.lg,
              fontWeight: fontWeight.bold,
              color: colors.text,
            }}
          >
            {title}
          </Text>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing.xl,
          }}
        >
          {/* Content */}
          {children}
        </BottomSheetScrollView>
      </BottomSheetModal>
    )
  }
)

InfoSheet.displayName = 'InfoSheet'
