/**
 * Calculate per-topic stats from problems array and progressMap.
 * @param {Array} problems
 * @param {Object} progressMap  { [problemId]: boolean }
 * @returns {Array} [{ topicId, total, completed, percentage }]
 */
export function calcTopicStats(problems, progressMap) {
  const map = {}
  for (const p of problems) {
    const tid = p.topicId?.toString?.() ?? p.topicId
    if (!map[tid]) map[tid] = { topicId: tid, total: 0, completed: 0 }
    map[tid].total++
    if (progressMap[p._id]) map[tid].completed++
  }
  return Object.values(map).map((s) => ({
    ...s,
    percentage: s.total ? Math.round((s.completed / s.total) * 100) : 0,
  }))
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
