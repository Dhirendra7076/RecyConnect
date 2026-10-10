import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Landing() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4 bg-gradient-to-b from-emerald-50 to-emerald-100">
      <div className="text-6xl" aria-hidden="true">♻️</div>
      <h1 className="text-4xl font-bold text-emerald-900">RecyConnect</h1>
      <p className="opacity-70 max-w-md">
        Turn your waste into value. Connect with local kabadiwalas in minutes.
      </p>
      <div className="flex gap-3 mt-2">
        {isAuthenticated ? (
          <Link to="/dashboard" className="btn btn-primary">
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline">
              Sign in
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Get started
            </Link>
          </>
        )}
      </div>
      <p className="text-xs opacity-50 mt-6">Landing page is a placeholder — Step 5</p>
    </div>
  )
}