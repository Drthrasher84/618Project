import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { api } from './api/client.js'
import { socket } from './socket.js'

// Small popup component shown when a new recipe is created
function NewRecipePopup({ open, recipe, onClose }) {
  const navigate = useNavigate()

  if (!open || !recipe) return null

  const handleClick = () => {
    // Go to the recipe detail page
    navigate(`/recipes/${recipe.id}`)
    onClose()
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      style={{
        position: 'fixed',
        right: '1rem',
        bottom: '1rem',
        padding: '0.9rem 1.2rem',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        backgroundColor: '#111827',
        color: 'white',
        cursor: 'pointer',
        zIndex: 9999,
        maxWidth: '320px',
        border: 'none',
        textAlign: 'left',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
        New recipe added!
      </div>
      <div style={{ fontSize: '0.95rem', marginBottom: '0.15rem' }}>
        {recipe.title}
      </div>
      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
        Click to view this recipe.
      </div>
    </button>
  )
}

// ✅ PropTypes for ESLint
NewRecipePopup.propTypes = {
  open: PropTypes.bool.isRequired,
  recipe: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
}

export function RecipePage() {
  const [authorFilter, setAuthorFilter] = useState('')
  const [sort, setSort] = useState('latest')

  // popup state
  const [popupRecipe, setPopupRecipe] = useState(null)
  const [popupOpen, setPopupOpen] = useState(false)

  const trimmedAuthor = authorFilter.trim() || undefined

  const qc = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['recipes', { author: trimmedAuthor, sort }],
    queryFn: () => api.listRecipes({ author: trimmedAuthor, sort }),
    staleTime: 10000,
  })

  // 🔥 Socket listener for "recipe:created"
  useEffect(() => {
    const handler = (payload) => {
      setPopupRecipe(payload)
      setPopupOpen(true)

      // Optional: refresh list when new recipe comes in
      qc.invalidateQueries({ queryKey: ['recipes'] })
    }

    socket.on('recipe:created', handler)

    return () => {
      socket.off('recipe:created', handler)
    }
  }, [qc])

  return (
    <>
      <div className='card'>
        <h2>Recipes</h2>

        <div
          style={{
            display: 'flex',
            gap: 8,
            margin: '0.5rem 0 0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <input
            placeholder='Filter by author (username)'
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
          />
          <button disabled={!authorFilter} onClick={() => setAuthorFilter('')}>
            Clear
          </button>

          <label style={{ marginLeft: 'auto' }}>
            Sort:{' '}
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value='latest'>Latest</option>
              <option value='likes'>Most liked</option>
              <option value='least'>Least liked</option>
            </select>
          </label>
        </div>

        {trimmedAuthor && (
          <p className='meta' style={{ marginTop: -4 }}>
            Showing recipes by <strong>{trimmedAuthor}</strong>
          </p>
        )}

        {isLoading && <p>Loading…</p>}
        {isError && <p className='error'>Error: {error.message}</p>}

        <ul className='list'>
          {data?.length ? (
            data.map((r) => (
              <li key={r._id} className='post'>
                <div className='post-header'>
                  <h3>{r.title}</h3>
                  <span className='meta'>
                    Posted by{' '}
                    <button
                      className='link-btn'
                      type='button'
                      onClick={() => setAuthorFilter(r.author?.username || '')}
                    >
                      {r.author?.username || 'Unknown'}
                    </button>{' '}
                    on {new Date(r.createdAt).toLocaleString()}
                    {' • '}
                    ❤️ {r.likesCount ?? r.likes?.length ?? 0} likes
                  </span>
                </div>

                {r.imageUrl && (
                  <img
                    src={r.imageUrl}
                    alt={r.title}
                    style={{ maxWidth: '100%', borderRadius: 8 }}
                  />
                )}

                {/* LIKE / UNLIKE BUTTONS */}
                <div style={{ margin: '8px 0' }}>
                  <button
                    onClick={async () => {
                      await api.likeRecipe(r._id)
                      qc.invalidateQueries({ queryKey: ['recipes'] })
                    }}
                  >
                    ❤️ Like
                  </button>

                  <button
                    style={{ marginLeft: 8 }}
                    onClick={async () => {
                      await api.unlikeRecipe(r._id)
                      qc.invalidateQueries({ queryKey: ['recipes'] })
                    }}
                  >
                    💔 Unlike
                  </button>
                </div>

                <h4>Ingredients</h4>
                <ul style={{ marginTop: 0 }}>
                  {r.ingredients.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              </li>
            ))
          ) : (
            <li>No recipes yet.</li>
          )}
        </ul>
      </div>

      {/* 🔔 Popup for "new recipe added" */}
      <NewRecipePopup
        open={popupOpen}
        recipe={popupRecipe}
        onClose={() => setPopupOpen(false)}
      />
    </>
  )
}
