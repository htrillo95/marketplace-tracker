import express from 'express'
import healthRouter from './routes/health'

const app = express()

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
})

app.use(express.json())
app.use('/health', healthRouter)

export default app
