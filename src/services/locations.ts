import { getAccessToken, getApiBase } from "./amadeusClient";

type AmadeusLocation = {
  id: string;
  iataCode: string;
  name?: string;
  subType: "AIRPORT" | "CITY";
  address?: { cityName?: string; countryCode?: string; cityCode?: string };
  cityName?: string;
  countryCode?: string;
  cityCode?: string;
};

type AmadeusLocationMeta = {
  count?: number;
  links?: {
    self?: string;
    next?: string;
    last?: string;
  };
};

export type LocationOption = {
  iataCode: string;
  cityCode?: string;
  name: string;
  cityName?: string;
  countryCode?: string;
  subType: "AIRPORT" | "CITY";
  label: string;
};

const LOCATION_CACHE_TTL_MS = 5 * 60 * 1000;
const LOCATION_STORAGE_KEY = "flight-search.locations.v1";
const MAX_STORED_LOCATIONS = 100;
const locationCache = new Map<
  string,
  { expiresAt: number; results: LocationOption[]; nextOffset: number | null }
>();
const resolveCache = new Map<string, { expiresAt: number; code: string }>();
const locationByCode = new Map<string, LocationOption>();

const IATA_REGEX = /^[A-Z]{3}$/;

const normalizeKey = (value: string) => value.trim().toLowerCase();
const buildCacheKey = (value: string, offset: number) =>
  `${normalizeKey(value)}::${offset}`;

const parseNextOffset = (nextLink: string | undefined, base: string) => {
  if (!nextLink) return null;
  try {
    const url = new URL(nextLink, base);
    const offset = url.searchParams.get("page[offset]");
    if (!offset) return null;
    const parsed = Number(offset);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const buildLabel = (
  name: string,
  cityName: string | undefined,
  countryCode: string | undefined,
  iata: string,
) => {
  const parts: string[] = [];
  const lowerName = name.toLowerCase();
  parts.push(name);
  if (cityName && !lowerName.includes(cityName.toLowerCase())) {
    parts.push(cityName);
  }
  if (countryCode) {
    parts.push(countryCode);
  }
  return `${parts.join(", ")} (${iata})`;
};

type PersistedLocation = {
  iataCode: string;
  cityCode?: string;
  name: string;
  cityName?: string;
  countryCode?: string;
  subType: "AIRPORT" | "CITY";
};

const canUseStorage = () =>
  typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

const mapLocation = (location: AmadeusLocation): LocationOption => {
  const cityName = location.address?.cityName ?? location.cityName;
  const countryCode = location.address?.countryCode ?? location.countryCode;
  const cityCode =
    location.address?.cityCode ??
    location.cityCode ??
    (location.subType === "CITY" ? location.iataCode : undefined);
  const name = location.name ?? cityName ?? location.iataCode;
  return {
    iataCode: location.iataCode,
    cityCode,
    name,
    cityName,
    countryCode,
    subType: location.subType,
    label: buildLabel(name, cityName, countryCode, location.iataCode),
  };
};

const cacheLocationOption = (option: LocationOption) => {
  const iata = option.iataCode.trim().toUpperCase();
  if (iata) {
    const existing = locationByCode.get(iata);
    if (
      !existing ||
      (existing.subType === "CITY" && option.subType === "AIRPORT")
    ) {
      locationByCode.set(iata, option);
    }
  }
  if (option.subType === "CITY" && option.cityCode) {
    const cityCode = option.cityCode.trim().toUpperCase();
    if (cityCode) {
      locationByCode.set(cityCode, option);
    }
  }
};

const cacheLocationOptions = (options: LocationOption[]) => {
  options.forEach(cacheLocationOption);
};

const persistLocationCache = () => {
  if (!canUseStorage()) return;

  try {
    const unique = new Map<string, PersistedLocation>();
    locationByCode.forEach((option) => {
      const key = `${option.iataCode.toUpperCase()}-${option.subType}`;
      if (!unique.has(key)) {
        unique.set(key, {
          iataCode: option.iataCode,
          cityCode: option.cityCode,
          name: option.name,
          cityName: option.cityName,
          countryCode: option.countryCode,
          subType: option.subType,
        });
      }
    });

    const values = Array.from(unique.values()).slice(-MAX_STORED_LOCATIONS);
    window.sessionStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(values));
  } catch {
    // Ignore storage failures (private mode, quota issues) for now.
  }
};

const restoreLocationCache = () => {
  if (!canUseStorage()) return;
  try {
    const raw = window.sessionStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw) as PersistedLocation[];
    if (!Array.isArray(parsed)) return;

    parsed.forEach((entry) => {
      if (!entry?.iataCode || !entry.name) return;

      const option: LocationOption = {
        iataCode: entry.iataCode,
        cityCode: entry.cityCode,
        name: entry.name,
        cityName: entry.cityName,
        countryCode: entry.countryCode,
        subType: entry.subType,
        label: buildLabel(
          entry.name,
          entry.cityName,
          entry.countryCode,
          entry.iataCode,
        ),
      };

      cacheLocationOption(option);
    });
  } catch {
    // Ignore malformed storage for now.
  }
};

restoreLocationCache();

export const getCachedLocationName = (code: string): string | null => {
  const upper = code.trim().toUpperCase();
  if (!upper) return null;
  const option = locationByCode.get(upper);
  if (!option) return null;
  const name = option.name?.trim();
  if (!name) return null;
  return name.toUpperCase() === upper ? null : name;
};

const pickBestLocation = (input: string, options: LocationOption[]) => {
  const normalized = input.trim().toLowerCase();
  const exactCity = options.find(
    (option) =>
      option.subType === "CITY" &&
      (option.cityName ?? option.name).trim().toLowerCase() === normalized,
  );
  if (exactCity) return exactCity;
  return options.find((option) => option.subType === "CITY") ?? options[0];
};

export const searchLocationsPage = async (
  keyword: string,
  offset = 0,
): Promise<{ results: LocationOption[]; nextOffset: number | null }> => {
  const trimmed = keyword.trim();
  if (trimmed.length < 2) return { results: [], nextOffset: null };
  const key = buildCacheKey(trimmed, offset);
  const cached = locationCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return { results: cached.results, nextOffset: cached.nextOffset };
  }

  const base = getApiBase();
  if (!base.includes("api.amadeus.com")) {
    return { results: [], nextOffset: null };
  }

  const params = new URLSearchParams({
    keyword: trimmed,
    subType: "CITY,AIRPORT",
    "page[limit]": "8",
  });
  if (offset > 0) {
    params.set("page[offset]", String(offset));
  }

  const response = await fetch(
    `${base}/v1/reference-data/locations?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Unable to search locations");
  }

  const data = (await response.json()) as {
    data?: AmadeusLocation[];
    meta?: AmadeusLocationMeta;
  };
  const results = (data.data ?? []).map(mapLocation);
  cacheLocationOptions(results);
  persistLocationCache();
  const nextOffset = parseNextOffset(data.meta?.links?.next, base);
  locationCache.set(key, {
    expiresAt: Date.now() + LOCATION_CACHE_TTL_MS,
    results,
    nextOffset,
  });
  return { results, nextOffset };
};

export const searchLocations = async (
  keyword: string,
): Promise<LocationOption[]> => {
  const page = await searchLocationsPage(keyword, 0);
  return page.results;
};

const pickBestMatchByCode = (code: string, options: LocationOption[]) => {
  const upper = code.trim().toUpperCase();
  const matches = options.filter(
    (option) => option.iataCode.toUpperCase() === upper,
  );
  if (!matches.length) return null;
  return matches.find((option) => option.subType === "CITY") ?? matches[0];
};

export const resolveLocationOptionByCode = async (
  code: string,
): Promise<LocationOption | null> => {
  const trimmed = code.trim();
  if (!IATA_REGEX.test(trimmed.toUpperCase())) {
    return null;
  }
  try {
    const page = await searchLocationsPage(trimmed, 0);
    if (!page.results.length) return null;
    const match = pickBestMatchByCode(trimmed, page.results);
    if (match) {
      cacheLocationOption(match);
      persistLocationCache();
    }
    return match;
  } catch {
    return null;
  }
};

export const resolveLocationCode = async (
  input: string,
  fieldLabel = "location",
): Promise<string> => {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error(`Enter a ${fieldLabel} city or airport`);
  }

  const maybeIata = trimmed.toUpperCase();
  if (IATA_REGEX.test(maybeIata)) {
    return maybeIata;
  }

  const base = getApiBase();
  if (!base.includes("api.amadeus.com")) {
    return trimmed;
  }

  const key = normalizeKey(trimmed);
  const cached = resolveCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.code;
  }

  const results = await searchLocations(trimmed);
  if (!results.length) {
    throw new Error(`No matches found for ${fieldLabel}.`);
  }

  const best = pickBestLocation(trimmed, results);
  resolveCache.set(key, {
    expiresAt: Date.now() + LOCATION_CACHE_TTL_MS,
    code: best.iataCode,
  });
  return best.iataCode;
};
