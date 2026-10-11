const IMPACT_STATS = [
  { emoji: '♻️', value: '12,000+', label: 'kg recycled every month' },
  { emoji: '🌳', value: '3,400+', label: 'trees-equivalent CO₂ saved' },
  { emoji: '🤝', value: '850+', label: 'kabadiwalas onboarded' },
]

export default function ImpactTeaser() {
  return (
    <section className="py-14 lg:py-20 bg-emerald-900 text-emerald-50">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold">
          Small actions, big impact
        </h2>
        <p className="mt-3 opacity-80 max-w-2xl mx-auto">
          Every pickup keeps material out of landfills and puts money directly
          into the hands of informal recyclers.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {IMPACT_STATS.map((s) => (
            <div key={s.label}>
              <div className="text-4xl" aria-hidden="true">{s.emoji}</div>
              <div className="text-3xl font-bold mt-2">{s.value}</div>
              <div className="text-sm opacity-80 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}