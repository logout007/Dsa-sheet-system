const styles = {
  Easy:   'bg-green-950 text-green-400 border border-green-800',
  Medium: 'bg-amber-950 text-amber-400 border border-amber-800',
  Hard:   'bg-red-950 text-red-400 border border-red-800',
}

export default function DifficultyBadge({ difficulty }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[difficulty] ?? 'bg-gray-800 text-gray-400'}`}>
      {difficulty}
    </span>
  )
}
