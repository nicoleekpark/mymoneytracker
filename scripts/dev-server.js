import { spawn } from 'child_process'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
app.use(express.json())

const HOST = process.env.DB_DEV_HOST || '127.0.0.1'
const PORT = Number(process.env.DB_DEV_PORT || 3333)

// 🔒 Safety defaults
const ALLOW_PROD_EXPORT = process.env.ALLOW_PROD_EXPORT === 'true' // default false

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { ...opts })
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', d => (stdout += d.toString()))
    child.stderr.on('data', d => (stderr += d.toString()))

    child.on('close', code => {
      if (code === 0) return resolve({ stdout: stdout.trim(), stderr: stderr.trim() })
      const err = new Error(stderr.trim() || stdout.trim() || `${cmd} failed (code=${code})`)
      err.code = code
      err.stdout = stdout.trim()
      err.stderr = stderr.trim()
      reject(err)
    })
  })
}

function pickEnv(raw) {
  return raw === 'prod' ? 'prod' : 'dev'
}

function getEnvFromReq(req) {
  return pickEnv(
    (req.query?.env ??
      req.body?.env ??
      process.env.EXPO_PUBLIC_DB_ENV ??
      process.env.DB_ENV ??
      'dev')
      .toString()
      .trim()
  )
}

function getDbName(env) {
  // keep in sync with src/lib/db/config.ts
  return env === 'prod' ? 'hoh_fi_prod.db' : 'hoh_fi_dev.db'
}

function getBundleIdFromReq(req) {
  const bid =
    req.query?.bundleId ??
    req.body?.bundleId ??
    process.env.EXPO_PUBLIC_IOS_BUNDLE_ID ??
    process.env.IOS_BUNDLE_ID ??
    ''
  return typeof bid === 'string' ? bid.trim() : ''
}

async function getBootedAppContainerPath(bundleId) {
  const { stdout } = await run('xcrun', ['simctl', 'get_app_container', 'booted', bundleId, 'data'])
  if (!stdout) throw new Error('simctl returned empty app container path (is simulator booted?)')
  return stdout
}

async function buildDbMeta(req) {
  const env = getEnvFromReq(req)
  const dbName = getDbName(env)

  const bundleId = getBundleIdFromReq(req)
  if (!bundleId) {
    const e = new Error(
      [
        'Missing bundleId',
        'Provide one of:',
        '- GET /db/meta?bundleId=com.your.app',
        '- env: EXPO_PUBLIC_IOS_BUNDLE_ID or IOS_BUNDLE_ID'
      ].join('\n')
    )
    e.status = 400
    throw e
  }

  const container = await getBootedAppContainerPath(bundleId)
  const dbPath = path.join(container, 'Documents', 'SQLite', dbName)

  return { env, dbName, dbPath, bundleId, container }
}

function enforceProdLock(env) {
  if (env !== 'prod') return
  if (ALLOW_PROD_EXPORT) return
  const e = new Error('Prod DB export is forbidden (set ALLOW_PROD_EXPORT=true to override locally)')
  e.status = 403
  throw e
}

// ---- routes ----
app.get('/health', (_req, res) => res.json({ ok: true }))

app.get('/db/meta', async (req, res) => {
  try {
    const meta = await buildDbMeta(req)
    res.json({ ok: true, ...meta })
  } catch (e) {
    res.status(e?.status || 500).json({ ok: false, error: String(e?.message ?? e) })
  }
})

app.post('/db/pull', async (req, res) => {
  try {
    const meta = await buildDbMeta(req)
    enforceProdLock(meta.env)

    const scriptPath = path.join(__dirname, 'dbpull.sh')

    const mode = typeof req.body?.mode === 'string' ? req.body.mode : ''
    const exportRoot = typeof req.body?.exportRoot === 'string' ? req.body.exportRoot : ''

    const childEnv = {
      ...process.env,
      DB_ENV: meta.env,
      DB_NAME: meta.dbName,
      DEV_SERVER_URL: `http://${HOST}:${PORT}`,
      ...(mode ? { MODE: mode } : {}),
      ...(exportRoot ? { EXPORT_ROOT: exportRoot } : {})
    }

    const child = spawn('bash', [scriptPath], {
      cwd: path.join(__dirname, '..'),
      env: childEnv
    })

    let stdout = ''
    let stderr = ''
    child.stdout.on('data', d => (stdout += d.toString()))
    child.stderr.on('data', d => (stderr += d.toString()))

    child.on('close', code => {
      if (code === 0) return res.json({ ok: true, output: stdout.trim() })
      return res.status(500).json({
        ok: false,
        error: stderr.trim() || stdout.trim() || `dbpull failed (code=${code})`
      })
    })
  } catch (e) {
    res.status(e?.status || 500).json({ ok: false, error: String(e?.message ?? e) })
  }
})

app.listen(PORT, HOST, () => {
  console.log(`Dev DB server listening on http://${HOST}:${PORT}`)
  console.log(`- GET  /health`)
  console.log(`- GET  /db/meta?bundleId=<ios_bundle_id>&env=dev`)
  console.log(`- POST /db/pull  { bundleId, env?, mode?, exportRoot? }`)
})
