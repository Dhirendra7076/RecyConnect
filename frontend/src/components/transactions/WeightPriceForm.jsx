import { useState } from 'react'
import { completeListing } from '../../api/listings'
import { useToast } from '../../hooks/useToast'
import { formatCurrency, formatWeight } from '../../lib/formatters'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function WeightPriceForm({ listing, onCompleted }) {
  const toast = useToast()
  const [weight, setWeight] = useState(String(listing.estimatedWeightKg ?? ''))
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState({})

  const w = Number(weight)
  const p = Number(price)
  const rate =
    w > 0 && p > 0 && !Number.isNaN(w) && !Number.isNaN(p)
      ? Math.round(p / w)
      : null

  async function onSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!weight || Number.isNaN(w) || w <= 0) errs.weight = 'Enter the final weight'
    if (!price || Number.isNaN(p) || p < 0) errs.price = 'Enter the final price'
    if (Object.keys(errs).length) return setErrors(errs)

    setBusy(true)
    try {
      const updated = await completeListing(listing.id, {
        finalWeightKg: w,
        finalPrice: p,
        notes: notes.trim() || undefined,
      })
      toast.success('Price sent to household')
      onCompleted?.(updated)
    } catch (err) {
      toast.error(err.message || 'Could not save weight and price')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="border-2 border-primary/30">
      <h2 className="font-semibold text-base">Weigh & price</h2>
      <p className="text-xs opacity-70 mt-1">
        Estimated by household: {formatWeight(listing.estimatedWeightKg)}.
        Enter the exact weight you measured.
      </p>

      <form onSubmit={onSubmit} className="space-y-3 mt-3" noValidate>
        <Input
          label="Final weight (kg)"
          type="number"
          inputMode="decimal"
          min="0.1"
          step="0.1"
          placeholder="e.g. 4.2"
          value={weight}
          onChange={(e) => {
            setWeight(e.target.value)
            if (errors.weight) setErrors((x) => ({ ...x, weight: undefined }))
          }}
          error={errors.weight}
        />

        <Input
          label="Total payout to household (₹)"
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          placeholder="e.g. 50"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value)
            if (errors.price) setErrors((x) => ({ ...x, price: undefined }))
          }}
          error={errors.price}
          hint={rate != null ? `≈ ${formatCurrency(rate)} per kg` : undefined}
        />

        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text font-medium">
              Notes <span className="opacity-60 font-normal">(optional)</span>
            </span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            rows="2"
            maxLength={200}
            placeholder="Any deductions? Moisture content? Mixed material?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={busy}
          className="w-full"
        >
          Send price to household
        </Button>
      </form>

      <p className="text-xs opacity-60 mt-3">
        The household will confirm the price before paying you.
      </p>
    </Card>
  )
}