import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client.js'

export function TopRecipes() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['top-recipes'],
    queryFn: () => api.getTopRecipes(5),
    staleTime: 10000,
  })

  return (
    <div className='card top-recipes'>
      <h3>Top Recipes</h3>

      {isLoading && <p>Loading…</p>}
      {isError && <p className='error'>Error: {error.message}</p>}

      <ol className='top-recipes-list'>
        {data?.length ? (
          data.map((r, idx) => (
            <li key={r._id}>
              <div className='top-recipes-title'>
                {idx + 1}. {r.title}
              </div>
              <div className='top-recipes-meta'>
                {r.author?.username ?? 'Unknown'} — ❤️ {r.likesCount} likes
              </div>
            </li>
          ))
        ) : (
          <li>No top recipes yet.</li>
        )}
      </ol>
    </div>
  )
}
