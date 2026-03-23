import { useNavigate } from 'react-router-dom'
import DifficultyBadge from '../ui/DifficultyBadge'
import ResourceLinks from '../ui/ResourceLinks'

export default function ProblemRow({ problem, isCompleted, onToggle }) {
  const navigate = useNavigate()

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onToggle(problem._id, isCompleted)
    }
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-t border-gray-800 transition-colors duration-150
        ${isCompleted ? 'bg-green-950/20' : 'hover:bg-gray-800/40'}`}
    >
      {/* Checkbox */}
      <button
        role="checkbox"
        aria-checked={isCompleted}
        aria-label={`Mark "${problem.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
        onClick={() => onToggle(problem._id, isCompleted)}
        onKeyDown={handleKeyDown}
        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer
          transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 focus:ring-offset-gray-900
          ${isCompleted
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-600 hover:border-gray-400 bg-transparent'
          }`}
      >
        {isCompleted && (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Title — clickable */}
      <button
        onClick={() => navigate(`/problem/${problem._id}`)}
        className={`flex-1 text-sm min-w-0 truncate text-left cursor-pointer hover:underline focus:outline-none
          ${isCompleted ? 'line-through text-gray-500' : 'text-gray-100 hover:text-brand-500'}`}
      >
        {problem.title}
      </button>

      {/* Difficulty */}
      <div className="shrink-0">
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>

      {/* Resource links */}
      <div className="shrink-0">
        <ResourceLinks
          ytLink={problem.ytLink}
          leetcodeLink={problem.leetcodeLink}
          articleLink={problem.articleLink}
        />
      </div>
    </div>
  )
}
