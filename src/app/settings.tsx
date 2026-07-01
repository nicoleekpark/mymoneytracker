import React, { useState, useEffect, useRef } from 'react'
import { Text, View, Switch, TextInput, ScrollView, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useHoHTheme } from '@/shared/providers'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'
import { useThemeStore, useSettingsStore } from '@/shared/store'
import type { ThemeMode } from '@/shared/theme'
import { Divider } from '@/shared/components'

type ThemeSelection = ThemeMode | 'system'

const THEME_OPTIONS: { value: ThemeSelection; label: string; description: string }[] = [
  { value: 'system', label: 'System', description: 'Match device settings' },
  { value: 'light', label: 'Light', description: 'Always use light mode' },
  { value: 'dark', label: 'Dark', description: 'Always use dark mode' },
]

export default function SettingsScreen() {
  const theme = useHoHTheme()
  const router = useRouter()
  const isDarkMode = theme.mode === 'dark'

  // Theme settings
  const mode = useThemeStore((t) => t.mode) // ThemeMode | null
  const setMode = useThemeStore((t) => t.setMode)

  // Budget settings
  const budgetAlertEnabled = useSettingsStore((s) => s.budgetAlertEnabled)
  const budgetAlertThreshold = useSettingsStore((s) => s.budgetAlertThreshold)
  const monthlyBudget = useSettingsStore((s) => s.monthlyBudget)
  const setBudgetAlertEnabled = useSettingsStore((s) => s.setBudgetAlertEnabled)
  const setBudgetAlertThreshold = useSettingsStore((s) => s.setBudgetAlertThreshold)
  const setMonthlyBudget = useSettingsStore((s) => s.setMonthlyBudget)

  // Local state for inputs
  const [budgetInput, setBudgetInput] = useState(String(monthlyBudget / 100))
  const [thresholdInput, setThresholdInput] = useState(String(budgetAlertThreshold))

  // Track if user has started editing (to prevent overwriting during typing)
  const hasEditedBudget = useRef(false)
  const hasEditedThreshold = useRef(false)

  // Sync input state when store values change (e.g., after hydration), but not if user edited
  useEffect(() => {
    if (!hasEditedBudget.current) {
      setBudgetInput(String(monthlyBudget / 100))
    }
  }, [monthlyBudget])

  useEffect(() => {
    if (!hasEditedThreshold.current) {
      setThresholdInput(String(budgetAlertThreshold))
    }
  }, [budgetAlertThreshold])

  // Debounced auto-save for budget (500ms after typing stops)
  useEffect(() => {
    if (!hasEditedBudget.current) return // Skip initial render

    const timer = setTimeout(() => {
      const value = parseFloat(budgetInput)
      if (!isNaN(value) && value >= 0) {
        const newBudgetCents = Math.round(value * 100)
        if (newBudgetCents !== monthlyBudget) {
          setMonthlyBudget(newBudgetCents)
        }
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [budgetInput, monthlyBudget, setMonthlyBudget])

  // Debounced auto-save for threshold (500ms after typing stops)
  useEffect(() => {
    if (!hasEditedThreshold.current) return // Skip initial render

    const timer = setTimeout(() => {
      const value = parseInt(thresholdInput, 10)
      if (!isNaN(value) && value >= 0 && value <= 100) {
        if (value !== budgetAlertThreshold) {
          setBudgetAlertThreshold(value)
        }
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [thresholdInput, budgetAlertThreshold, setBudgetAlertThreshold])

  const selection: ThemeSelection = mode ?? 'system'

  const onThemeChange = (next: ThemeSelection) => {
    if (next === 'system') setMode(null)
    else setMode(next)
  }

  // Mark as edited when user types (enables debounced auto-save)
  const handleBudgetChange = (text: string) => {
    hasEditedBudget.current = true
    setBudgetInput(text)
  }

  const handleThresholdChange = (text: string) => {
    hasEditedThreshold.current = true
    setThresholdInput(text)
  }

  const inputStyle = {
    backgroundColor: theme.semantic.surfaceAlt,
    color: theme.semantic.text,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    minWidth: 80,
    textAlign: 'right' as const,
  }

  // Theme list container - use surfaceAlt in dark mode, border in light mode
  const themeListStyle = isDarkMode
    ? { backgroundColor: theme.semantic.surfaceAlt, borderRadius: radius.lg, overflow: 'hidden' as const }
    : { borderWidth: 1, borderColor: theme.semantic.border, borderRadius: radius.lg, overflow: 'hidden' as const }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.semantic.background }}>
      {/* Header with back button */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={{ padding: spacing.xs }}
        >
          <Ionicons name="chevron-back" size={24} color={theme.semantic.text} />
        </Pressable>
        <Text style={{ color: theme.semantic.text, fontSize: fontSize.lg, fontWeight: fontWeight.semibold, marginLeft: spacing.xs }}>
          Settings
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: spacing.lg, paddingTop: spacing.sm }}>
          {/* Theme Section */}
          <Text style={{ color: theme.semantic.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.heavy, marginBottom: spacing.md }}>
            Theme
          </Text>
          <View style={themeListStyle}>
            {THEME_OPTIONS.map((option, index) => {
              const isSelected = selection === option.value
              const isLast = index === THEME_OPTIONS.length - 1
              return (
                <Pressable
                  key={option.value}
                  onPress={() => onThemeChange(option.value)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: theme.semantic.border,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.semantic.text, fontSize: fontSize.md }}>
                      {option.label}
                    </Text>
                    <Text style={{ color: theme.semantic.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
                      {option.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color={theme.semantic.primary} />
                  )}
                </Pressable>
              )
            })}
          </View>

        <Divider style={{ marginVertical: spacing.xl }} />

        {/* Budget Section */}
        <Text style={{ color: theme.semantic.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.heavy, marginBottom: spacing.md }}>
          Budget Alerts
        </Text>

        {/* Enable/Disable Toggle */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
          <Text style={{ color: theme.semantic.text, fontSize: fontSize.md }}>
            Enable budget alerts
          </Text>
          <Switch
            value={budgetAlertEnabled}
            onValueChange={setBudgetAlertEnabled}
            trackColor={{ false: theme.semantic.surfaceAlt, true: theme.semantic.primary }}
          />
        </View>

        {/* Monthly Budget Input */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, opacity: budgetAlertEnabled ? 1 : 0.5 }}>
          <Text style={{ color: theme.semantic.text, fontSize: fontSize.md }}>
            Monthly budget
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: theme.semantic.textSecondary, fontSize: fontSize.md, marginRight: spacing.xs }}>$</Text>
            <TextInput
              style={inputStyle}
              value={budgetInput}
              onChangeText={handleBudgetChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.semantic.textSecondary}
              editable={budgetAlertEnabled}
            />
          </View>
        </View>

        {/* Alert Threshold Input */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, opacity: budgetAlertEnabled ? 1 : 0.5 }}>
          <View style={{ flex: 1, marginRight: spacing.md }}>
            <Text style={{ color: theme.semantic.text, fontSize: fontSize.md }}>
              Alert threshold
            </Text>
            <Text style={{ color: theme.semantic.textSecondary, fontSize: fontSize.xs, marginTop: spacing.xs }}>
              Get notified when spending reaches this % of budget
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={inputStyle}
              value={thresholdInput}
              onChangeText={handleThresholdChange}
              keyboardType="numeric"
              placeholder="80"
              placeholderTextColor={theme.semantic.textSecondary}
              editable={budgetAlertEnabled}
            />
            <Text style={{ color: theme.semantic.textSecondary, fontSize: fontSize.md, marginLeft: spacing.xs }}>%</Text>
          </View>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
