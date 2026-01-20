export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'

export type SortKey = 'price' | 'duration' | 'departureTime'
export type OfferLimit = 20 | 50 | 100 | null

export interface FlightSearchQuery {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  adults: number
  cabinClass: CabinClass
  nonStopOnly: boolean
  max: OfferLimit
}

export interface Segment {
  carrierCode: string
  flightNumber: string
  departure: { airport: string; time: string }
  arrival: { airport: string; time: string }
  durationMinutes: number
}

export interface FlightOffer {
  id: string
  price: { amount: number; currency: string }
  totalDurationMinutes: number
  stopsCount: number
  carrierCodes: string[]
  segments: Segment[]
}

export interface FilterState {
  stops: number[]
  airlines: string[]
  priceMin: number | null
  priceMax: number | null
  sortKey: SortKey
}

export interface PriceBucket {
  range: string
  count: number
  min: number
  max: number
}
