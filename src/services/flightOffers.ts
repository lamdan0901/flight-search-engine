import type { FlightOffer, FlightSearchQuery } from '../types/flight'
import { getAccessToken, getApiBase } from './amadeusClient'
import { resolveLocationCode } from './locations'

type AmadeusSegment = {
  carrierCode: string
  number: string
  departure: { iataCode: string; at: string }
  arrival: { iataCode: string; at: string }
  duration: string
}

type AmadeusOffer = {
  id: string
  price: { total: string; currency: string }
  itineraries: Array<{ duration: string; segments: AmadeusSegment[] }>
}

type AmadeusResponse = {
  data: AmadeusOffer[]
}

type ContractResponse = {
  offers: FlightOffer[]
}

const cache = new Map<string, { expiresAt: number; offers: FlightOffer[] }>()
const CACHE_TTL_MS = 5 * 60 * 1000

const parseDurationMinutes = (duration: string) => {
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(duration)
  if (!match) return 0
  const hours = match[1] ? Number(match[1]) : 0
  const minutes = match[2] ? Number(match[2]) : 0
  return hours * 60 + minutes
}

const mapAmadeusOffer = (offer: AmadeusOffer): FlightOffer => {
  const segments = offer.itineraries.flatMap((itinerary) =>
    itinerary.segments.map((segment) => ({
      carrierCode: segment.carrierCode,
      flightNumber: segment.number,
      departure: { airport: segment.departure.iataCode, time: segment.departure.at },
      arrival: { airport: segment.arrival.iataCode, time: segment.arrival.at },
      durationMinutes: parseDurationMinutes(segment.duration),
    })),
  )

  const totalDurationMinutes = offer.itineraries.reduce(
    (acc, itinerary) => acc + parseDurationMinutes(itinerary.duration),
    0,
  )
  const stopsCount = Math.max(0, segments.length - offer.itineraries.length)
  const carrierCodes = Array.from(new Set(segments.map((segment) => segment.carrierCode)))

  return {
    id: offer.id,
    price: {
      amount: Number(offer.price.total),
      currency: offer.price.currency,
    },
    totalDurationMinutes,
    stopsCount,
    carrierCodes,
    segments,
  }
}

const buildCacheKey = (query: FlightSearchQuery) => JSON.stringify(query)

const resolveQuery = async (query: FlightSearchQuery): Promise<FlightSearchQuery> => {
  const [origin, destination] = await Promise.all([
    resolveLocationCode(query.origin, 'origin'),
    resolveLocationCode(query.destination, 'destination'),
  ])
  return {
    ...query,
    origin,
    destination,
  }
}

export const fetchFlightOffers = async (query: FlightSearchQuery): Promise<FlightOffer[]> => {
  const resolvedQuery = await resolveQuery(query)
  const key = buildCacheKey(resolvedQuery)
  const cached = cache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.offers
  }

  const base = getApiBase()
  const isAmadeus = base.includes('api.amadeus.com')
  const endpoint = isAmadeus ? '/v2/shopping/flight-offers' : '/api/flight-offers'

  const params = new URLSearchParams(
    isAmadeus
      ? {
          originLocationCode: resolvedQuery.origin,
          destinationLocationCode: resolvedQuery.destination,
          departureDate: resolvedQuery.departureDate,
          adults: String(resolvedQuery.adults),
          travelClass: resolvedQuery.cabinClass,
          nonStop: resolvedQuery.nonStopOnly ? 'true' : 'false',
        }
      : {
          origin: resolvedQuery.origin,
          destination: resolvedQuery.destination,
          departureDate: resolvedQuery.departureDate,
          adults: String(resolvedQuery.adults),
          cabinClass: resolvedQuery.cabinClass,
          nonStop: resolvedQuery.nonStopOnly ? 'true' : 'false',
        },
  )

  if (resolvedQuery.returnDate) {
    params.set('returnDate', resolvedQuery.returnDate)
  }
  if (isAmadeus && resolvedQuery.max !== null) {
    params.set('max', String(resolvedQuery.max))
  }

  const response = await fetch(`${base}${endpoint}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${await getAccessToken()}`,
    },
  })

  if (!response.ok) {
    throw new Error('Unable to fetch flight offers')
  }

  const data = (await response.json()) as AmadeusResponse | ContractResponse
  const offers = 'offers' in data ? data.offers : data.data.map(mapAmadeusOffer)

  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, offers })
  return offers
}
