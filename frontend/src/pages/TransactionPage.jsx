import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { useListing } from '../hooks/useListings'
import TransactionSummary from '../components/transactions/TransactionSummary'
import WeightPriceForm from '../components/transactions/WeightPriceForm'
import StatusActions from '../components/listings/StatusActions'
import StatusTimeline from '../components/listings/StatusTimeline'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import Card from '../components/ui/Card'

const READY_STATUSES = [
  'COLLECTED',
  'PRICE_CONFIRMED',
  'PAYMENT_PENDING',
  'COMPLETED',
]

// Optional: map a source path to a friendly label
const LABEL_FOR_PATH = {
  '/impact': '← Back to impact',
  '/dashboard': '← Back to dashboard',
  '/listings': '← Back to my listings',
  '/recycler/dashboard': '← Back to pickups',
}

export default function TransactionPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { listing, loading, error, refresh } = useListing(id)
  const toast = useToast()
  const location = useLocation()

  const fromPath = location.state?.from

  useEffect(() => {
    if (error && error.status !== 404) {
      toast.error(error.message || 'Could not load transaction')
    }
  }, [error, toast])

  // --- Loading ---
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Loader fullScreen label="Loading transaction…" />
      </div>
    )
  }

  // --- Error ---
  if (error || !listing) {
    const errBack = fromPath || '/dashboard'
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <Link to={errBack} className="text-sm opacity-60 hover:opacity-100">
          {LABEL_FOR_PATH[errBack] || '← Back'}
        </Link>
        <div className="card bg-base-100 shadow-md">
          <EmptyState
            emoji={error?.status === 404 ? '🔍' : '⚠️'}
            title={error?.status === 404 ? 'Listing not found' : 'Could not load transaction'}
            description={
              error?.status === 404
                ? 'It may have been removed, or you may not have access.'
                : error?.message
            }
            actionLabel="Back to impact"
            actionTo={errBack}
          />
        </div>
      </div>
    )
  }

  const isAssignedRecycler =
    user.role === 'recycler' && listing.recyclerId === user.id
  const isOwnerHousehold =
    user.role === 'household' && listing.householdId === user.id

  // --- Access control ---
  if (!isAssignedRecycler && !isOwnerHousehold) {
    const lockBack = fromPath || '/dashboard'
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <Link to={lockBack} className="text-sm opacity-60 hover:opacity-100">
          {LABEL_FOR_PATH[lockBack] || '← Back'}
        </Link>
        <div className="card bg-base-100 shadow-md">
          <EmptyState
            emoji="🔒"
            title="Not your transaction"
            description="Only the household and assigned recycler can view this."
            actionLabel="Back"
            actionTo={lockBack}
          />
        </div>
      </div>
    )
  }

  // --- Not ready yet ---
  if (!READY_STATUSES.includes(listing.status)) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <Link
          to={`/listings/${listing.id}`}
          className="text-sm opacity-60 hover:opacity-100"
        >
          ← Back to listing
        </Link>
        <div className="card bg-base-100 shadow-md">
          <EmptyState
            emoji="⏳"
            title="Not ready yet"
            description="Weight and price are entered after the pickup is collected."
            actionLabel="View listing"
            actionTo={`/listings/${listing.id}`}
          />
        </div>
      </div>
    )
  }

  // --- Main view ---
  const defaultBack = isAssignedRecycler ? '/recycler/dashboard' : '/listings'
  const backTo = fromPath || defaultBack
  const backLabel =
    LABEL_FOR_PATH[backTo] ||
    (isAssignedRecycler ? '← Back to pickups' : '← Back to my listings')

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link to={backTo} className="text-sm opacity-60 hover:opacity-100">
        {backLabel}
      </Link>

      <header>
        <h1 className="text-2xl lg:text-3xl font-bold">Transaction</h1>
        <p className="text-sm opacity-70 mt-1">
          {isAssignedRecycler
            ? 'Confirm weight and price to complete the pickup.'
            : 'Review and pay for the pickup.'}
        </p>
      </header>

      {listing.status === 'COLLECTED' && isAssignedRecycler && (
        <WeightPriceForm listing={listing} onCompleted={refresh} />
      )}

      {listing.status !== 'COLLECTED' && (
        <>
          <TransactionSummary listing={listing} viewerRole={user.role} />

          <Card>
            <h2 className="font-semibold mb-3">Progress</h2>
            <StatusTimeline
              status={listing.status}
              history={listing.statusHistory}
            />
          </Card>

          <div className="flex justify-end">
            <StatusActions listing={listing} onUpdated={refresh} size="lg" />
          </div>
        </>
      )}
    </div>
  )
}