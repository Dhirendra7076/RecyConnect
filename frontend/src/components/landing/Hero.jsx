import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const MATERIAL_EMOJIS = ['📰', '📦', '🧴', '🥫', '🔩', '💻', '🔶', '♻️']

export default function Hero() {
  const { isAuthenticated } = useAuth()

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-emerald-100 to-white">
      {/* Decorative blurred blobs */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-200/50 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-lime-200/40 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto px-4 py-14 lg:py-24 text-center">
        <span className="badge badge-success badge-lg gap-1 mb-4">
          🇮🇳 Built for urban India
        </span>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-emerald-950 leading-tight">
          Recycle smarter.
          <br />
          <span className="text-primary">Get paid for your waste.</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg opacity-80 max-w-2xl mx-auto">
          RecyConnect matches your household waste with trusted kabadiwalas
          nearby. Schedule a pickup, watch the journey, and see your
          environmental impact — all in one place.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Go to dashboard →
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn btn-primary btn-lg">
                Get started — it’s free
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                I already have an account
              </Link>
            </>
          )}
        </div>

        {/* Material emoji strip */}
        <div className="mt-12 grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3 max-w-2xl mx-auto">
          {MATERIAL_EMOJIS.map((e, i) => (
            <div
              key={i}
              className="aspect-square bg-white rounded-2xl shadow-sm border border-base-200 flex items-center justify-center text-2xl sm:text-3xl"
              aria-hidden="true"
            >
              {e}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}