import { formatCurrency } from '../../lib/formatters'

export default function EarningsCard({
  amount,
  label = 'Total earned',
  sublabel = 'All time',
  emoji = '💰',
}) {
  return (
    <div className="card bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200 shadow-sm">
      <div className="card-body p-4 gap-1">
        <div className="text-3xl" aria-hidden="true">{emoji}</div>
        <div className="text-3xl font-extrabold text-emerald-800">
          {formatCurrency(amount)}
        </div>
        <div className="text-sm font-medium text-emerald-900">{label}</div>
        <div className="text-xs opacity-70 mt-0.5">{sublabel}</div>
      </div>
    </div>
  )
}