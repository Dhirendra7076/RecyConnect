import { getMaterial } from '../../lib/constants'
import { formatCurrency, formatDateTime, formatWeight } from '../../lib/formatters'
import StatusBadge from '../ui/StatusBadge'
import Card from '../ui/Card'

function Row({ label, value, strong }) {
  return (
    <div className="flex justify-between items-baseline gap-3 py-1.5">
      <span className="text-sm opacity-70">{label}</span>
      <span className={`text-sm ${strong ? 'font-bold text-base' : 'font-medium'}`}>
        {value}
      </span>
    </div>
  )
}

export default function TransactionSummary({ listing, viewerRole }) {
  const material = getMaterial(listing.materialCode)
  const pricePerKg =
    listing.finalPrice != null && listing.finalWeightKg
      ? Math.round(listing.finalPrice / listing.finalWeightKg)
      : null

  const counterpartyLabel =
    viewerRole === 'recycler' ? 'Household' : 'Recycler'
  const counterpartyName =
    viewerRole === 'recycler'
      ? listing.householdName
      : listing.recyclerName || '—'

  return (
    <div className="space-y-4">
      <Card className="border-2 border-primary/20">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-4xl" aria-hidden="true">{material.emoji}</span>
            <div>
              <p className="font-semibold">{material.label}</p>
              <p className="text-xs opacity-70">
                Listing #{listing.id} · {formatDateTime(listing.updatedAt)}
              </p>
            </div>
          </div>
          <StatusBadge status={listing.status} />
        </div>

        <div className="divider my-2" />

        <Row label="Estimated weight" value={formatWeight(listing.estimatedWeightKg)} />
        <Row label="Final weight" value={formatWeight(listing.finalWeightKg)} strong />
        {pricePerKg != null && (
          <Row label="Rate" value={`${formatCurrency(pricePerKg)} / kg`} />
        )}
        <Row
          label="Total payout"
          value={formatCurrency(listing.finalPrice)}
          strong
        />

        <div className="divider my-2" />

        <Row label={counterpartyLabel} value={counterpartyName} />
        {listing.address && (
          <Row
            label="Pickup address"
            value={`${listing.address.city} · ${listing.address.pincode}`}
          />
        )}
      </Card>

      {listing.description && (
        <Card>
          <p className="text-xs uppercase opacity-50 mb-1">Notes from household</p>
          <p className="text-sm whitespace-pre-line">{listing.description}</p>
        </Card>
      )}
    </div>
  )
}