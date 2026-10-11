import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function PublicTopBar() {
  const { isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-base-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-emerald-900"
        >
          <span aria-hidden="true">♻️</span>
          <span>RecyConnect</span>
        </Link>

        <nav className="flex items-center gap-1">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign in
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}