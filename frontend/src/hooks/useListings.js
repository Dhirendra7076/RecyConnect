import { useCallback, useEffect, useState } from 'react'
import * as listingsApi from '../api/listings'

/**
 * Fetches the current user's listings.
 * Returns { listings, loading, error, refresh }.
 */
export function useMyListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listingsApi.listOwnListings()
      setListings(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err)
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { listings, loading, error, refresh }
}

/**
 * Fetches a single listing by id.
 */
export function useListing(id) {
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await listingsApi.getListing(id)
      setListing(data)
    } catch (err) {
      setError(err)
      setListing(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { listing, loading, error, refresh }
}