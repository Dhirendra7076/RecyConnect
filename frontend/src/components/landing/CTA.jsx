import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function CTA() {
  const { isAuthenticated } = useAuth()

  return (
    <section className="py-14 lg:py-20 bg-gradient-to-b from-emerald-50 to-emerald-100">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="text-5xl" aria-hidden="true">♻️</div>
        <h2 className="text-3xl lg:text-4xl font-bold text-emerald-950 mt-3">
          Ready to clear the clutter?
        </h2>
        <p className="mt-3 opacity-80">
          Sign up free. No fees for households — ever.
        </p>
        <div className="mt-6">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Go to dashboard
            </Link>
          ) : (
            <Link to="/signup" className="btn btn-primary btn-lg">
              Create your account
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}