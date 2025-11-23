// backend/src/index.js
import http from 'http'
import express from 'express'
import { Server as SocketIOServer } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDb } from './db/connect.js'
import recipesRouter from './routes/recipes.js'
import authRouter from './routes/auth.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/recipes', recipesRouter)

const server = http.createServer(app)

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
})

app.set('io', io)

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3000

connectDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to connect DB:', err)
    process.exit(1)
  })
