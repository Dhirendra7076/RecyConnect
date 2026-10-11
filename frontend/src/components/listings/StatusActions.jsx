import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { updateListingStatus } from '../../api/listings'
import Button from '../ui/Button'

// Next action for the ASSIGNED RECYCLER.
const RECYCLER_NEXT = {
  ACCEPTED: { next: 'PICKUP_SCHEDULED', label: 'Mark pickup scheduled', emoji: '📅' },
  PICKUP_SCHEDULED: { next: 'COLLECTED', label: 'Mark collected', emoji: '📦' },
  COLLECTED: { special: 'go-to-transaction', label: 'Enter weight & price', emoji: '⚖️' },
  PAYMENT_PENDING: { next: 'COMPLETED', label: 'Payment received', emoji: '✅' },
}

// Next action for the OWNING HOUSEHOLD.
const HOUSEHOLD_NEXT = {
  PRICE_CONFIRMED: { next: 'PAYMENT_PENDING', label: 'Pay recycler', emoji: '💳' },
}

export default function StatusActions({ listing, onUpdated, size = 'sm' }) {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const isAssignedRecycler =
    user.role === 'recycler' && listing.recyclerId === user.id
  const isOwnerHousehold =
    user.role === 'household' && listing.householdId === user.id

  let action = null
  if (isAssignedRecycler) action = RECYCLER_NEXT[listing.status]
  else if (isOwnerHousehold) action = HOUSEHOLD_NEXT[listing.status]

  if (!action) return null

  async function handle() {
    if (action.special === 'go-to-transaction') {
      navigate(`/transaction/${listing.id}`)
      return
    }
    setBusy(true)
    try {
      const updated = await updateListingStatus(listing.id, action.next)
      toast.success('Status updated')
      onUpdated?.(updated)
    } catch (err) {
      toast.error(err.message || 'Could not update status')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      variant="primary"
      size={size}
      loading={busy}
      onClick={handle}
      className="w-full sm:w-auto"
    >
      {action.emoji} {action.label}
    </Button>
  )
}