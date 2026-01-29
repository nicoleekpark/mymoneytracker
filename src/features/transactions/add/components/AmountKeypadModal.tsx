import { useHoHTheme } from '@/providers'
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
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.semantic.background, paddingBottom: insets.bottom + 18 }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={{ color: theme.semantic.textSecondary, fontWeight: '800' }}>Cancel</Text>
          </Pressable>

          <Text style={{ color: theme.semantic.text, fontWeight: '900' }}>Amount</Text>

          <Pressable onPress={onClear} hitSlop={10}>
            <Text style={{ color: theme.semantic.primary, fontWeight: '900' }}>Clear</Text>
          </Pressable>
        </View>

        <View style={[styles.preview, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}>
          <Text style={{ color: theme.semantic.text, fontWeight: '900', fontSize: 36 }}>${amountDisplay}</Text>
        </View>

        <View style={styles.grid}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <Pressable
              key={d}
              onPress={() => onAppendDigit(d)}
              style={[styles.key, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
            >
              <Text style={{ color: theme.semantic.text, fontSize: 26, fontWeight: '900' }}>{d}</Text>
            </Pressable>
          ))}

          <View style={styles.keyEmpty} />

          <Pressable
            onPress={() => onAppendDigit('0')}
            style={[styles.key, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
          >
            <Text style={{ color: theme.semantic.text, fontSize: 26, fontWeight: '900' }}>0</Text>
          </Pressable>

          <Pressable
            onPress={onBackspace}
            style={[styles.key, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
          >
            <Text style={{ color: theme.semantic.text, fontSize: 18, fontWeight: '900' }}>⌫</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={onClose}
          style={[styles.doneBtn, { backgroundColor: theme.semantic.primarySoft, borderColor: theme.semantic.primarySoft }]}
        >
          <Text style={{ color: theme.semantic.primaryStrong, fontSize: 18, fontWeight: '900' }}>Done</Text>
        </Pressable>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  sheet: {
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  preview: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  key: {
    width: '31.5%',
    height: 58,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: {
    width: '31.5%',
    height: 58,
  },
  doneBtn: {
    width: '100%',
    height: 58,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
})
