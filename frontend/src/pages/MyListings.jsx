import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useMyListings } from '../hooks/useListings'
import { useToast } from '../hooks/useToast'
import ListingCard from '../components/listings/ListingCard'
import EmptyState from '../components/ui/EmptyState'
import Loader from '../components/ui/Loader'
import Button from '../components/ui/Button'

export default function MyListings() {
  const { listings, loading, error, refresh } = useMyListings()
  const toast = useToast()
  const location = useLocation()

  // Success toast if we just created one
  useEffect(() => {
    if (location.state?.created) {
      // Clean the state so refresh doesn't re-toast
      window.history.replaceState({}, '')
    }
  }, [location.state])

  useEffect(() => {
    if (error) toast.error(error.message || 'Could not load listings')
  }, [error, toast])

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">My listings</h1>
          <p className="text-sm opacity-70 mt-1">
            Everything you’ve listed, sorted newest first.
          </p>
        </div>
        <Link to="/listings/new" className="btn btn-primary">
          ➕ New listing
        </Link>
      </header>

      {loading ? (
        <Loader fullScreen label="Loading your listings…" />
      ) : listings.length === 0 ? (
        <div className="card bg-base-100 shadow-md">
          <EmptyState
            emoji="📦"
            title="No listings yet"
            description="Post your first waste pickup. Takes less than a minute."
            actionLabel="Create a listing"
            actionTo="/listings/new"
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
          <div className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={refresh}>
              🔄 Refresh
            </Button>
          </div>
        </>
      )}
    </div>
  )
}