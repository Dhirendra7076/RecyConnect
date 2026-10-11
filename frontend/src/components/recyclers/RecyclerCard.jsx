import { getMaterial } from '../../lib/constants'
import { formatKm } from '../../lib/geo'
import { initials } from '../../lib/formatters'
import Button from '../ui/Button'

function Stars({ rating }) {
  const rounded = Math.round(rating * 2) / 2
  const full = Math.floor(rounded)
  const half = rounded % 1 !== 0
  return (
    <span className="text-xs">
      <span className="text-amber-500">
        {'★'.repeat(full)}
        {half ? '⯨' : ''}
        {'☆'.repeat(5 - full - (half ? 1 : 0))}
      </span>
      <span className="opacity-60 ml-1">{rating.toFixed(1)}</span>
    </span>
  )
}

export default function RecyclerCard({ match, selected, onSelect, busy }) {
  const { recycler, distanceKm, estimatedPickupIn } = match

  return (
    <div
      className={[
        'card bg-base-100 shadow-md transition-shadow',
        selected ? 'ring-2 ring-primary shadow-lg' : '',
      ].join(' ')}
    >
      <div className="card-body p-4 gap-2">
        <div className="flex items-start gap-3">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-12">
              <span className="text-sm font-bold">
                {initials(recycler.displayName)}
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold truncate">{recycler.displayName}</p>
              {selected && (
                <span className="badge badge-primary badge-sm">Selected</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <Stars rating={recycler.rating} />
              <span className="text-xs opacity-60">
                · {recycler.pickupsCompleted} pickups
              </span>
            </div>
            <p className="text-xs opacity-70 mt-1">
              📍 {formatKm(distanceKm)} away · ⏱ {estimatedPickupIn}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-1">
          {recycler.materials.slice(0, 5).map((code) => {
            const m = getMaterial(code)
            return (
              <span
                key={code}
                className="badge badge-ghost badge-sm text-xs"
                title={m.label}
              >
                {m.emoji} {m.label}
              </span>
            )
          })}
        </div>

        <div className="card-actions mt-2">
          <Button
            variant={selected ? 'outline' : 'primary'}
            size="sm"
            className="w-full"
            disabled={selected}
            loading={busy}
            onClick={() => onSelect?.(recycler)}
          >
            {selected ? '✓ Selected' : 'Choose this recycler'}
          </Button>
        </div>
      </div>
    </div>
  )
}