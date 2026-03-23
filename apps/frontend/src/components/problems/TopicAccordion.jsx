import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import ProblemRow from './ProblemRow'
import ProgressBar from '../ui/ProgressBar'

export default function TopicAccordion({ topic, problems, progressMap, onToggle, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  const completed = problems.filter((p) => progressMap[p._id]).length
  const total = problems.length
  const pct = total ? Math.round((completed / total) * 100) : 0

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen((v) => !v)
    }
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-800/50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-controls={`topic-${topic._id}`}
      >
        <ChevronRight
          size={16}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        />
        <span className="flex-1 text-left font-semibold text-gray-100">{topic.title}</span>
        <span className="text-sm text-gray-400 shrink-0 mr-3">
          {completed} / {total}
        </span>
        <ProgressBar percentage={pct} thin className="w-24 shrink-0" />
      </button>

      {/* Problem list — CSS max-height transition */}
      <div
        id={`topic-${topic._id}`}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? `${problems.length * 56 + 8}px` : '0px' }}
      >
        {problems.map((problem) => (
          <ProblemRow
            key={problem._id}
            problem={problem}
            isCompleted={!!progressMap[problem._id]}
            onToggle={onToggle}
          />
        ))}
        {problems.length === 0 && (
          <p className="px-4 py-3 text-sm text-gray-500 border-t border-gray-800">
            No problems in this topic yet.
          </p>
        )}
      </div>
    </div>
  )
}
