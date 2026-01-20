import { useCallback, useRef, useState } from "react";
import { useDebouncedSearch } from "../../hooks/useDebouncedSearch";
import {
  searchLocationsPage,
  type LocationOption,
} from "../../services/locations";
import { getLocationGroupLabel } from "./utils";
import { MIN_LOCATION_QUERY } from "./const";

const sortLocations = (options: LocationOption[]) =>
  [...options].sort((a, b) => {
    const groupA = getLocationGroupLabel(a);
    const groupB = getLocationGroupLabel(b);
    if (groupA !== groupB) {
      return groupA.localeCompare(groupB);
    }
    if (a.subType !== b.subType) {
      return a.subType === "CITY" ? -1 : 1;
    }
    return a.label.localeCompare(b.label);
  });

const mergeLocations = (
  current: LocationOption[],
  incoming: LocationOption[],
) => {
  if (!incoming.length) return current;
  const map = new Map<string, LocationOption>();
  current.forEach((option) => {
    map.set(`${option.iataCode}-${option.subType}`, option);
  });
  incoming.forEach((option) => {
    map.set(`${option.iataCode}-${option.subType}`, option);
  });
  return Array.from(map.values());
};

export const useLocationSearch = () => {
  const [options, setOptions] = useState<LocationOption[]>([]);
  const [lastOptions, setLastOptions] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [activeQuery, setActiveQuery] = useState("");
  const requestIdRef = useRef(0);
  const loadMoreTokenRef = useRef(0);
  const activeLoadMoreRef = useRef<number | null>(null);

  const runSearch = useCallback(async (value: string) => {
    const requestId = ++requestIdRef.current;

    try {
      const { results, nextOffset: next } = await searchLocationsPage(value, 0);
      if (requestIdRef.current !== requestId) return;

      const sorted = sortLocations(results);
      setOptions(sorted);
      setLastOptions(sorted);
      setNextOffset(next);
      setActiveQuery(value);
      setError(null);
    } catch (err) {
      if (requestIdRef.current !== requestId) return;

      setOptions([]);
      setNextOffset(null);
      setError(err instanceof Error ? err.message : "Unable to load locations");
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, []);

  const { run: debouncedSearch, cancel } = useDebouncedSearch(runSearch, 300);

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    cancel();
    setOptions([]);
    setError(null);
    setLoading(false);
    setLoadingMore(false);
    setNextOffset(null);
    setActiveQuery("");
    activeLoadMoreRef.current = null;
  }, [cancel]);

  const search = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length < MIN_LOCATION_QUERY) {
        reset();
        return;
      }
      setLoading(true);
      setError(null);
      setNextOffset(null);
      setActiveQuery("");
      debouncedSearch(trimmed);
    },
    [debouncedSearch, reset],
  );

  const loadMore = useCallback(async () => {
    if (!activeQuery || nextOffset === null || loading || loadingMore) {
      return;
    }

    if (activeLoadMoreRef.current !== null) {
      return;
    }

    const requestId = requestIdRef.current;
    const loadMoreToken = ++loadMoreTokenRef.current;
    activeLoadMoreRef.current = loadMoreToken;

    setLoadingMore(true);

    try {
      const { results, nextOffset: next } = await searchLocationsPage(
        activeQuery,
        nextOffset,
      );
      if (requestIdRef.current !== requestId) return;

      // Preserve existing order and append new unique results at the end.
      setOptions((prev) => mergeLocations(prev, results));
      setLastOptions((prev) => mergeLocations(prev, results));
      setNextOffset(next);
      setError(null);
    } catch (err) {
      if (requestIdRef.current !== requestId) return;
      setError(err instanceof Error ? err.message : "Unable to load locations");
    } finally {
      if (activeLoadMoreRef.current === loadMoreToken) {
        activeLoadMoreRef.current = null;
        if (requestIdRef.current === requestId) {
          setLoadingMore(false);
        }
      }
    }
  }, [activeQuery, loading, loadingMore, nextOffset]);

  return {
    options,
    lastOptions,
    loading,
    loadingMore,
    error,
    nextOffset,
    search,
    reset,
    loadMore,
  };
};
