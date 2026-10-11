import { useCallback, useEffect, useState } from 'react'
import { getMatch } from '../api/recyclers'

export function useMatches(listingId) {
  const [data, setData] = useState(null) // { listing, matches }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!listingId) return
    setLoading(true)
    setError(null)
    try {
      const res = await getMatch(listingId)
      setData(res)
    } catch (err) {
      setError(err)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [listingId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { data, loading, error, refresh }
}