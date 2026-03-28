import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useImperativeHandle } from 'react'
import { Pressable, Text, View } from 'react-native'
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps
} from '@gorhom/bottom-sheet'

import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'
import { GRABBER_WIDTH, GRABBER_HEIGHT } from '@/shared/theme/tokens/viewStyles'

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
        <View style={{ alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.xs }}>
          <View
            style={{
              width: GRABBER_WIDTH,
              height: GRABBER_HEIGHT,
              borderRadius: GRABBER_HEIGHT / 2,
              backgroundColor: colors.textSecondary,
              opacity: 0.4
            }}
          />
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
        backgroundStyle={{ backgroundColor: colors.surface }}
        enablePanDownToClose
        onDismiss={handleDismiss}
      >
        <BottomSheetScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing['2xl']
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
              style={{
                backgroundColor: colors.surfaceAlt,
                borderRadius: radius.md,
                paddingVertical: spacing.md,
                alignItems: 'center',
                marginTop: spacing.lg
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.md,
                  fontWeight: fontWeight.semibold,
                  color: colors.text
                }}
              >
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
