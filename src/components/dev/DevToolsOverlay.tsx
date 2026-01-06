import { APP_CONFIG } from '@/config'
import { exportDatabase } from '@/lib/db/export-db'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

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
              onPress={exportDatabase}
            >
              <Text style={styles.btnText}>Export DB</Text>
            </Pressable>

            <Pressable
              style={styles.btn}
              onPress={() => {
                // TODO
                console.log('reset db')
              }}
            >
              <Text style={styles.btnText}>Reset DB</Text>
            </Pressable>

            <Pressable
              style={styles.btn}
              onPress={() => {
                // TODO
                console.log('seed db')
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
