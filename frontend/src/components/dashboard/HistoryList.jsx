import { Link } from 'react-router-dom'
import { getMaterial } from '../../lib/constants'
import { formatCurrency, formatRelative, formatWeight } from '../../lib/formatters'

export default function HistoryList({ transactions = [], limit = 5, fromPath }) {
  const items = transactions.slice(0, limit)

  if (!items.length) {
    return (
      <p className="text-sm opacity-60">
        Completed pickups will appear here.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-base-200 -mx-2">
      {items.map((t) => {
        const material = getMaterial(t.materialCode)
        return (
          <li key={t.id}>
            <Link
              to={`/transaction/${t.id}`}
              state={fromPath ? { from: fromPath } : undefined}
              className="flex items-center gap-3 px-2 py-3 hover:bg-base-200/50 rounded-lg transition-colors"
            >
              <span className="text-2xl shrink-0" aria-hidden="true">
                {material.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{material.label}</p>
                <p className="text-xs opacity-60">
                  {formatWeight(t.finalWeightKg)} · {formatRelative(t.updatedAt)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-success">
                  {formatCurrency(t.finalPrice)}
                </p>
                <p className="text-xs opacity-50">→</p>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}