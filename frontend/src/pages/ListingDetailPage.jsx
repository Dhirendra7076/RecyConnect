import { Link, useLocation, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useListing } from '../hooks/useListings'
import { useToast } from '../hooks/useToast'
import ListingDetail from '../components/listings/ListingDetail'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'

const LABEL_FOR_PATH = {
  '/dashboard': '← Back to dashboard',
  '/listings': '← Back to my listings',
  '/impact': '← Back to impact',
  '/recycler/dashboard': '← Back to pickups',
  '/match': '← Back to matches',
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const { listing, loading, error, refresh } = useListing(id)
  const toast = useToast()
  const location = useLocation()

  const fromPath = location.state?.from

  useEffect(() => {
    if (error && error.status !== 404) {
      toast.error(error.message || 'Could not load listing')
    }
  }, [error, toast])

  // Fallback depends on who's viewing; harmless to default to /listings
  const backTo = fromPath || '/listings'
  const backLabel = LABEL_FOR_PATH[backTo] || '← Back'

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link to={backTo} className="text-sm opacity-60 hover:opacity-100 inline-flex items-center gap-1">
        {backLabel}
      </Link>

      {loading ? (
        <Loader fullScreen label="Loading listing…" />
      ) : error ? (
        <div className="card bg-base-100 shadow-md">
          <EmptyState
            emoji={error.status === 404 ? '🔍' : '⚠️'}
            title={error.status === 404 ? 'Listing not found' : 'Could not load listing'}
            description={
              error.status === 404
                ? 'It may have been removed, or you may not have access to it.'
                : error.message
            }
            actionLabel="Back"
            actionTo={backTo}
          />
        </div>
      ) : listing ? (
        <ListingDetail listing={listing} onUpdated={refresh} />
      ) : null}
    </div>
  )
}