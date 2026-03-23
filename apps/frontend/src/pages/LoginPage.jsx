import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Spinner from '../components/ui/Spinner'

export default function LoginPage() {
  const { login, token } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (token) return <Navigate to="/sheet" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950">
      <div className="card w-full max-w-sm p-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <span className="font-mono font-bold text-brand-500 text-2xl">&lt;/&gt;</span>
          <span className="font-semibold text-xl text-gray-100">DSA Sheet</span>
        </div>

        <h1 className="text-2xl font-semibold text-gray-100 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-400 mb-6">Track your DSA progress, one problem at a time.</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-400 mb-1.5">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="input-field pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-800 text-red-400 text-sm px-3 py-2 rounded-lg" role="alert">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading && <Spinner size="sm" />}
            Sign in
          </button>
        </form>

        <p className="mt-5 text-sm text-gray-500 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-500 hover:text-brand-400 transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
