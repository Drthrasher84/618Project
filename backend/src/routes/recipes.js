import express from 'express'
import { Recipe } from '../db/models/recipe.js'
import { User } from '../db/models/user.js' // ← add this
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.post('/', requireAuth, async (req, res) => {
  const { title, ingredients, imageUrl } = req.body
  if (!title || !Array.isArray(ingredients) || ingredients.length === 0)
    return res.status(400).json({ error: 'title and ingredients are required' })
  const doc = await Recipe.create({
    title: title.trim(),
    ingredients: ingredients.map((s) => String(s).trim()).filter(Boolean),
    imageUrl: imageUrl?.trim() || undefined,
    authorId: req.userId || req.user.sub,
  })
  res.status(201).json(doc)
})

router.get('/', async (req, res) => {
  try {
    const { author } = req.query
    const query = {}

    if (author) {
      const u = await User.findOne({ username: author }).lean()
      if (!u) return res.json([]) // no such user → empty list
      query.authorId = u._id
    }

    const recipes = await Recipe.find(query)
      .populate('authorId', 'username')
      .sort({ createdAt: -1 })
      .lean()

    res.json(recipes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
