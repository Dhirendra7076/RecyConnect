import { useCallback, useEffect, useState } from 'react'
import { getImpactSummary, getImpactBreakdown } from '../api/impact'
import { listTransactions } from '../api/transactions'

/**
 * Fetches summary + breakdown + recent transactions in parallel.
 * Returns { summary, breakdown, transactions, loading, error, refresh }.
 */
export function useImpact() {
  const [summary, setSummary] = useState(null)
  const [breakdown, setBreakdown] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [s, b, t] = await Promise.all([
        getImpactSummary(),
        getImpactBreakdown(),
        listTransactions(),
      ])
      setSummary(s)
      setBreakdown(Array.isArray(b) ? b : [])
      setTransactions(Array.isArray(t) ? t : [])
    } catch (err) {
      setError(err)
      setSummary(null)
      setBreakdown([])
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { summary, breakdown, transactions, loading, error, refresh }
}