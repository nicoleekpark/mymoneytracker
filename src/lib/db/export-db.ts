import { getMainDbFilePath } from '@/lib/db/sqlite'
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'

function toFileUri(path: string): string {
  return path.startsWith('file://') ? path : `file://${path}`
}

export async function exportDatabase(): Promise<void> {
  const dbPath = getMainDbFilePath()
  if (!dbPath) {
    throw new Error('SQLite DB file path not found')
  }

  const sourceUri = toFileUri(dbPath)

  const timestamp = new Date().toISOString().replaceAll(':', '-')
  const destFile = new File(Paths.cache, `hoh_finance_${timestamp}.db`)
  
  const sourceFile = new File(sourceUri)

  try {
    sourceFile.copy(destFile)
  } catch (e) {
    throw new Error('Failed to copy SQLite database file')
  }

  const ok = await Sharing.isAvailableAsync()
  if (!ok) {
    throw new Error('Sharing is not available on this device')
  }

  await Sharing.shareAsync(destFile.uri, {
    mimeType: 'application/vnd.sqlite3',
    dialogTitle: 'Export SQLite DB'
  })

}
