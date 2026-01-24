import { APP_CONFIG } from '@/config'
import {
  countRows,
  listTables,
  resetDbDataOnly,
  seedDbMinimal,
} from '@/infrastructure/db/queries/admin'
import { exportDatabase } from '@/infrastructure/db/queries/export-db'
import { runFixtures } from '@/infrastructure/db/seed'

import { useHoHTheme } from '@/providers'
import React, { useMemo, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type ResetMode = 'dataOnly' | 'dataAndResetIds'
type SeedMode = 'seedOnly' | 'resetThenSeed'
type DbEnv = 'dev' | 'prod'

const DEV_SERVER_BASE_URL = 'http://127.0.0.1:3333'

async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit = {},
  timeoutMs = 800
): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

async function runDbPull(env: DbEnv = 'dev') {
  if (!__DEV__) {
    Alert.alert('Disabled', 'Dev only')
    return
  }

  try {
    const health = await fetchWithTimeout(`${DEV_SERVER_BASE_URL}/health`, { method: 'GET' }, 800)
    if (!health.ok) throw new Error(`Health check failed (${health.status})`)

    const res = await fetchWithTimeout(
      `${DEV_SERVER_BASE_URL}/dbpull`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ env }),
      },
      20_000
    )

    const json = await res.json().catch(() => ({} as any))

    if (!res.ok) {
      throw new Error(json?.error || `DB pull failed (${res.status})`)
    }

    Alert.alert('DB Pull', json?.output || 'Done')
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    Alert.alert('DB Pull failed', `Make sure dev server is running:\n\nnpm run dev:dbserver\n\n${msg}`)
  }
}

function summarizeFixtureReport(report: any): string {
  if (!report || typeof report !== 'object') return 'Done'

  // allow flexible report shapes (너 runFixtures 구현이 어떤 형태든 최소한 보여주게)
  const lines: string[] = []

  if (report.startedAt) lines.push(`startedAt: ${report.startedAt}`)
  if (report.finishedAt) lines.push(`finishedAt: ${report.finishedAt}`)

  // common shape: report.fixtures[accounts|transactions] = { inserted, updated, deleted, skipped, conflicts }
  const fixtures = report.fixtures ?? report

  const pick = (x: any, k: string) => (x && typeof x[k] === 'number' ? x[k] : 0)

  const maybeAdd = (name: string, obj: any) => {
    if (!obj || typeof obj !== 'object') return
    const inserted = pick(obj, 'inserted')
    const updated = pick(obj, 'updated')
    const deleted = pick(obj, 'deleted')
    const skipped = pick(obj, 'skipped')
    const conflicts = pick(obj, 'conflicts')

    // only show if anything non-zero or if object exists
    lines.push(
      `${name}: +${inserted} ~${updated} -${deleted} =${skipped} !${conflicts}`
    )
  }

  maybeAdd('accounts', fixtures.accounts)
  maybeAdd('transactions', fixtures.transactions)

  return lines.length ? lines.join('\n') : 'Done'
}

export function DevToolsOverlay() {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const [open, setOpen] = useState(false)

  if (!APP_CONFIG.featureFlags.devTools) return null

  const colors = useMemo(
    () => ({
      border: theme.semantic.border,
      surface: theme.semantic.surface,
      bg: theme.semantic.background,
      text: theme.semantic.text,
      text2: theme.semantic.textSecondary,
      primary: theme.semantic.primary,
    }),
    [theme]
  )

  const runSnapshot = () => {
    try {
      const tables = listTables()
      const sample = tables
        .slice(0, 10)
        .map(t => `${t}: ${countRows(t)}`)
        .join('\n')

      Alert.alert('DB snapshot', sample || 'no tables')
    } catch (e: any) {
      Alert.alert('Snapshot failed', String(e?.message ?? e))
    }
  }

  const runReset = (mode: ResetMode) => {
    try {
      resetDbDataOnly({ resetAutoIncrement: mode === 'dataAndResetIds' })
      Alert.alert(
        'Reset DB',
        mode === 'dataAndResetIds'
          ? 'All rows deleted. IDs reset.'
          : 'All rows deleted. IDs preserved.'
      )
    } catch (e: any) {
      Alert.alert('Reset failed', String(e?.message ?? e))
    }
  }

  const confirmReset = () => {
    Alert.alert('Reset DB', 'Choose reset mode', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Data only', onPress: () => runReset('dataOnly') },
      {
        text: 'Data + Reset IDs',
        style: 'destructive',
        onPress: () => runReset('dataAndResetIds'),
      },
    ])
  }

  const runSeed = (mode: SeedMode) => {
    try {
      if (mode === 'resetThenSeed') {
        resetDbDataOnly({ resetAutoIncrement: false })
      }
      seedDbMinimal()
      Alert.alert('Seed DB', mode === 'resetThenSeed' ? 'Reset + seed completed' : 'Seed completed')
    } catch (e: any) {
      Alert.alert('Seed failed', String(e?.message ?? e))
    }
  }

  const confirmSeed = () => {
    Alert.alert('Seed DB', 'Choose seed mode', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Seed only', onPress: () => runSeed('seedOnly') },
      {
        text: 'Reset (data only) + Seed',
        style: 'destructive',
        onPress: () => runSeed('resetThenSeed'),
      },
    ])
  }

  // -------- Fixtures (JSON-driven) --------
  const runFixtureAction = (mode: 'seed' | 'delete', targets: Array<'accounts' | 'transactions'>) => {
    try {
      const report = runFixtures(mode, targets)
      Alert.alert(
        mode === 'seed' ? 'Fixtures seeded' : 'Fixtures deleted',
        summarizeFixtureReport(report)
      )
    } catch (e: any) {
      Alert.alert('Fixtures failed', String(e?.message ?? e))
    }
  }

  // top-left, stays out of the way
  const top = Math.max(8, insets.top + 6)
  const left = Math.max(8, insets.left + 8)

  return (
    <View pointerEvents="box-none" style={[styles.root, { top, left }]}>
      <View style={[styles.panel, { borderColor: colors.border }]}>
        <Pressable
          onPress={() => setOpen(v => !v)}
          style={[
            styles.chip,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          accessibilityLabel="Toggle dev tools"
          hitSlop={10}
        >
          <Text style={[styles.chipText, { color: colors.text }]}>
            DEV {open ? '▾' : '▸'}
          </Text>
        </Pressable>

        {open && (
          <View
            style={[
              styles.body,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <DevBtn label="Snapshot" onPress={runSnapshot} colors={colors} />

            {/* ✅ Fixtures section (4 buttons) */}
            <View style={[styles.sectionHeader, { borderTopColor: colors.border }]}>
              <Text style={{ color: colors.text2, fontWeight: '800', fontSize: 12 }}>
                Fixtures
              </Text>
            </View>

            <DevBtn
              label="Seed Accounts"
              onPress={() => runFixtureAction('seed', ['accounts'])}
              colors={colors}
            />
            <DevBtn
              label="Seed Transactions"
              onPress={() => runFixtureAction('seed', ['transactions'])}
              colors={colors}
            />
            <DevBtn
              label="Seed All"
              onPress={() => runFixtureAction('seed', ['accounts', 'transactions'])}
              colors={colors}
            />
            <DevBtn
              label="Delete All"
              onPress={() => runFixtureAction('delete', ['accounts', 'transactions'])}
              colors={colors}
            />

            {/* ✅ DB Pull split into explicit env buttons (simple + clear) */}
            <View style={[styles.row2, { borderTopColor: colors.border }]}>
              <DevBtn
                label="DB Pull (dev)"
                onPress={() => runDbPull('dev')}
                colors={colors}
                compact
              />
              <DevBtn
                label="DB Pull (prod)"
                onPress={() => runDbPull('prod')}
                colors={colors}
                compact
              />
            </View>

            <DevBtn label="Export" onPress={exportDatabase} colors={colors} />
            <DevBtn label="Reset" onPress={confirmReset} colors={colors} />
            <DevBtn label="Seed" onPress={confirmSeed} colors={colors} />

            <Pressable
              onPress={() => setOpen(false)}
              style={[styles.closeRow, { borderTopColor: colors.border }]}
              accessibilityLabel="Close dev tools"
            >
              <Text style={{ color: colors.text2, fontWeight: '700', fontSize: 12 }}>
                Close
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  )
}

function DevBtn({
  label,
  onPress,
  colors,
  compact
}: {
  label: string
  onPress: () => void
  colors: {
    border: string
    surface: string
    bg: string
    text: string
    text2: string
    primary: string
  }
  compact?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.btn,
        compact && styles.btnCompact,
        {
          borderColor: colors.border,
          backgroundColor: colors.bg,
        },
      ]}
      accessibilityLabel={label}
    >
      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 12 }}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    zIndex: 9999,
  },

  panel: {
    alignItems: 'flex-start',
  },

  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  body: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 190,
  },

  sectionHeader: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 2,
    borderTopWidth: 1,
  },

  btn: {
    margin: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnCompact: {
    margin: 8,
    flex: 1,
  },

  row2: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 0,
  },

  closeRow: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
  },
})
