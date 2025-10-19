import express from 'express'
import { Recipe } from '../db/models/recipe.js'
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
    authorId: req.user.sub,
  })
  res.json(doc)
})

router.get('/', async (_req, res) => {
  const docs = await Recipe.find({}).sort({ createdAt: -1 }).lean()
  res.json(docs)
})

export default router
