import { createContext, useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuth } from '../hooks/useAuth'

export const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const { token } = useAuth()
  const [progressMap, setProgressMap] = useState({})
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/progress/stats')
      setStats(res.data)
    } catch (_) { /* silent */ }
  }, [])

  useEffect(() => {
    if (!token) { setLoading(false); return }
    Promise.all([api.get('/progress'), api.get('/progress/stats')])
      .then(([progRes, statsRes]) => {
        const map = {}
        for (const doc of progRes.data) map[doc.problemId] = doc.completed
        setProgressMap(map)
        setStats(statsRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const toggleProgress = useCallback(async (problemId, currentValue) => {
    const newValue = !currentValue
    // Optimistic update
    setProgressMap((prev) => ({ ...prev, [problemId]: newValue }))
    try {
      await api.post('/progress', { problemId, completed: newValue })
      fetchStats()
    } catch (_) {
      // Revert
      setProgressMap((prev) => ({ ...prev, [problemId]: currentValue }))
      toast.error('Failed to save progress. Try again.')
    }
  }, [fetchStats])

  return (
    <ProgressContext.Provider value={{ progressMap, stats, loading, toggleProgress }}>
      {children}
    </ProgressContext.Provider>
  )
}
