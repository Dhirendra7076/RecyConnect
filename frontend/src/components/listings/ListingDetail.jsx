import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { getMaterial } from '../../lib/constants'
import {
  formatCurrency,
  formatRelative,
  formatWeight,
} from '../../lib/formatters'
import {
  acceptListing,
  updateListingStatus,
} from '../../api/listings'
import StatusBadge from '../ui/StatusBadge'
import Button from '../ui/Button'
import Card from '../ui/Card'
import StatusTimeline from './StatusTimeline'

function PhotoGallery({ urls = [], fallbackEmoji }) {
  if (!urls.length) {
    return (
      <div className="aspect-[16/9] bg-base-200 rounded-2xl flex items-center justify-center">
        <span className="text-6xl opacity-40" aria-hidden="true">{fallbackEmoji}</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {urls.map((url, i) => (
        <figure
          key={i}
          className={`overflow-hidden rounded-2xl bg-base-200 ${
            urls.length === 1 ? 'col-span-2 aspect-[16/9]' : 'aspect-square'
          }`}
        >
          <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
        </figure>
      ))}
    </div>
  )
}

export default function ListingDetail({ listing, onUpdated }) {
  const { user } = useAuth()
  const toast = useToast()
  const [busy, setBusy] = useState(null) // 'cancel' | 'accept' | null

  const material = getMaterial(listing.materialCode)
  const isOwner = listing.householdId === user.id
  const isAssigned = listing.recyclerId === user.id
  const isOpen = listing.status === 'OPEN'

  const canCancel = isOwner && ['OPEN', 'ACCEPTED'].includes(listing.status)
  const canFindRecyclers = isOwner && isOpen
  const canAccept = user.role === 'recycler' && isOpen && !isAssigned

  async function handleCancel() {
    if (!window.confirm('Cancel this listing? This cannot be undone.')) return
    setBusy('cancel')
    try {
      const updated = await updateListingStatus(listing.id, 'CANCELLED')
      toast.info('Listing cancelled')
      onUpdated?.(updated)
    } catch (err) {
      toast.error(err.message || 'Could not cancel')
    } finally {
      setBusy(null)
    }
  }

  async function handleAccept() {
    setBusy('accept')
    try {
      const updated = await acceptListing(listing.id)
      toast.success('Pickup accepted — coordinate with the household.')
      onUpdated?.(updated)
    } catch (err) {
      toast.error(err.message || 'Could not accept')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-5">
      <PhotoGallery urls={listing.photoUrls} fallbackEmoji={material.emoji} />

      <div>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">
              {material.emoji} {material.label}
            </h1>
            <p className="text-sm opacity-70 mt-1">
              Est. {formatWeight(listing.estimatedWeightKg)} ·{' '}
              {formatRelative(listing.createdAt)}
            </p>
          </div>
          <StatusBadge status={listing.status} />
        </div>
      </div>

      {listing.description && (
        <Card>
          <p className="text-sm whitespace-pre-line">{listing.description}</p>
        </Card>
      )}

      <Card>
        <h2 className="font-semibold mb-3">Progress</h2>
        <StatusTimeline status={listing.status} history={listing.statusHistory} />
      </Card>

      <Card>
        <h2 className="font-semibold mb-3">Pickup address</h2>
        <div className="text-sm space-y-0.5">
          <p className="font-medium">{listing.address?.line1 || '—'}</p>
          <p className="opacity-80">
            {listing.address?.city} · {listing.address?.pincode}
          </p>
        </div>
        <p className="text-xs opacity-60 mt-3">
          {isOwner
            ? 'Recyclers see this after accepting.'
            : 'Shared with you because you have access to this listing.'}
        </p>
      </Card>

      {(listing.recyclerName || listing.householdName) && (
        <Card>
          <h2 className="font-semibold mb-3">
            {isOwner ? 'Assigned recycler' : 'Household'}
          </h2>
          <p className="text-sm">
            <span className="opacity-60">
              {isOwner ? 'Recycler' : 'Household'}:
            </span>{' '}
            <span className="font-medium">
              {isOwner ? listing.recyclerName || '—' : listing.householdName}
            </span>
          </p>
        </Card>
      )}

      {listing.finalPrice != null && (
        <Card className="border-2 border-success">
          <h2 className="font-semibold mb-1">Final</h2>
          <p className="text-2xl font-bold text-success">
            {formatCurrency(listing.finalPrice)}
          </p>
          <p className="text-xs opacity-70 mt-1">
            for {formatWeight(listing.finalWeightKg)}
          </p>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        {canFindRecyclers && (
          <Link
            to={`/match/${listing.id}`}
            className="btn btn-primary flex-1"
          >
            🔍 Find recyclers
          </Link>
        )}
        {canAccept && (
          <Button
            variant="primary"
            loading={busy === 'accept'}
            onClick={handleAccept}
            className="flex-1"
          >
            ✅ Accept this pickup
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            loading={busy === 'cancel'}
            onClick={handleCancel}
            className="flex-1"
          >
            Cancel listing
          </Button>
        )}
      </div>
    </div>
  )
}