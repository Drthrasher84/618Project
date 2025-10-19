import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../db/models/user.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

router.post('/signup', async (req, res) => {
  const { username, password } = req.body
  const passwordHash = await bcrypt.hash(password, 10)
  try {
    const u = await User.create({ username, passwordHash })
    res.json({ ok: true, user: { id: u._id, username: u.username } })
  } catch {
    res.status(400).json({ error: 'username already exists?' })
  }
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const u = await User.findOne({ username })
  if (!u || !(await bcrypt.compare(password, u.passwordHash)))
    return res.status(401).json({ error: 'invalid credentials' })
  const token = jwt.sign({ sub: u._id, username }, JWT_SECRET, {
    expiresIn: '7d',
  })
  res.json({ token })
})

export default router
