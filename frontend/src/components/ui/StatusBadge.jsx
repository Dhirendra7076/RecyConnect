import {
  LISTING_STATUS_BADGE,
  LISTING_STATUS_LABELS,
} from '../../lib/constants'

export default function StatusBadge({ status, size = 'md', className = '' }) {
  if (!status) return null

  const colorCls = LISTING_STATUS_BADGE[status] || 'badge-ghost'
  const label = LISTING_STATUS_LABELS[status] || status
  const sizeCls = size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : ''

  return (
    <span className={`badge ${colorCls} ${sizeCls} ${className}`.trim()}>
      {label}
    </span>
  )
}