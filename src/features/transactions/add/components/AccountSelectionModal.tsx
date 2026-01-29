import type { Account } from '@/domain/account'
import { useHoHTheme } from '@/providers'
import { Screen } from '@/shared/layout/Screen'
import React from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = Readonly<{
  visible: boolean
  accountKey: string
  accountQuery: string
  filteredAccounts: Account[]
  onQueryChange: (q: string) => void
  onClose: () => void
  onChoose: (key: string) => void
}>

export function AccountSelectionModal({
  visible,
  accountKey,
  accountQuery,
  filteredAccounts,
  onQueryChange,
  onClose,
  onChoose,
}: Props) {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <Screen edges={[]} padded={false} topPadding={false} style={{ flex: 1 }} contentStyle={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <View
            style={[
              styles.headerBar,
              {
                borderBottomColor: theme.semantic.border,
                paddingTop: insets.top,
                height: 52 + insets.top,
              },
            ]}
          >
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={{ color: theme.semantic.textSecondary, fontWeight: '800' }}>Cancel</Text>
            </Pressable>

            <Text style={{ color: theme.semantic.text, fontWeight: '900' }}>Payment method</Text>

            <View style={{ width: 56 }} />
          </View>

          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <View
              style={[
                styles.searchBox,
                { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface, marginBottom: 0 },
              ]}
            >
              <TextInput
                value={accountQuery}
                onChangeText={onQueryChange}
                placeholder="Search account"
                placeholderTextColor={theme.semantic.textSecondary}
                style={{ color: theme.semantic.text, fontWeight: '700' }}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                blurOnSubmit={false}
              />
            </View>
          </View>

          <FlatList
            style={{ flex: 1 }}
            data={filteredAccounts}
            keyExtractor={(a) => a.key}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 24 }}
            renderItem={({ item: a }) => {
              const selected = a.key === accountKey
              const badge = `${a.kind}${a.nature === 'liability' ? ' • liability' : ''}`
              return (
                <Pressable onPress={() => onChoose(a.key)} style={[styles.row, { borderBottomColor: theme.semantic.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: theme.semantic.text, fontWeight: '900' }}>{a.name}</Text>
                    <Text style={{ color: theme.semantic.textSecondary, fontWeight: '800', fontSize: 12 }}>{badge}</Text>
                  </View>

                  <Text style={{ color: selected ? theme.semantic.primary : theme.semantic.textSecondary, fontWeight: '900' }}>
                    {selected ? '✓' : ''}
                  </Text>
                </Pressable>
              )
            }}
          />
        </KeyboardAvoidingView>
      </Screen>
    </Modal>
  )
}

const styles = StyleSheet.create({
  headerBar: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  searchBox: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  row: {
    height: 52,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})
