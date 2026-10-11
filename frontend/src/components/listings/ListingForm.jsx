import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MATERIALS } from '../../lib/constants'
import { validateListing } from '../../lib/validators'
import { createListing } from '../../api/listings'
import { useToast } from '../../hooks/useToast'
import Input from '../ui/Input'
import Button from '../ui/Button'
import PhotoUploader from './PhotoUploader'

const INITIAL = {
  materialCode: '',
  estimatedWeightKg: '',
  description: '',
  address: { line1: '', city: '', pincode: '' },
}

export default function ListingForm() {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState(INITIAL)
  const [photos, setPhotos] = useState([])
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }))
  }

  const setAddr = (k) => (e) => {
    setForm((f) => ({ ...f, address: { ...f.address, [k]: e.target.value } }))
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }))
  }

  function pickMaterial(code) {
    setForm((f) => ({ ...f, materialCode: code }))
    if (errors.materialCode) setErrors((p) => ({ ...p, materialCode: undefined }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    const { valid, errors: v } = validateListing(form)
    if (!valid) return setErrors(v)

    setBusy(true)
    try {
      const listing = await createListing({
        materialCode: form.materialCode,
        estimatedWeightKg: Number(form.estimatedWeightKg),
        description: form.description.trim(),
        photoUrls: photos,
        address: {
          line1: form.address.line1.trim(),
          city: form.address.city.trim(),
          pincode: form.address.pincode.trim(),
        },
      })
      toast.success('Listing created — find a recycler nearby!')
      navigate('/listings', { state: { created: listing.id } })
    } catch (err) {
      toast.error(err.message || 'Could not create listing')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {/* Material picker */}
      <div className="form-control w-full">
        <label className="label pb-1">
          <span className="label-text font-medium">What are you recycling?</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MATERIALS.map((m) => {
            const active = form.materialCode === m.code
            return (
              <button
                type="button"
                key={m.code}
                onClick={() => pickMaterial(m.code)}
                className={[
                  'btn h-auto py-3 flex-col items-center normal-case',
                  active
                    ? 'btn-primary'
                    : 'btn-outline border-base-300 text-base-content',
                ].join(' ')}
                aria-pressed={active}
              >
                <span className="text-2xl leading-none" aria-hidden="true">
                  {m.emoji}
                </span>
                <span className="text-xs font-medium mt-1">{m.label}</span>
              </button>
            )
          })}
        </div>
        {errors.materialCode && (
          <label className="label pt-1">
            <span className="label-text-alt text-error">{errors.materialCode}</span>
          </label>
        )}
      </div>

      {/* Weight + description */}
      <Input
        label="Approximate weight (kg)"
        type="number"
        inputMode="decimal"
        min="0.1"
        step="0.1"
        placeholder="e.g. 4.5"
        value={form.estimatedWeightKg}
        onChange={set('estimatedWeightKg')}
        error={errors.estimatedWeightKg}
        hint="Don't stress about precision — the recycler confirms the exact weight."
      />

      <div className="form-control w-full">
        <label className="label pb-1">
          <span className="label-text font-medium">
            Description{' '}
            <span className="opacity-60 font-normal">(optional)</span>
          </span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full"
          rows="3"
          maxLength={300}
          placeholder="e.g. Two big bags of newspapers, stored in the balcony."
          value={form.description}
          onChange={set('description')}
        />
        <label className="label pt-1">
          <span className="label-text-alt opacity-60">
            {form.description.length}/300
          </span>
        </label>
      </div>

      <PhotoUploader value={photos} onChange={setPhotos} />

      {/* Address */}
      <div>
        <h3 className="font-semibold mb-3">Pickup address</h3>
        <div className="space-y-3">
          <Input
            label="Street address"
            placeholder="Flat / House no., building, area"
            value={form.address.line1}
            onChange={setAddr('line1')}
            error={errors.line1}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              label="City"
              placeholder="e.g. Bengaluru"
              value={form.address.city}
              onChange={setAddr('city')}
              error={errors.city}
            />
            <Input
              label="Pincode"
              inputMode="numeric"
              maxLength={6}
              placeholder="560001"
              value={form.address.pincode}
              onChange={setAddr('pincode')}
              error={errors.pincode}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={busy}
          className="w-full sm:w-auto sm:flex-1"
        >
          Create listing
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => navigate(-1)}
          disabled={busy}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}