// backend/src/routes/recipes.js
import express from 'express'
import { Recipe } from '../db/models/recipe.js'
import { User } from '../db/models/user.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// CREATE a recipe
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, ingredients, imageUrl, steps } = req.body

    if (!title || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res
        .status(400)
        .json({ error: 'title and ingredients are required' })
    }

    const doc = await Recipe.create({
      title: title.trim(),
      ingredients: ingredients.map((s) => String(s).trim()).filter(Boolean),
      steps: steps ?? '',
      imageUrl: imageUrl?.trim() || undefined,
      author: req.user.sub, // your existing author field
      likes: [],
    })

    // 🔥 BROADCAST SOCKET EVENT HERE
    const io = req.app.get('io')
    if (io) {
      io.emit('recipe:created', {
        id: doc._id.toString(),
        title: doc.title,
        author: req.user.username ?? req.user.email ?? 'Unknown',
        createdAt: doc.createdAt,
      })
    }

    res.status(201).json(doc)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// TOP recipes analytics endpoint
// GET /api/v1/recipes/top?limit=10
router.get('/top', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50)

    // Load all recipes, compute likesCount, then sort in JS
    const docs = await Recipe.find({}).populate('author', 'username').lean()

    let recipes = docs.map((r) => ({
      ...r,
      likesCount: r.likes ? r.likes.length : 0,
    }))

    recipes.sort((a, b) => {
      if (b.likesCount !== a.likesCount) {
        return b.likesCount - a.likesCount // most liked first
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    recipes = recipes.slice(0, limit)

    // Trim fields for analytics response
    const payload = recipes.map((r) => ({
      _id: r._id,
      title: r.title,
      imageUrl: r.imageUrl,
      likesCount: r.likesCount,
      author: r.author
        ? { _id: r.author._id, username: r.author.username }
        : null,
    }))

    res.json(payload)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// LIST recipes
// - optional filter by author username: ?author=username
// - optional sort: ?sort=latest | likes | least
router.get('/', async (req, res) => {
  try {
    const { author, sort } = req.query
    const match = {}

    // Filter by author username if provided
    if (author) {
      const u = await User.findOne({ username: author }).lean()
      if (!u) return res.json([]) // no such user -> empty list
      match.author = u._id
    }

    // Get all matching docs, newest first by default
    const docs = await Recipe.find(match)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .lean()

    // Attach likesCount in JS
    let recipes = docs.map((r) => ({
      ...r,
      likesCount: r.likes ? r.likes.length : 0,
    }))

    // Sort by most liked
    if (sort === 'likes') {
      recipes.sort((a, b) => {
        if (b.likesCount !== a.likesCount) {
          return b.likesCount - a.likesCount // DESC by likes
        }
        return new Date(b.createdAt) - new Date(a.createdAt) // tie-breaker: newest first
      })
    }

    // Sort by least liked
    if (sort === 'least') {
      recipes.sort((a, b) => {
        if (a.likesCount !== b.likesCount) {
          return a.likesCount - b.likesCount // ASC by likes
        }
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    }

    res.json(recipes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// SINGLE recipe (for detail view, with like count)
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'username')
      .lean()

    if (!recipe) return res.status(404).json({ error: 'Recipe not found' })

    recipe.likesCount = recipe.likes ? recipe.likes.length : 0
    res.json(recipe)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// LIKE a recipe
// POST /api/v1/recipes/:id/like
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likes: userId } }, // prevents duplicate likes
      { new: true },
    )

    if (!recipe) return res.status(404).json({ error: 'Recipe not found' })
    res.json({ likesCount: recipe.likes.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// UNLIKE a recipe
// POST /api/v1/recipes/:id/unlike
router.post('/:id/unlike', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: userId } },
      { new: true },
    )

    if (!recipe) return res.status(404).json({ error: 'Recipe not found' })
    res.json({ likesCount: recipe.likes.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

export default router
