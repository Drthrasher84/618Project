import { useState } from 'react'
import { api, setToken } from '../api/client.js'
import PropTypes from 'prop-types'

export function AuthBar({ user, onAuth, onLogout }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isSignup) {
        // 1️⃣ Create account
        await api.signup(username, password)
        // 2️⃣ Immediately log in
        const res = await api.login(username, password)
        setToken(res.token)
        onAuth({ username })
      } else {
        // Normal login
        const res = await api.login(username, password)
        setToken(res.token)
        onAuth({ username })
      }
    } catch (err) {
      alert(err.message)
    }
  }

  if (user) {
    return (
      <div className='card'>
        <h2>Welcome, {user.username}</h2>
        <button onClick={onLogout}>Logout</button>
      </div>
    )
  }

  return (
    <form className='card' onSubmit={handleSubmit}>
      <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>
      <label>
        Username
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <label>
        Password
        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button type='submit'>{isSignup ? 'Create Account' : 'Login'}</button>
      <p style={{ marginTop: '0.5rem' }}>
        {isSignup ? 'Already have an account?' : 'Need an account?'}{' '}
        <button type='button' onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? 'Login' : 'Sign Up'}
        </button>
      </p>
    </form>
  )
}

AuthBar.propTypes = {
  user: PropTypes.shape({ username: PropTypes.string }),
  onAuth: PropTypes.func,
  onLogout: PropTypes.func,
}
