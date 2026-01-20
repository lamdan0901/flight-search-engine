import type {
  CabinClass,
  FilterState,
  FlightSearchQuery,
  OfferLimit,
  SortKey,
} from "../types/flight";

const CABIN_CLASSES: CabinClass[] = [
  "ECONOMY",
  "PREMIUM_ECONOMY",
  "BUSINESS",
  "FIRST",
];
const SORT_KEYS: SortKey[] = ["price", "duration", "departureTime"];
const OFFER_LIMITS: OfferLimit[] = [20, 50, 100];

const toUpperTrim = (value: string) => value.trim().toUpperCase();
const normalizeLocationParam = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^[A-Za-z]{3}$/.test(trimmed) ? trimmed.toUpperCase() : trimmed;
};

export const parseArrayParam = (
  params: URLSearchParams,
  key: string,
): string[] => {
  const raw = params.get(key);
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const parseNumberParam = (
  params: URLSearchParams,
  key: string,
): number | null => {
  const raw = params.get(key);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

const parseOfferLimit = (params: URLSearchParams): OfferLimit => {
  const raw = params.get("max");
  if (!raw) return 20;
  if (raw === "none") return null;

  const value = Number(raw) as OfferLimit;
  if (!Number.isFinite(value)) return 20;

  return OFFER_LIMITS.includes(value) ? value : 20;
};

export const parseBooleanParam = (
  params: URLSearchParams,
  key: string,
): boolean => {
  const raw = params.get(key);
  return raw === "true" || raw === "1";
};

export const setParam = (
  params: URLSearchParams,
  key: string,
  value: string | number | boolean | null | undefined,
) => {
  if (value === null || value === undefined || value === "") {
    params.delete(key);
    return;
  }
  params.set(key, String(value));
};

export const setArrayParam = (
  params: URLSearchParams,
  key: string,
  values: string[],
) => {
  if (!values.length) {
    params.delete(key);
    return;
  }
  params.set(key, values.join(","));
};

export const readSearchQuery = (params: URLSearchParams): FlightSearchQuery => {
  const origin = params.get("origin")
    ? normalizeLocationParam(params.get("origin") ?? "")
    : "";
  const destination = params.get("destination")
    ? normalizeLocationParam(params.get("destination") ?? "")
    : "";
  const departureDate = params.get("departureDate") ?? "";
  const returnDate = params.get("returnDate") ?? undefined;
  const adultsRaw = parseNumberParam(params, "adults");
  const adults = adultsRaw && adultsRaw >= 1 ? Math.floor(adultsRaw) : 1;
  const cabinRaw = params.get("cabinClass");
  const cabinClass = CABIN_CLASSES.includes(cabinRaw as CabinClass)
    ? (cabinRaw as CabinClass)
    : "ECONOMY";
  const nonStopOnly = parseBooleanParam(params, "nonStop");
  const max = parseOfferLimit(params);

  return {
    origin,
    destination,
    departureDate,
    returnDate,
    adults,
    cabinClass,
    nonStopOnly,
    max,
  };
};

export const writeSearchQuery = (
  params: URLSearchParams,
  query: FlightSearchQuery,
): URLSearchParams => {
  const next = new URLSearchParams(params);
  setParam(
    next,
    "origin",
    query.origin ? normalizeLocationParam(query.origin) : "",
  );
  setParam(
    next,
    "destination",
    query.destination ? normalizeLocationParam(query.destination) : "",
  );
  setParam(next, "departureDate", query.departureDate);
  setParam(next, "returnDate", query.returnDate ?? null);
  setParam(next, "adults", query.adults);
  setParam(next, "cabinClass", query.cabinClass);
  setParam(next, "nonStop", query.nonStopOnly ? "true" : null);
  if (query.max === null) {
    next.set("max", "none");
  } else {
    setParam(next, "max", query.max);
  }
  return next;
};

export const readFilters = (params: URLSearchParams): FilterState => {
  const stops = parseArrayParam(params, "stops")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
  const airlines = parseArrayParam(params, "airlines").map(toUpperTrim);
  const priceMin = parseNumberParam(params, "priceMin");
  const priceMax = parseNumberParam(params, "priceMax");
  const sortRaw = params.get("sort");
  const sortKey = SORT_KEYS.includes(sortRaw as SortKey)
    ? (sortRaw as SortKey)
    : "price";

  return {
    stops,
    airlines,
    priceMin,
    priceMax,
    sortKey,
  };
};

export const writeFilters = (
  params: URLSearchParams,
  filters: FilterState,
): URLSearchParams => {
  const next = new URLSearchParams(params);
  setArrayParam(next, "stops", filters.stops.map(String));
  setArrayParam(next, "airlines", filters.airlines);
  setParam(next, "priceMin", filters.priceMin);
  setParam(next, "priceMax", filters.priceMax);
  setParam(next, "sort", filters.sortKey);
  return next;
};
