import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { FilterState, FlightOffer } from "../types/flight";
import { readFilters, writeFilters } from "../utils/urlParams";

const DEFAULT_FILTERS: FilterState = {
  stops: [],
  airlines: [],
  priceMin: null,
  priceMax: null,
  sortKey: "price",
};

const unique = (values: string[]) => Array.from(new Set(values)).sort();

export const useFilters = (offers: FlightOffer[]) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const availableAirlines = useMemo(
    () => unique(offers.flatMap((offer) => offer.carrierCodes)),
    [offers],
  );

  const priceBounds = useMemo(() => {
    if (!offers.length) return { min: 0, max: 0 };
    const amounts = offers.map((offer) => offer.price.amount);
    return {
      min: Math.min(...amounts),
      max: Math.max(...amounts),
    };
  }, [offers]);

  const filters = useMemo(() => {
    const base = { ...DEFAULT_FILTERS, ...readFilters(searchParams) };
    if (!offers.length) return base;
    return {
      ...base,
      priceMin: base.priceMin ?? Math.floor(priceBounds.min),
      priceMax: base.priceMax ?? Math.ceil(priceBounds.max),
    };
  }, [offers.length, priceBounds.max, priceBounds.min, searchParams]);

  const updateFilters = useCallback(
    (partial: Partial<FilterState>) => {
      const next = { ...filters, ...partial };
      const nextParams = writeFilters(searchParams, next);
      setSearchParams(nextParams, { replace: true });
    },
    [filters, searchParams, setSearchParams],
  );

  const resetFilters = useCallback(() => {
    const next = { ...DEFAULT_FILTERS, sortKey: filters.sortKey };
    const nextParams = writeFilters(searchParams, next);
    setSearchParams(nextParams, { replace: true });
  }, [filters.sortKey, searchParams, setSearchParams]);

  const prevOffers = useRef(offers);

  useEffect(() => {
    if (offers !== prevOffers.current) {
      prevOffers.current = offers;
      if (filters.priceMin !== null || filters.priceMax !== null) {
        updateFilters({ priceMin: null, priceMax: null });
      }
    }
  }, [offers, filters.priceMin, filters.priceMax, updateFilters]);

  return {
    filters,
    updateFilters,
    resetFilters,
    availableAirlines,
    priceBounds,
  };
};
