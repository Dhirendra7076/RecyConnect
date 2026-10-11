import { Link } from 'react-router-dom'
import { getMaterial } from '../../lib/constants'
import { formatRelative } from '../../lib/formatters'
import StatusBadge from '../ui/StatusBadge'

export default function RecentActivity({
  listings = [],
  limit = 4,
  emptyHint,
  fromPath,
}) {
  const items = listings.slice(0, limit)

  if (!items.length) {
    return <p className="text-sm opacity-60">{emptyHint}</p>
  }

  return (
    <ul className="divide-y divide-base-200 -mx-2">
      {items.map((l) => {
        const m = getMaterial(l.materialCode)
        return (
          <li key={l.id}>
            <Link
              to={`/listings/${l.id}`}
              state={fromPath ? { from: fromPath } : undefined}
              className="flex items-center gap-3 px-2 py-2.5 hover:bg-base-200/50 rounded-lg transition-colors"
            >
              <span className="text-2xl shrink-0" aria-hidden="true">
                {m.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{m.label}</p>
                <p className="text-xs opacity-60">
                  {formatRelative(l.createdAt)}
                </p>
              </div>
              <StatusBadge status={l.status} size="sm" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}