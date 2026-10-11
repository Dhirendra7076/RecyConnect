import { useEffect, useState } from 'react'
import { listMaterials } from '../../api/materials'
import { useToast } from '../../hooks/useToast'
import { getMaterial } from '../../lib/constants'
import Loader from '../ui/Loader'

export default function MaterialsShowcase() {
  const toast = useToast()
  const [materials, setMaterials] = useState(null) // null = loading
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await listMaterials()
        if (!cancelled) setMaterials(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) {
          setMaterials([])
          toast.error('Could not load material rates')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [toast])

  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-emerald-950">
            Today’s indicative rates
          </h2>
          <p className="opacity-70 mt-2">
            Fair rates for the materials people recycle most.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader label="Loading rates…" />
          </div>
        ) : materials.length === 0 ? (
          <p className="text-center opacity-60 text-sm">
            Rates are being updated. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {materials.map((m) => {
              const meta = getMaterial(m.code)
              return (
                <div
                  key={m.code}
                  className="card bg-base-100 shadow-sm border border-base-300"
                >
                  <div className="card-body p-4 items-center text-center">
                    <div className="text-3xl" aria-hidden="true">{meta.emoji}</div>
                    <p className="font-medium text-sm mt-1">{meta.label}</p>
                    <p className="text-lg font-bold text-primary">
                      ₹{m.pricePerKg ?? '—'}
                      <span className="text-xs opacity-60 font-normal"> /kg</span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="text-center text-xs opacity-50 mt-4">
          Final price is confirmed by the recycler after weighing.
        </p>
      </div>
    </section>
  )
}