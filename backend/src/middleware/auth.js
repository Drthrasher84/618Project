import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || ''
    const [, token] = auth.split(' ')
    if (!token) return res.status(401).json({ error: 'missing token' })

    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload // { sub: <userId>, username, iat, exp, ... }
    req.userId = payload.sub // convenience for routes
    return next()
  } catch (err) {
    // Token expired or invalid
    return res.status(401).json({ error: 'invalid token' })
  }
}
