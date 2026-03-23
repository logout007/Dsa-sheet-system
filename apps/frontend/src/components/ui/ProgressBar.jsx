export default function ProgressBar({ percentage = 0, className = '', thin = false }) {
  const h = thin ? 'h-1' : 'h-2'
  return (
    <div className={`${h} w-full bg-gray-800 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-brand-500 rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, percentage)}%` }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}
