import { compareAsc, parseISO } from 'date-fns'
import { useMemo } from 'react'
import type { FilterState, FlightOffer } from '../types/flight'

const matchesStops = (offer: FlightOffer, stops: number[]) => {
  if (!stops.length) return true
  if (stops.includes(2)) {
    return stops.includes(offer.stopsCount) || offer.stopsCount >= 2
  }
  return stops.includes(offer.stopsCount)
}

const matchesAirlines = (offer: FlightOffer, airlines: string[]) => {
  if (!airlines.length) return true
  return offer.carrierCodes.some((code) => airlines.includes(code))
}

const compareBySort = (a: FlightOffer, b: FlightOffer, sortKey: FilterState['sortKey']) => {
  if (sortKey === 'duration') {
    return a.totalDurationMinutes - b.totalDurationMinutes
  }
  if (sortKey === 'departureTime') {
    const aTime = parseISO(a.segments[0]?.departure.time ?? '')
    const bTime = parseISO(b.segments[0]?.departure.time ?? '')
    return compareAsc(aTime, bTime)
  }
  return a.price.amount - b.price.amount
}

export const filterAndSortOffers = (offers: FlightOffer[], filters: FilterState) => {
  const filtered = offers.filter((offer) => {
    if (!matchesStops(offer, filters.stops)) return false
    if (!matchesAirlines(offer, filters.airlines)) return false
    if (filters.priceMin !== null && offer.price.amount < filters.priceMin) return false
    if (filters.priceMax !== null && offer.price.amount > filters.priceMax) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => compareBySort(a, b, filters.sortKey))
  
  const stats = {
    minPrice: filtered.length > 0 ? Math.min(...filtered.map(o => o.price.amount)) : 0,
    maxPrice: filtered.length > 0 ? Math.max(...filtered.map(o => o.price.amount)) : 0,
    totalCount: filtered.length,
  }

  return { filtered, sorted, stats }
}

export const useFilteredOffers = (offers: FlightOffer[], filters: FilterState) =>
  useMemo(() => filterAndSortOffers(offers, filters), [filters, offers])
