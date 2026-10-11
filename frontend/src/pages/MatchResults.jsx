import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMatches } from '../hooks/useRecyclers'
import { useToast } from '../hooks/useToast'
import { updateListingStatus } from '../api/listings'
import { getMaterial } from '../lib/constants'
import { formatWeight } from '../lib/formatters'
import MapView from '../components/map/MapView'
import MatchList from '../components/recyclers/MatchList'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function MatchResults() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const location = useLocation()
  const fromDashboard = location.state?.from
  const { data, loading, error } = useMatches(listingId)

  const [selectedId, setSelectedId] = useState(null)
  const [busyRecyclerId, setBusyRecyclerId] = useState(null)
  const [showMapMobile, setShowMapMobile] = useState(false)

  const center = useMemo(() => {
    if (!data?.listing) return null
    return { lat: data.listing.lat, lng: data.listing.lng }
  }, [data])

  useEffect(() => {
    if (error) toast.error(error.message || 'Could not load matches')
  }, [error, toast])

  async function handleChoose(recycler) {
    if (selectedId === recycler.id) return
    setBusyRecyclerId(recycler.id)
    try {
      // Note: in the real backend this is a recycler-only endpoint.
      // The mock allows the household to assign for demo purposes.
        await updateListingStatus(data.listing.id, 'ACCEPTED', {
        recyclerId: recycler.id,
        recyclerName: recycler.displayName,
      })
      setSelectedId(recycler.id)
      toast.success(
        `${recycler.displayName} selected — they'll confirm shortly.`
      )
      // Give the user a beat, then route to the detail page.
      setTimeout(() => navigate(`/listings/${data.listing.id}`), 900)
    } catch (err) {
      toast.error(err.message || 'Could not assign recycler')
    } finally {
      setBusyRecyclerId(null)
    }
  }

  // --- loading ---
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Loader fullScreen label="Finding recyclers near you…" />
      </div>
    )
  }

  // --- error / not found ---
  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <Link
  to={`/listings/${listing.id}`}
  state={fromDashboard ? { from: fromDashboard } : undefined}
  className="..."
>
  ← Back to listing
</Link>
        <div className="card bg-base-100 shadow-md">
          <EmptyState
            emoji={error?.status === 404 ? '🔍' : '⚠️'}
            title={
              error?.status === 404
                ? 'Listing not found'
                : 'Could not find matches'
            }
            description={
              error?.status === 404
                ? 'It may have been removed.'
                : error?.message
            }
            actionLabel="Back to my listings"
            actionTo="/listings"
          />
        </div>
      </div>
    )
  }

  const { listing, matches } = data
  const material = getMaterial(listing.materialCode)

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <Link
  to={`/listings/${listing.id}`}
  state={fromDashboard ? { from: fromDashboard } : undefined}
  className="..."
>
  ← Back to listing
</Link>
        <h1 className="text-2xl lg:text-3xl font-bold mt-2">
          Recyclers near you
        </h1>
        <p className="text-sm opacity-70 mt-1">
          {material.emoji} {material.label} · est.{' '}
          {formatWeight(listing.estimatedWeightKg)} · {listing.address?.city}
        </p>
      </div>

      {/* Listing summary strip */}
      <Card>
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">{material.emoji}</span>
          <div className="min-w-0">
            <p className="font-semibold truncate">{material.label}</p>
            <p className="text-xs opacity-70 truncate">
              {listing.address?.line1} · {listing.address?.pincode}
            </p>
          </div>
          <span className="badge badge-info ml-auto">
            {matches.length} match{matches.length === 1 ? '' : 'es'}
          </span>
        </div>
      </Card>

      {/* Map (mobile: toggle) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Map</h2>
          <button
            type="button"
            className="btn btn-ghost btn-xs sm:hidden"
            onClick={() => setShowMapMobile((v) => !v)}
          >
            {showMapMobile ? 'Hide map' : 'Show map'}
          </button>
        </div>

        <div className={showMapMobile ? 'block' : 'hidden sm:block'}>
          {center && (
            <MapView
              center={center}
              household={{
                lat: listing.lat,
                lng: listing.lng,
                address: listing.address,
              }}
              recyclers={matches}
              height={360}
              onSelectRecycler={handleChoose}
            />
          )}
        </div>
      </div>

      {/* Recycler list */}
      <div>
        <h2 className="font-semibold mb-3">
          Top {matches.length} recycler{matches.length === 1 ? '' : 's'}
        </h2>
        <MatchList
          matches={matches}
          selectedId={selectedId}
          onSelect={handleChoose}
          busyRecyclerId={busyRecyclerId}
        />
      </div>

      {/* Footer hint */}
      <p className="text-xs text-center opacity-50 pt-2">
        Distances are approximate. Final price is confirmed after weighing.
      </p>
    </div>
  )
}