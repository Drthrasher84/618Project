import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from './api/client.js'

export function RecipePage() {
  const [authorFilter, setAuthorFilter] = useState('')
  const [sort, setSort] = useState('latest')

  const trimmedAuthor = authorFilter.trim() || undefined

  // Needed for like/unlike buttons
  const qc = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['recipes', { author: trimmedAuthor, sort }],
    queryFn: () => api.listRecipes({ author: trimmedAuthor, sort }),
    staleTime: 10000,
  })

  return (
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
  )
}
