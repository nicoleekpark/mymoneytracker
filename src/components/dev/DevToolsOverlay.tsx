import { APP_CONFIG } from '@/config'
import { countRows, listTables, resetDbDataOnly, seedDbMinimal } from '@/lib/db/admin'
import { exportDatabase } from '@/lib/db/export-db'
import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'

export function DevToolsOverlay() {
  const [open, setOpen] = useState(false)

  if (!APP_CONFIG.featureFlags.devTools) return null

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.panel}>
        <Pressable
          onPress={() => setOpen(v => !v)}
          style={styles.header}
        >
          <Text style={styles.headerText}>
            Dev Tools {open ? '▾' : '▸'}
          </Text>
        </Pressable>

        {open && (
          <View style={styles.body}>
            <Pressable
              style={styles.btn}
              onPress={() => {
                try {
                  const tables = listTables()
                  const sample = tables.slice(0, 5).map(t => `${t}:${countRows(t)}`).join('\n')
                  Alert.alert('DB snapshot', sample || 'no tables')
                } catch (e: any) {
                  Alert.alert('Snapshot failed', String(e?.message ?? e))
                }
              }}
            >
              <Text style={styles.btnText}>DB Snapshot</Text>
            </Pressable>
            <Pressable
              style={styles.btn}
              onPress={exportDatabase}
            >
              <Text style={styles.btnText}>Export DB</Text>
            </Pressable>

            <Pressable
              style={styles.btn}
              onPress={() => {
                Alert.alert(
                  'Reset DB',
                  'Choose reset mode',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Data only',
                      onPress: () => {
                        try {
                          resetDbDataOnly({ resetAutoIncrement: false })
                          Alert.alert('Reset DB', 'All rows deleted. IDs preserved.')
                        } catch (e: any) {
                          Alert.alert('Reset failed', String(e?.message ?? e))
                        }
                      },
                    },
                    {
                      text: 'Data + Reset IDs',
                      style: 'destructive',
                      onPress: () => {
                        try {
                          resetDbDataOnly({ resetAutoIncrement: true })
                          Alert.alert('Reset DB', 'All rows deleted. IDs reset.')
                        } catch (e: any) {
                          Alert.alert('Reset failed', String(e?.message ?? e))
                        }
                      },
                    },
                  ]
                )
              }}
            >
              <Text style={styles.btnText}>Reset DB</Text>
            </Pressable>

            <Pressable
              style={styles.btn}
              onPress={() => {
                try {
                  seedDbMinimal()
                  Alert.alert('Seed DB', 'Seed completed')
                } catch (e: any) {
                  Alert.alert('Seed failed', String(e?.message ?? e))
                }
              }}
            >
              <Text style={styles.btnText}>Seed DB</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    alignItems: 'center',
  },
  panel: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  body: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
  },
})
