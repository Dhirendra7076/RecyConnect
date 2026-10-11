import { Link } from 'react-router-dom'

const ROLES = [
  {
    emoji: '🏠',
    title: 'For households',
    tagline: 'Turn clutter into cash',
    bullets: [
      'Post a listing in seconds',
      'Fair price, transparent weight',
      'Track pickup from your phone',
    ],
    cta: 'Sign up as household',
    accent: 'from-emerald-100 to-emerald-50',
  },
  {
    emoji: '🚛',
    title: 'For recyclers',
    tagline: 'More pickups, less haggling',
    bullets: [
      'See nearby pickup requests',
      'Direct chat with households',
      'Build a repeat customer base',
    ],
    cta: 'Join as recycler',
    accent: 'from-lime-100 to-lime-50',
  },
  {
    emoji: '🏭',
    title: 'For businesses',
    tagline: 'Verified volumes, real impact',
    bullets: [
      'Source bulk recyclables reliably',
      'Export-ready ESG reporting',
      'Traceable supply chain',
    ],
    cta: 'Partner with us',
    accent: 'from-teal-100 to-teal-50',
  },
]

export default function RoleCards() {
  return (
    <section className="py-14 lg:py-20 bg-base-200">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-emerald-950">
            Built for everyone in the loop
          </h2>
          <p className="opacity-70 mt-2">
            Whether you’re clearing a garage or running a recycling plant.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {ROLES.map((r) => (
            <div
              key={r.title}
              className={`card bg-gradient-to-b ${r.accent} shadow-md hover:shadow-lg transition-shadow`}
            >
              <div className="card-body">
                <div className="text-4xl" aria-hidden="true">{r.emoji}</div>
                <h3 className="card-title text-xl">{r.title}</h3>
                <p className="text-sm font-medium text-emerald-800">
                  {r.tagline}
                </p>

                <ul className="mt-2 space-y-1.5">
                  {r.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5" aria-hidden="true">
                        ✓
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="card-actions mt-4">
                  <Link to="/signup" className="btn btn-primary btn-sm w-full">
                    {r.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}