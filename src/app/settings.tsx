import React, { useMemo, useState } from 'react'
import { Text, View, Switch, TextInput, ScrollView } from 'react-native'

import { useHoHTheme } from '@/shared/providers'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { useThemeStore, useSettingsStore } from '@/shared/store'
import type { ThemeMode } from '@/shared/theme'
import { SegmentedControl } from '@/shared/components/SegmentedControl'
import { Divider } from '@/shared/components'

type ThemeSelection = ThemeMode | 'system'

export default function SettingsScreen() {
  const theme = useHoHTheme()

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

  // Local state for budget input (allows editing without instant persistence)
  const [budgetInput, setBudgetInput] = useState(
    monthlyBudget > 0 ? String(monthlyBudget / 100) : ''
  )
  const [thresholdInput, setThresholdInput] = useState(String(budgetAlertThreshold))

  const selection: ThemeSelection = mode ?? 'system'

  const themeOptions = useMemo(
    () => [
      { label: 'Light', value: 'light' as const },
      { label: 'Dark', value: 'dark' as const },
      { label: 'System', value: 'system' as const }
    ],
    []
  )

  const onThemeChange = (next: ThemeSelection) => {
    if (next === 'system') setMode(null)
    else setMode(next)
  }

  const handleBudgetBlur = () => {
    const value = parseFloat(budgetInput)
    if (!isNaN(value) && value >= 0) {
      setMonthlyBudget(Math.round(value * 100))
    } else {
      setBudgetInput(monthlyBudget > 0 ? String(monthlyBudget / 100) : '')
    }
  }

  const handleThresholdBlur = () => {
    const value = parseInt(thresholdInput, 10)
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setBudgetAlertThreshold(value)
    } else {
      setThresholdInput(String(budgetAlertThreshold))
    }
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.semantic.background }}>
      <View style={{ padding: spacing.lg }}>
        <Text style={{ color: theme.semantic.text, fontSize: fontSize['2xl'], fontWeight: fontWeight.black, marginBottom: spacing.md }}>
          Settings
        </Text>

        {/* Theme Section */}
        <Text style={{ color: theme.semantic.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.heavy, marginBottom: spacing.sm }}>
          Theme
        </Text>
        <SegmentedControl value={selection} onChange={onThemeChange} options={themeOptions} />

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
              onChangeText={setBudgetInput}
              onBlur={handleBudgetBlur}
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
              onChangeText={setThresholdInput}
              onBlur={handleThresholdBlur}
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
  )
}
