// frontend/src/api/client.js

const API_BASE =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api/v1'

export function setToken(token) {
  if (typeof window === 'undefined') return
  if (token) {
    window.localStorage.setItem('token', token)
  } else {
    window.localStorage.removeItem('token')
  }
}

function getToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('token')
}

async function request(method, path, { body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed with status ${res.status}`)
  }

  return res.json()
}

export const api = {
  signup({ username, password }) {
    return request('POST', '/auth/signup', {
      body: { username, password },
    })
  },

  login({ username, password }) {
    return request('POST', '/auth/login', {
      body: { username, password },
    })
  },

  createRecipe({ title, ingredients, imageUrl, steps }) {
    return request('POST', '/recipes', {
      body: { title, ingredients, imageUrl, steps },
      auth: true,
    })
  },

  listRecipes({ author, sort } = {}) {
    const params = new URLSearchParams()
    if (author) params.set('author', author)
    if (sort) params.set('sort', sort)

    const qs = params.toString()
    return request('GET', `/recipes${qs ? `?${qs}` : ''}`)
  },

  getRecipe(id) {
    return request('GET', `/recipes/${id}`)
  },

  likeRecipe(id) {
    return request('POST', `/recipes/${id}/like`, { auth: true })
  },

  unlikeRecipe(id) {
    return request('POST', `/recipes/${id}/unlike`, { auth: true })
  },

  getTopRecipes(limit = 5) {
    return request('GET', `/recipes/top?limit=${limit}`)
  },
}
