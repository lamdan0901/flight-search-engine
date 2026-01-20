import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { FlightOffer, FlightSearchQuery } from '../types/flight'
import { fetchFlightOffers } from '../services/flightOffers'
import { readSearchQuery, writeSearchQuery } from '../utils/urlParams'
import { useDebouncedSearch } from './useDebouncedSearch'

const isCompleteQuery = (query: FlightSearchQuery) =>
  Boolean(query.origin && query.destination && query.departureDate)

export const useSearchState = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQuery = useMemo(() => readSearchQuery(searchParams), [searchParams])
  const [draftQuery, setDraftQuery] = useState<FlightSearchQuery>(urlQuery)
  const [offers, setOffers] = useState<FlightOffer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastSubmittedKey = useRef<string | null>(null)
  const lastQuery = useRef<FlightSearchQuery | null>(null)

  useEffect(() => {
    setDraftQuery(urlQuery)
  }, [urlQuery])

  const performSearch = useCallback(async (query: FlightSearchQuery) => {
    if (!isCompleteQuery(query)) return
    setLoading(true)
    setError(null)
    try {
      const results = await fetchFlightOffers(query)
      setOffers(results)
      lastQuery.current = query
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setOffers([])
    } finally {
      setLoading(false)
    }
  }, [])

  const { run: debouncedSearch } = useDebouncedSearch(performSearch, 300)

  const submitSearch = useCallback(
    async (query: FlightSearchQuery, options?: { replace?: boolean; debounce?: boolean }) => {
      if (!isCompleteQuery(query)) {
        setError('Please fill in required fields.')
        return
      }
      const key = JSON.stringify(query)
      lastSubmittedKey.current = key
      const nextParams = writeSearchQuery(searchParams, query)
      setSearchParams(nextParams, { replace: options?.replace ?? false })
      if (options?.debounce) {
        debouncedSearch(query)
      } else {
        await performSearch(query)
      }
    },
    [debouncedSearch, performSearch, searchParams, setSearchParams],
  )

  useEffect(() => {
    if (!isCompleteQuery(urlQuery)) return
    const key = JSON.stringify(urlQuery)
    if (key === lastSubmittedKey.current) return
    debouncedSearch(urlQuery)
  }, [debouncedSearch, urlQuery])

  const retry = useCallback(() => {
    if (lastQuery.current) {
      return performSearch(lastQuery.current)
    }
    if (isCompleteQuery(urlQuery)) {
      return performSearch(urlQuery)
    }
    return Promise.resolve()
  }, [performSearch, urlQuery])

  return {
    query: draftQuery,
    setQuery: setDraftQuery,
    offers,
    loading,
    error,
    submitSearch,
    retry,
  }
}
