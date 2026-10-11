import { useCallback, useEffect, useState } from 'react'
import * as listingsApi from '../api/listings'
import { getImpactSummary } from '../api/impact'

const ACTIVE_STATUSES = [
  'CREATED',
  'OPEN',
  'ACCEPTED',
  'PICKUP_SCHEDULED',
  'COLLECTED',
  'PRICE_CONFIRMED',
  'PAYMENT_PENDING',
]

function buildStats(listings, summary) {
  const active = listings.filter((l) => ACTIVE_STATUSES.includes(l.status))
  const open = listings.filter((l) => l.status === 'OPEN')

  return {
    activeListings: active.length,
    openRequests: open.length,
    completedCount: summary?.completedCount ?? 0,
    totalKg: summary?.totalKg ?? 0,
    totalValue: summary?.totalValue ?? 0,
    co2SavedKg: summary?.co2SavedKg ?? 0,
    listings,
  }
}

export function useDashboardStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [listings, summary] = await Promise.all([
        listingsApi.listOwnListings(),
        getImpactSummary(),
      ])
      setStats(buildStats(listings || [], summary))
    } catch (err) {
      setError(err)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { stats, loading, error, refresh }
}