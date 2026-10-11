import { Link } from 'react-router-dom'

export default function EmptyState({
  emoji = '📭',
  title = 'Nothing here yet',
  description,
  actionLabel,
  actionTo,
  onAction,
  className = '',
}) {
  const action =
    actionTo && actionLabel ? (
      <Link to={actionTo} className="btn btn-primary btn-sm mt-2">
        {actionLabel}
      </Link>
    ) : onAction && actionLabel ? (
      <button type="button" className="btn btn-primary btn-sm mt-2" onClick={onAction}>
        {actionLabel}
      </button>
    ) : null

  return (
    <div className={`flex flex-col items-center justify-center text-center py-10 px-4 ${className}`}>
      <div className="text-5xl mb-3" aria-hidden="true">{emoji}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      {description && (
        <p className="text-sm opacity-70 max-w-sm mt-1">{description}</p>
      )}
      {action}
    </div>
  )
}