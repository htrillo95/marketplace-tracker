import express from 'express'
import healthRouter from './routes/health'
import listingsRouter from './routes/listings'
import searchesRouter from './routes/searches'

const app = express()

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

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

export default app
