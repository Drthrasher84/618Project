import PropTypes from 'prop-types'

export function Filters({ params, onChange }) {
  const set = (patch) => onChange({ ...params, ...patch })

  return (
    <div className='card'>
      <h2>Filter & Sort</h2>

      <div className='row'>
        <label>
          Author:
          <input
            value={params.author}
            onChange={(e) => set({ author: e.target.value })}
            placeholder='filter by author'
          />
        </label>

        <label>
          Tag:
          <input
            value={params.tag}
            onChange={(e) => set({ tag: e.target.value })}
            placeholder='react'
          />
        </label>
      </div>

      <div className='row'>
        <label>
          Sort By:
          <select
            value={params.sortBy}
            onChange={(e) => set({ sortBy: e.target.value })}
          >
            <option value='createdAt'>createdAt</option>
            <option value='title'>title</option>
            <option value='author'>author</option>
          </select>
        </label>

        <label>
          Order:
          <select
            value={params.order}
            onChange={(e) => set({ order: e.target.value })}
          >
            <option value='desc'>descending</option>
            <option value='asc'>ascending</option>
          </select>
        </label>
      </div>
    </div>
  )
}

Filters.propTypes = {
  params: PropTypes.shape({
    author: PropTypes.string,
    tag: PropTypes.string,
    sortBy: PropTypes.string,
    order: PropTypes.string, // e.g., 'asc' | 'desc'
  }).isRequired,
  onChange: PropTypes.func.isRequired,
}

Filters.defaultProps = {}
