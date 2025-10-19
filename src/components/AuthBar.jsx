import PropTypes from 'prop-types'
import { useState } from 'react'
import { api, setToken } from '../api/client.js'

export function AuthBar({ onAuth, onLogout, user }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) {
    return (
      <div
        className='card'
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          Logged in as <strong>{user.username}</strong>
        </div>
        <button onClick={onLogout}>Log Out</button>
      </div>
    )
  }

  const submit = async (mode) => {
    try {
      setError('')
      if (mode === 'signup') await api.signup(username, password)
      const { token } = await api.login(username, password)
      setToken(token)
      onAuth?.({ username, token })
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className='card'>
      <h2>Auth</h2>
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
      {error && <p className='error'>{error.message || error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => submit('signup')}>Sign Up</button>
        <button onClick={() => submit('login')}>Log In</button>
      </div>
    </div>
  )
}

AuthBar.propTypes = {
  onAuth: PropTypes.func,
  onLogout: PropTypes.func,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }),
}

AuthBar.defaultProps = {
  onAuth: undefined,
  onLogout: undefined,
  user: null,
}
