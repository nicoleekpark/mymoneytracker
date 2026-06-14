import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useImperativeHandle } from 'react'
import { Pressable, Text, View } from 'react-native'
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps
} from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'
import { modalStyles, getScrollContentPadding } from '@/shared/theme/tokens/modal'

export type InfoSheetColors = {
  surface: string
  text: string
  textSecondary: string
  surfaceAlt: string
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
      snapPoints: customSnapPoints
    },
    ref
  ) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null)
    const insets = useSafeAreaInsets()
    const snapPoints = useMemo(() => customSnapPoints || ['50%'], [customSnapPoints])

    // Expose present/dismiss methods
    useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.present(),
      dismiss: () => bottomSheetRef.current?.dismiss()
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
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    )

    // Custom handle with grabber
    const renderHandle = useCallback(
      () => (
        <View style={modalStyles.dragHandleContainer}>
          <View style={[modalStyles.dragHandle, { backgroundColor: colors.textSecondary, opacity: 0.4 }]} />
        </View>
      ),
      [colors.textSecondary]
    )

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        backgroundStyle={[modalStyles.modal, { backgroundColor: colors.surface }]}
        enablePanDownToClose
        onDismiss={handleDismiss}
      >
        <BottomSheetScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: spacing.xl,
            paddingBottom: getScrollContentPadding(insets.bottom)
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontSize: fontSize.lg,
              fontWeight: fontWeight.bold,
              color: colors.text,
              marginBottom: spacing.lg
            }}
          >
            {title}
          </Text>

          {/* Content */}
          {children}

          {/* Close button */}
          {showCloseButton && (
            <Pressable
              onPress={onClose}
              style={[
                modalStyles.saveButton,
                { backgroundColor: colors.surfaceAlt, marginTop: spacing.lg }
              ]}
            >
              <Text style={[modalStyles.saveButtonText, { color: colors.text }]}>
                {closeButtonText}
              </Text>
            </Pressable>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    )
  }
)

InfoSheet.displayName = 'InfoSheet'
