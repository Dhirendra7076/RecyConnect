import { Link } from 'react-router-dom'
import { getMaterial } from '../../lib/constants'
import { formatRelative, formatWeight } from '../../lib/formatters'
import StatusBadge from '../ui/StatusBadge'
import StatusActions from '../listings/StatusActions'

export default function RecyclerListingRow({ listing, variant = 'incoming', onUpdated }) {
  const material = getMaterial(listing.materialCode)
  const photo = listing.photoUrls?.[0]

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body p-4 gap-3">
        <div className="flex items-start gap-3">
          {photo ? (
            <figure className="w-16 h-16 rounded-xl overflow-hidden bg-base-200 shrink-0">
              <img src={photo} alt="" className="w-full h-full object-cover" />
            </figure>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-base-200 flex items-center justify-center text-3xl shrink-0">
              {material.emoji}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <Link
                to={`/listings/${listing.id}`}
                className="font-semibold truncate hover:text-primary"
              >
                {material.emoji} {material.label}
              </Link>
              <StatusBadge status={listing.status} size="sm" />
            </div>

            <p className="text-xs opacity-70 mt-1">
              Est. {formatWeight(listing.estimatedWeightKg)} ·{' '}
              {formatRelative(listing.createdAt)}
            </p>

            <p className="text-xs opacity-70 mt-0.5 truncate">
              📍 {listing.address?.line1 ? `${listing.address.line1}, ` : ''}
              {listing.address?.city} · {listing.address?.pincode}
            </p>

            {variant === 'incoming' && listing.householdName && (
              <p className="text-xs opacity-60 mt-0.5">
                From: {listing.householdName}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-base-200">
          <Link
            to={`/listings/${listing.id}`}
            className="btn btn-ghost btn-sm flex-1"
          >
            View details
          </Link>
          <StatusActions listing={listing} onUpdated={onUpdated} />
        </div>
      </div>
    </div>
  )
}