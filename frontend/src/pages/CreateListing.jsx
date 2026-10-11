import { Link } from 'react-router-dom'
import ListingForm from '../components/listings/ListingForm'

export default function CreateListing() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <Link
          to="/listings"
          className="text-sm opacity-60 hover:opacity-100 inline-flex items-center gap-1"
        >
          ← My listings
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold mt-2">
          Create a listing
        </h1>
        <p className="text-sm opacity-70 mt-1">
          Tell us what you have. Recyclers nearby will see it instantly.
        </p>
      </header>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <ListingForm />
        </div>
      </div>
    </div>
  )
}