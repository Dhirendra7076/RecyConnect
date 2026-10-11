import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-6xl">🤷</div>
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="opacity-70">That link doesn’t exist — maybe it got recycled.</p>
      <Link to="/" className="btn btn-primary">
        Back to home
      </Link>
    </div>
  )
}