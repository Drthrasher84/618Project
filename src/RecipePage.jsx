import { useQuery } from '@tanstack/react-query'
import { api } from './api/client.js'

export function RecipePage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => api.listRecipes(),
    staleTime: 10000,
  })

  return (
    <div className='card'>
      <h2>Recipes</h2>
      {isLoading && <p>Loading…</p>}
      {isError && <p className='error'>Error: {error.message}</p>}
      <ul className='list'>
        {data?.length ? (
          data.map((r) => (
            <li key={r._id} className='post'>
              <div className='post-header'>
                <h3>{r.title}</h3>
                <span className='meta'>
                  Posted by {r.authorId?.username || 'Unknown'} on{' '}
                  {new Date(r.createdAt).toLocaleString()}
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
