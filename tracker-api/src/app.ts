console.log('4. app.ts loading')
import express from 'express'
import healthRouter from './routes/health'
import listingsRouter from './routes/listings'
import searchesRouter from './routes/searches'

const app = express()
console.log('5. express created')

function resolveAllowedOrigin(requestOrigin: string | undefined): string | null {
  const configured = process.env.CORS_ORIGINS?.trim()

  // Local default: allow any origin (same as before).
  if (!configured) {
    return '*'
  }

  const allowed = configured
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (!requestOrigin) {
    return allowed[0] ?? null
  }

  if (allowed.includes(requestOrigin)) {
    return requestOrigin
  }

  return null
}

app.use((req, res, next) => {
  const allowedOrigin = resolveAllowedOrigin(req.headers.origin)

  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS',
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Vary', 'Origin')

  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }

  next()
})

app.use(express.json())
app.use('/health', healthRouter)
app.use('/searches', searchesRouter)
app.use('/listings', listingsRouter)

console.log('6. routes registered')

export default app
