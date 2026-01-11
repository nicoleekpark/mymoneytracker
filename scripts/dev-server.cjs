const express = require('express')
const { spawn } = require('child_process')
const path = require('path')

const app = express()
app.use(express.json())

const PORT = 3333
const HOST = '127.0.0.1'

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/dbpull', (req, res) => {
  const env = req.body?.env === 'prod' ? 'prod' : 'dev'

  // optional extras (safe defaults)
  const outDir = typeof req.body?.outDir === 'string' ? req.body.outDir : ''
  const label = typeof req.body?.label === 'string' ? req.body.label : ''

  const scriptPath = path.join(__dirname, 'dbpull.sh')

  // pass parameters to bash script:
  // 1) env (dev|prod)
  // 2) outDir (optional)
  // 3) label (optional)
  const args = [scriptPath, env]
  if (outDir) args.push(outDir)
  if (label) args.push(label)

  const child = spawn('bash', args, {
    cwd: path.join(__dirname, '..'),
  })

  let stdout = ''
  let stderr = ''

  child.stdout.on('data', (d) => (stdout += d.toString()))
  child.stderr.on('data', (d) => (stderr += d.toString()))

  child.on('close', (code) => {
    if (code === 0) {
      return res.json({ ok: true, output: stdout.trim() })
    }
    return res.status(500).json({
      ok: false,
      error: stderr.trim() || stdout.trim() || `dbpull failed (code=${code})`,
    })
  })
})

app.listen(PORT, HOST, () => {
  console.log(`Dev server listening on http://${HOST}:${PORT}`)
})
