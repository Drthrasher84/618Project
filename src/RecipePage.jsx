import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from './api/client.js'

export function RecipePage() {
  const [authorFilter, setAuthorFilter] = useState('')

  const trimmedAuthor = authorFilter.trim() || undefined

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['recipes', trimmedAuthor],
    queryFn: () => api.listRecipes({ author: trimmedAuthor }),
    staleTime: 10000,
  })

  return (
    <div className='card'>
      <h2>Recipes</h2>

      <div style={{ display: 'flex', gap: 8, margin: '0.5rem 0 1rem' }}>
        <input
          placeholder='Filter by author (username)'
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)} // ← no trim here
        />
        <button disabled={!authorFilter} onClick={() => setAuthorFilter('')}>
          Clear
        </button>
      </div>
      {trimmedAuthor && (
        <p className='meta' style={{ marginTop: -8 }}>
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
                    onClick={() => setAuthorFilter(r.authorId?.username || '')}
                  >
                    {r.authorId?.username || 'Unknown'}
                  </button>{' '}
                  on {new Date(r.createdAt).toLocaleString()}
                </span>
              </div>

              {r.imageUrl && (
                <img
                  src={r.imageUrl}
                  alt={r.title}
                  style={{ maxWidth: '100%', borderRadius: 8 }}
                />
              )}

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
  )
}
