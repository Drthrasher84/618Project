import PropTypes from 'prop-types'
import { useMutation } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { api } from '../api/client.js'

export function CreateRecipe({ onCreated, disabled }) {
  const [title, setTitle] = useState('')
  const [ingredientsText, setIngredientsText] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const valid = useMemo(
    () => title.trim() && ingredientsText.trim(),
    [title, ingredientsText],
  )

  const { mutate, isPending, error } = useMutation({
    mutationFn: (payload) => api.createRecipe(payload),
    onSuccess: () => {
      setTitle('')
      setIngredientsText('')
      setImageUrl('')
      onCreated?.()
    },
  })

  const submit = (e) => {
    e.preventDefault()
    if (!valid) return
    const ingredients = ingredientsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    mutate({
      title: title.trim(),
      ingredients,
      imageUrl: imageUrl.trim() || undefined,
    })
  }

  return (
    <form className='card' onSubmit={submit}>
      <h2>Post a Recipe</h2>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        Ingredients (one per line)
        <textarea
          rows={5}
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
        />
      </label>
      <label>
        Image URL
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      </label>
      {imageUrl && (
        <img
          src={imageUrl}
          alt=''
          style={{ maxWidth: 220, borderRadius: 8, border: '1px solid #eee' }}
        />
      )}
      {error && <p className='error'>Error: {error.message}</p>}
      <button disabled={disabled || !valid || isPending}>
        {isPending ? 'Posting…' : 'Post Recipe'}
      </button>
    </form>
  )
}

CreateRecipe.propTypes = {
  onCreated: PropTypes.func, // called after successful create
  disabled: PropTypes.bool, // disables the submit button/form
}

CreateRecipe.defaultProps = {
  onCreated: undefined,
  disabled: false,
}
