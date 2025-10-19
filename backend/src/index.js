import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectToDatabase } from './db/init.js'
import authRoutes from './routes/auth.js'
import recipeRoutes from './routes/recipes.js'

dotenv.config()
await connectToDatabase() // your existing connector with mongoose.connect(DATABASE_URL)

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json())
app.get('/', (_req, res) => {
  res.send('API is running. Try /api/v1/recipes')
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/recipes', recipeRoutes)

const PORT = process.env.PORT || 3001
app.listen(PORT, () =>
  console.log(`Backend listening on http://localhost:${PORT}`),
)
