import PropTypes from 'prop-types'

export function Header({ user, onLogout }) {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffefde',
        padding: '1rem 2rem',
        borderBottom: '2px solid #ffa94d',
        borderRadius: '0 0 12px 12px',
      }}
    >
      <h1 style={{ margin: 0, color: '#b94e00' }}>Recipe Sharing App</h1>
      {user ? (
        <div>
          <span style={{ marginRight: '1rem', fontWeight: 'bold' }}>
            Welcome, {user.username}!
          </span>
          <button onClick={onLogout}>Logout</button>
        </div>
      ) : (
        <span style={{ fontStyle: 'italic', color: '#555' }}>
          Please log in to share recipes
        </span>
      )}
    </header>
  )
}

Header.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
  }),
  onLogout: PropTypes.func,
}
