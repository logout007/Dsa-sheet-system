import { LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useProgress } from '../../hooks/useProgress'
import ProgressBar from '../ui/ProgressBar'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { stats } = useProgress()

  const total = stats.reduce((a, s) => a + s.total, 0)
  const completed = stats.reduce((a, s) => a + s.completed, 0)
  const pct = total ? Math.round((completed / total) * 100) : 0

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <span className="font-mono font-semibold text-brand-500 text-lg shrink-0">&lt;/&gt;</span>
        <span className="font-semibold text-gray-100 shrink-0">DSA Sheet</span>

        {/* Progress */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <ProgressBar percentage={pct} thin className="max-w-xs" />
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {completed}/{total} ({pct}%)
          </span>
        </div>

        {/* User + Logout */}
        {user && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-gray-400 hidden sm:block">{user.name}</span>
            <button
              onClick={logout}
              className="btn-ghost flex items-center gap-1.5 text-sm"
              aria-label="Logout"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
