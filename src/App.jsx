import { Header } from './components/Header.jsx'
import { useState } from 'react'
import { setToken } from './api/client.js'
import { AuthBar } from './components/AuthBar.jsx'
import { CreateRecipe } from './components/CreateRecipe.jsx'
import { RecipePage } from './RecipePage.jsx'
import { useQueryClient } from '@tanstack/react-query'

export default function App() {
  const [user, setUser] = useState(null)
  const qc = useQueryClient()

  const onLogout = () => {
    setToken(null)
    setUser(null)
    qc.invalidateQueries({ queryKey: ['recipes'] })
  }

  return (
    <div className='container'>
      <Header user={user} onLogout={onLogout} /> {/* 👈 Add here */}
      <AuthBar user={user} onAuth={setUser} onLogout={onLogout} />
      <CreateRecipe
        disabled={!user}
        onCreated={() => qc.invalidateQueries({ queryKey: ['recipes'] })}
      />
      <RecipePage />
    </div>
  )
}
