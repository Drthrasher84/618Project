const BASE = (import.meta.env.VITE_BACKEND_URL || '/api/v1').replace(/\/$/, '')
let token = null

export function setToken(t) {
  token = t
}

async function http(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  signup: (username, password) =>
    http('/auth/signup', { method: 'POST', body: { username, password } }),
  login: (username, password) =>
    http('/auth/login', { method: 'POST', body: { username, password } }),

  listRecipes: ({ author } = {}) =>
    http(`/recipes${author ? `?author=${encodeURIComponent(author)}` : ''}`),

  createRecipe: ({ title, ingredients, imageUrl }) =>
    http('/recipes', {
      method: 'POST',
      body: { title, ingredients, imageUrl },
    }),
}
