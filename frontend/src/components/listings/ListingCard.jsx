import { Link } from 'react-router-dom'
import { getMaterial } from '../../lib/constants'
import { formatCurrency, formatRelative, formatWeight } from '../../lib/formatters'
import StatusBadge from '../ui/StatusBadge'

export default function ListingCard({ listing }) {
  const material = getMaterial(listing.materialCode)
  const photo = listing.photoUrls?.[0]

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      {photo ? (
        <figure className="aspect-[16/9] bg-base-200">
          <img src={photo} alt="" className="w-full h-full object-cover" />
        </figure>
      ) : (
        <div className="aspect-[16/9] bg-base-200 flex items-center justify-center">
          <span className="text-5xl opacity-40" aria-hidden="true">
            {material.emoji}
          </span>
        </div>
      )}

      <div className="card-body p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold truncate">
              {material.emoji} {material.label}
            </h3>
            <p className="text-xs opacity-60 mt-0.5">
              {formatWeight(listing.estimatedWeightKg)} · est.
            </p>
          </div>
          <StatusBadge status={listing.status} size="sm" />
        </div>

        {listing.description && (
          <p className="text-xs opacity-70 line-clamp-2">
            {listing.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs opacity-70 mt-1 pt-2 border-t border-base-200">
          <span>📍 {listing.address?.city || '—'}</span>
          <span>{formatRelative(listing.createdAt)}</span>
        </div>

        {listing.finalPrice != null && (
          <div className="text-sm font-semibold text-primary">
            {formatCurrency(listing.finalPrice)} paid
          </div>
        )}
      </div>
    </Link>
  )
}