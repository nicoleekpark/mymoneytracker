import { useHoHTheme } from '@/shared/providers'
import { displaySize, fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import React from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = Readonly<{
  visible: boolean
  amountDisplay: string
  onClose: () => void
  onClear: () => void
  onAppendDigit: (d: string) => void
  onBackspace: () => void
}>

export function AmountKeypadModal({
  visible,
  amountDisplay,
  onClose,
  onClear,
  onAppendDigit,
  onBackspace,
}: Props) {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Backdrop - tap to dismiss */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Sheet */}
      <View style={[styles.sheet, { backgroundColor: theme.semantic.surface, borderColor: theme.semantic.border, paddingBottom: insets.bottom + spacing.lg }]}>
        {/* Drag Handle */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: theme.semantic.border }]} />
        </View>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.semantic.border }]}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={[styles.headerLink, { color: theme.semantic.primary }]}>Cancel</Text>
          </Pressable>

          <Text style={[styles.headerTitle, { color: theme.semantic.text }]}>Amount</Text>

          <Pressable onPress={onClear} hitSlop={10}>
            <Text style={[styles.headerLink, { color: theme.semantic.primary }]}>Clear</Text>
          </Pressable>
        </View>

        {/* Amount Display */}
        <View style={[styles.display, { backgroundColor: theme.semantic.surfaceAlt, borderColor: theme.semantic.border }]}>
          <Text style={[styles.displayAmount, { color: theme.semantic.text }]}>${amountDisplay}</Text>
        </View>

        {/* Keypad Grid */}
        <View style={styles.grid}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <Pressable
              key={d}
              onPress={() => onAppendDigit(d)}
              style={({ pressed }) => [
                styles.key,
                {
                  backgroundColor: pressed ? theme.semantic.surfaceAlt : 'rgba(255,255,255,0.03)',
                  borderColor: theme.semantic.border,
                }
              ]}
            >
              <Text style={[styles.keyText, { color: theme.semantic.text }]}>{d}</Text>
            </Pressable>
          ))}

          {/* Wide 0 key */}
          <Pressable
            onPress={() => onAppendDigit('0')}
            style={({ pressed }) => [
              styles.key,
              styles.keyWide,
              {
                backgroundColor: pressed ? theme.semantic.surfaceAlt : 'rgba(255,255,255,0.03)',
                borderColor: theme.semantic.border,
              }
            ]}
          >
            <Text style={[styles.keyText, { color: theme.semantic.text }]}>0</Text>
          </Pressable>

          {/* Backspace key */}
          <Pressable
            onPress={onBackspace}
            style={({ pressed }) => [
              styles.key,
              {
                backgroundColor: pressed ? theme.semantic.surfaceAlt : 'rgba(255,255,255,0.03)',
                borderColor: theme.semantic.border,
              }
            ]}
          >
            <Text style={[styles.keyText, { color: theme.semantic.text }]}>⌫</Text>
          </Pressable>
        </View>

        {/* Done Button */}
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.doneBtn,
            {
              backgroundColor: theme.semantic.primary,
              opacity: pressed ? 0.8 : 1,
            }
          ]}
        >
          <Text style={[styles.doneBtnText, { color: theme.semantic.onPrimary }]}>Done</Text>
        </Pressable>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  handleContainer: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: radius.full,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerLink: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.heavy,
  },
  display: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  displayAmount: {
    fontSize: displaySize.md,
    fontWeight: fontWeight.black,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  key: {
    width: '31%',
    height: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyWide: {
    width: '64.5%',
  },
  keyText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.heavy,
  },
  doneBtn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
  },
})
