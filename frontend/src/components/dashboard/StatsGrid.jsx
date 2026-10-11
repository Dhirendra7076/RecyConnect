export default function StatsGrid({ items = [] }) {
  if (!items.length) return null

  return (
    <div className="stats stats-vertical sm:stats-horizontal shadow-md w-full bg-base-100">
      {items.map((item, i) => (
        <div key={i} className="stat">
          {item.emoji && (
            <div className="stat-figure text-2xl" aria-hidden="true">
              {item.emoji}
            </div>
          )}
          <div className="stat-title text-xs">{item.label}</div>
          <div className={`stat-value text-2xl ${item.loading ? 'opacity-40' : ''}`}>
            {item.loading ? '—' : item.value}
          </div>
          {item.hint && (
            <div className="stat-desc text-xs">{item.hint}</div>
          )}
        </div>
      ))}
    </div>
  )
}