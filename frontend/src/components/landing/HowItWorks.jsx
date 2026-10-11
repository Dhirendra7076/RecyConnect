const STEPS = [
  {
    emoji: '📝',
    title: 'List your waste',
    desc: 'Snap a photo, pick materials, set an approximate weight.',
  },
  {
    emoji: '🤝',
    title: 'Get matched',
    desc: 'We connect you with verified recyclers closest to you.',
  },
  {
    emoji: '🚛',
    title: 'Pickup & weigh',
    desc: 'They arrive at your door. Weight and price confirmed on the spot.',
  },
  {
    emoji: '🌱',
    title: 'Track impact',
    desc: 'See kg recycled, CO₂ saved, and money earned in your dashboard.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-emerald-950">
            How it works
          </h2>
          <p className="opacity-70 mt-2">
            Four simple steps from clutter to cash.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={i} className="card bg-base-100 shadow-md">
              <div className="card-body items-start gap-1">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-3xl" aria-hidden="true">{s.emoji}</span>
                  <span className="badge badge-primary badge-sm ml-auto">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mt-1">{s.title}</h3>
                <p className="text-sm opacity-70">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}