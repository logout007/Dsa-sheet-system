import { createContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('dsa_token'))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem('dsa_token')
    if (!stored) { setLoading(false); return }
    api.get('/auth/me')
      .then((res) => { setUser(res.data); setToken(stored) })
      .catch(() => {
        // Don't navigate here — the axios interceptor handles 401 redirects.
        // Just clear local state so ProtectedRoute can redirect cleanly.
        localStorage.removeItem('dsa_token')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  // Stable helper — useCallback so login/register closures don't go stale
  const _persist = useCallback((data) => {
    localStorage.setItem('dsa_token', data.token)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    _persist(res.data)
    navigate('/sheet')
  }, [_persist, navigate])

  const register = useCallback(async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password })
    _persist(res.data)
    navigate('/sheet')
  }, [_persist, navigate])

  const logout = useCallback(() => {
    localStorage.removeItem('dsa_token')
    setToken(null)
    setUser(null)
    navigate('/login')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}
