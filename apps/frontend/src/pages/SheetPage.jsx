import { useState, useEffect, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import api from '../api/axios'
import { useProgress } from '../hooks/useProgress'
import Navbar from '../components/layout/Navbar'
import TopicAccordion from '../components/problems/TopicAccordion'
import ProgressBar from '../components/ui/ProgressBar'

function AccordionSkeleton() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 bg-gray-800 rounded" />
        <div className="flex-1 h-4 bg-gray-800 rounded" />
        <div className="w-16 h-4 bg-gray-800 rounded" />
        <div className="w-24 h-2 bg-gray-800 rounded-full" />
      </div>
    </div>
  )
}

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard']

export default function SheetPage() {
  const { progressMap, stats, toggleProgress } = useProgress()
  const [topics, setTopics] = useState([])
  const [problems, setProblems] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [diffFilter, setDiffFilter] = useState('All')
  const [topicFilter, setTopicFilter] = useState('All')

  useEffect(() => {
    Promise.all([api.get('/topics'), api.get('/problems')])
      .then(([topicsRes, problemsRes]) => {
        setTopics(topicsRes.data)
        setProblems(problemsRes.data)
      })
      .catch(console.error)
      .finally(() => setLoadingData(false))
  }, [])

  const problemsByTopic = useMemo(() => {
    const map = {}
    for (const p of problems) {
      const tid = p.topicId?.toString?.() ?? p.topicId
      if (!map[tid]) map[tid] = []
      map[tid].push(p)
    }
    return map
  }, [problems])

  const totalProblems = problems.length
  const completedProblems = problems.filter((p) => progressMap[p._id]).length
  const overallPct = totalProblems ? Math.round((completedProblems / totalProblems) * 100) : 0

  const query = searchQuery.trim().toLowerCase()

  const filteredTopics = useMemo(() => {
    let ts = topics
    if (topicFilter !== 'All') ts = ts.filter((t) => t._id === topicFilter)
    if (!query && diffFilter === 'All') return ts
    return ts.filter((t) => {
      const tp = problemsByTopic[t._id] ?? []
      return tp.some((p) => {
        const matchDiff = diffFilter === 'All' || p.difficulty === diffFilter
        const matchQuery = !query || p.title.toLowerCase().includes(query)
        return matchDiff && matchQuery
      })
    })
  }, [query, diffFilter, topicFilter, topics, problemsByTopic])

  const getFilteredProblems = (topicId) => {
    const tp = problemsByTopic[topicId] ?? []
    return tp.filter((p) => {
      const matchDiff = diffFilter === 'All' || p.difficulty === diffFilter
      const matchQuery = !query || p.title.toLowerCase().includes(query)
      return matchDiff && matchQuery
    })
  }

  const isFiltering = query || diffFilter !== 'All' || topicFilter !== 'All'

  const matchCount = useMemo(() => {
    if (!isFiltering) return 0
    return filteredTopics.reduce((acc, t) => acc + getFilteredProblems(t._id).length, 0)
  }, [isFiltering, filteredTopics])

  const clearFilters = () => {
    setSearchQuery('')
    setDiffFilter('All')
    setTopicFilter('All')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-100">DSA Sheet</h1>
            <p className="text-sm text-gray-400 mt-0.5">Track your journey from zero to hero</p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="search"
              placeholder="Search problems..."
              className="input-field pl-9 pr-8 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search problems"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Difficulty pills */}
          <div className="flex items-center gap-1.5">
            {DIFFICULTIES.map((d) => {
              const active = diffFilter === d
              const color =
                d === 'Easy' ? 'text-easy' :
                d === 'Medium' ? 'text-medium' :
                d === 'Hard' ? 'text-hard' :
                'text-gray-300'
              return (
                <button
                  key={d}
                  onClick={() => setDiffFilter(d)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer
                    ${active
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : `border-gray-700 bg-gray-900 ${color} hover:border-gray-500`
                    }`}
                >
                  {d}
                </button>
              )
            })}
          </div>

          {/* Topic select */}
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 cursor-pointer hover:border-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            aria-label="Filter by topic"
          >
            <option value="All">All Topics</option>
            {topics.map((t) => (
              <option key={t._id} value={t._id}>{t.title}</option>
            ))}
          </select>

          {/* Clear filters */}
          {isFiltering && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
            >
              <X size={12} /> Clear
            </button>
          )}

          {/* Match count */}
          {isFiltering && (
            <span className="text-xs text-gray-500 ml-auto">
              {matchCount} problem{matchCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Overall progress */}
        {!loadingData && !isFiltering && (
          <div className="card p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Overall Progress</span>
              <span className="text-sm text-gray-400">{completedProblems} / {totalProblems} problems ({overallPct}%)</span>
            </div>
            <ProgressBar percentage={overallPct} className="mb-4" />
            {stats.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {stats.map((s) => (
                  <div key={s.topicId} className="flex items-center gap-1.5 bg-gray-800 rounded-lg px-2.5 py-1.5">
                    <span className="text-xs text-gray-300">{s.topicTitle}</span>
                    <ProgressBar percentage={s.percentage} thin className="w-12" />
                    <span className="text-xs text-gray-500">{s.completed}/{s.total}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Topic list */}
        <div className="space-y-3">
          {loadingData ? (
            <><AccordionSkeleton /><AccordionSkeleton /><AccordionSkeleton /></>
          ) : filteredTopics.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg mb-1">No problems match your filters.</p>
              <button onClick={clearFilters} className="text-sm text-brand-500 hover:underline cursor-pointer">Clear filters</button>
            </div>
          ) : (
            filteredTopics.map((topic, idx) => (
              <TopicAccordion
                key={topic._id}
                topic={topic}
                problems={getFilteredProblems(topic._id)}
                progressMap={progressMap}
                onToggle={toggleProgress}
                defaultOpen={!!isFiltering || idx === 0}
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
}
