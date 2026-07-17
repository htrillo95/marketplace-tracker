console.log('1. index.ts loaded')
import app from './app'

const PORT = Number(process.env.PORT) || 3000

console.log('2. about to listen')
app.listen(PORT, '0.0.0.0', () => {
  console.log('3. server listening')
  console.log(`Server listening on port ${PORT}`)
})
