import type { PriceBucket } from '../types/flight'

export const buildPriceBuckets = (prices: number[], bucketCount = 6): PriceBucket[] => {
  const clean = prices.filter((price) => Number.isFinite(price)).sort((a, b) => a - b)
  if (!clean.length) return []

  const min = clean[0]
  const max = clean[clean.length - 1]
  if (min === max) {
    return [
      {
        range: `$${min.toFixed(0)}`,
        count: clean.length,
        min,
        max,
      },
    ]
  }

  const span = max - min
  const step = Math.max(1, Math.ceil(span / bucketCount))
  const buckets: PriceBucket[] = Array.from({ length: bucketCount }).map((_, index) => {
    const bucketMin = min + step * index
    const bucketMax = index === bucketCount - 1 ? max : bucketMin + step - 1
    return {
      range: `$${bucketMin.toFixed(0)}-$${bucketMax.toFixed(0)}`,
      count: 0,
      min: bucketMin,
      max: bucketMax,
    }
  })

  clean.forEach((price) => {
    const idx = Math.min(Math.floor((price - min) / step), bucketCount - 1)
    buckets[idx].count += 1
  })

  return buckets.filter((bucket) => bucket.count > 0)
}
