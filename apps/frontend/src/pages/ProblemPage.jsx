import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { ArrowLeft, CheckCircle, Circle, ExternalLink, Youtube, BookOpen, ChevronDown } from 'lucide-react'
import api from '../api/axios'
import { useProgress } from '../hooks/useProgress'
import Spinner from '../components/ui/Spinner'

const LANGUAGES = [
  { label: 'Python', value: 'python', lcSlug: 'python3' },
  { label: 'JavaScript', value: 'javascript', lcSlug: 'javascript' },
  { label: 'TypeScript', value: 'typescript', lcSlug: 'typescript' },
  { label: 'Java', value: 'java', lcSlug: 'java' },
  { label: 'C++', value: 'cpp', lcSlug: 'cpp' },
  { label: 'Go', value: 'go', lcSlug: 'golang' },
]

function extractSlug(url) {
  if (!url) return null
  const m = url.match(/leetcode\.com\/problems\/([^/?#]+)/)
  return m ? m[1] : null
}

function stripHtml(html) {
  if (!html) return ''
  return html
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, c) => '\n' + c.replace(/<[^>]+>/g, '') + '\n')
    .replace(/<li>/gi, '\n• ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .trim()
}

export default function ProblemPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { progressMap, toggleProgress } = useProgress()

  const [problem, setProblem] = useState(null)       // our DB problem
  const [lcData, setLcData] = useState(null)          // leetcode data
  const [lcLoading, setLcLoading] = useState(false)
  const [lcError, setLcError] = useState(false)
  const [lang, setLang] = useState(LANGUAGES[0])
  const [code, setCode] = useState('')
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const langMenuRef = useRef(null)

  const isCompleted = !!progressMap[id]

  // Fetch our problem from DB
  useEffect(() => {
    api.get(`/problems/${id}`)
      .then(({ data }) => setProblem(data))
      .catch(() => setProblem(null))
  }, [id])

  // Fetch LeetCode data once we have the problem's leetcodeLink
  useEffect(() => {
    if (!problem) return
    const slug = extractSlug(problem.leetcodeLink)
    if (!slug) return

    setLcLoading(true)
    setLcError(false)
    api.get(`/leetcode/problem?slug=${slug}`)
      .then(({ data: q }) => {
        setLcData(q)
        const snippet = q.codeSnippets?.find((s) => s.langSlug === lang.lcSlug)
        if (snippet) setCode(snippet.code)
      })
      .catch(() => setLcError(true))
      .finally(() => setLcLoading(false))
  }, [problem])

  // Update code when language changes
  const handleLangChange = (newLang) => {
    setLang(newLang)
    setLangMenuOpen(false)
    if (lcData?.codeSnippets) {
      const snippet = lcData.codeSnippets.find((s) => s.langSlug === newLang.lcSlug)
      setCode(snippet?.code ?? `// Start coding in ${newLang.label}`)
    }
  }

  // Close lang menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const diffColor = {
    Easy: 'text-easy', Medium: 'text-medium', Hard: 'text-hard'
  }[problem?.difficulty] ?? 'text-gray-400'

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-800 bg-gray-900 shrink-0">
        <button
          onClick={() => navigate('/sheet')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} /> Back
        </button>

        <div className="h-4 w-px bg-gray-700" />

        {problem ? (
          <>
            <span className="text-sm font-medium text-gray-100 truncate">{problem.title}</span>
            <span className={`text-xs font-medium ${diffColor}`}>{problem.difficulty}</span>
          </>
        ) : (
          <div className="w-40 h-4 bg-gray-800 rounded animate-pulse" />
        )}

        <div className="ml-auto flex items-center gap-3">
          {/* Resource links */}
          {problem?.leetcodeLink && (
            <a href={problem.leetcodeLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-yellow-400 hover:opacity-100 opacity-70 transition-opacity cursor-pointer">
              <ExternalLink size={13} /> LeetCode
            </a>
          )}
          {problem?.ytLink && (
            <a href={problem.ytLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-red-400 hover:opacity-100 opacity-70 transition-opacity cursor-pointer">
              <Youtube size={13} /> Video
            </a>
          )}
          {problem?.articleLink && (
            <a href={problem.articleLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-400 hover:opacity-100 opacity-70 transition-opacity cursor-pointer">
              <BookOpen size={13} /> Article
            </a>
          )}

          {/* Mark complete */}
          <button
            onClick={() => toggleProgress(id, isCompleted)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer
              ${isCompleted
                ? 'bg-green-900/40 border-green-700 text-green-400 hover:bg-green-900/60'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
              }`}
          >
            {isCompleted ? <CheckCircle size={13} /> : <Circle size={13} />}
            {isCompleted ? 'Completed' : 'Mark Complete'}
          </button>
        </div>
      </header>

      {/* Main split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: problem description */}
        <div className="w-[42%] flex flex-col border-r border-gray-800 overflow-y-auto">
          <div className="p-5 text-sm text-gray-300 leading-relaxed">
            {lcLoading && (
              <div className="flex items-center gap-2 text-gray-500 py-8 justify-center">
                <Spinner /> Loading problem from LeetCode...
              </div>
            )}

            {!lcLoading && lcError && (
              <div className="text-gray-500 py-8 text-center">
                <p className="mb-2">Couldn't load LeetCode data.</p>
                {problem?.leetcodeLink && (
                  <a href={problem.leetcodeLink} target="_blank" rel="noopener noreferrer"
                    className="text-yellow-400 hover:underline cursor-pointer">
                    Open on LeetCode →
                  </a>
                )}
              </div>
            )}

            {!lcLoading && lcData && (
              <>
                <h2 className="text-base font-semibold text-gray-100 mb-1">{lcData.title}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs font-medium ${diffColor}`}>{lcData.difficulty}</span>
                  {lcData.topicTags?.map((t) => (
                    <span key={t.name} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{t.name}</span>
                  ))}
                </div>
                <div className="whitespace-pre-wrap text-gray-300 text-sm leading-7">
                  {stripHtml(lcData.content)}
                </div>
                {lcData.hints?.length > 0 && (
                  <details className="mt-6 group">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 select-none">
                      {lcData.hints.length} hint{lcData.hints.length > 1 ? 's' : ''}
                    </summary>
                    <ul className="mt-2 space-y-2">
                      {lcData.hints.map((h, i) => (
                        <li key={i} className="text-xs text-gray-400 bg-gray-800/60 rounded p-2">{stripHtml(h)}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </>
            )}

            {!lcLoading && !lcData && !lcError && !problem?.leetcodeLink && problem && (
              <p className="text-gray-500 py-8 text-center">No LeetCode link for this problem.</p>
            )}
          </div>
        </div>

        {/* Right: editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor toolbar */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800 bg-gray-900 shrink-0">
            {/* Language selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setLangMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 text-xs bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg hover:border-gray-500 transition-colors cursor-pointer"
              >
                {lang.label} <ChevronDown size={12} />
              </button>
              {langMenuOpen && (
                <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 min-w-[120px]">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => handleLangChange(l)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-700 transition-colors cursor-pointer first:rounded-t-lg last:rounded-b-lg
                        ${l.value === lang.value ? 'text-brand-500' : 'text-gray-300'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-xs text-gray-600 ml-auto">Monaco Editor</span>
          </div>

          {/* Monaco */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={lang.value}
              value={code}
              onChange={(v) => setCode(v ?? '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                tabSize: 4,
                wordWrap: 'on',
                padding: { top: 12 },
                smoothScrolling: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
