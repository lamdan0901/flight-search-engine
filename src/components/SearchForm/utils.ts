import { format, isValid, parseISO } from "date-fns";
import type { LocationOption } from "../../services/locations";
import { formatAirportCode } from "../../utils/formatters";
import { IATA_REGEX, MIN_LOCATION_QUERY } from "./const";


export const getLocationGroupKey = (option: LocationOption) =>
  (option.cityCode ?? option.iataCode).toUpperCase();

export const getLocationGroupLabel = (option: LocationOption) => {
  const code = getLocationGroupKey(option);
  const cityName =
    option.cityName ??
    (option.subType === "CITY" ? option.name : undefined) ??
    option.name;

  const parts: string[] = [];

  if (cityName && cityName.trim().toUpperCase() !== code) {
    parts.push(cityName.trim());
  }

  if (option.countryCode) {
    parts.push(option.countryCode);
  }

  return parts.join(", ") || code;
};
export const DATE_FORMAT = "yyyy-MM-dd";

export const buildFallbackOption = (value: string): LocationOption => {
  const upper = value.trim().toUpperCase();
  return {
    iataCode: upper,
    cityCode: upper,
    name: upper,
    subType: "AIRPORT",
    label: formatAirportCode(upper),
  };
};

export const buildLocationDisplayName = (option: LocationOption) => {
  const baseName = option.name?.trim() || option.iataCode;
  const lowerName = baseName.toLowerCase();
  const parts: string[] = [baseName];
  if (option.cityName && !lowerName.includes(option.cityName.toLowerCase())) {
    parts.push(option.cityName);
  }
  if (option.countryCode) {
    parts.push(option.countryCode);
  }
  const joined = parts.join(", ");
  if (joined.toUpperCase() !== option.iataCode.toUpperCase()) {
    return joined;
  }
  const formatted = formatAirportCode(option.iataCode);
  const split = formatted.split(" - ");
  return split.length > 1 ? split[1] : formatted;
};

// Simplified display name for grouped dropdown (no city/country - already in header)
export const buildGroupedOptionName = (option: LocationOption) => {
  const baseName = option.name?.trim() || option.iataCode;

  if (option.subType === "CITY") {
    return `All ${baseName} Airports`;
  }

  return baseName;
};

export const isFallbackLocation = (
  option: LocationOption | null,
  code: string,
) => {
  if (!option) return true;
  if (option.iataCode.toUpperCase() !== code) return true;
  if (option.cityName || option.countryCode) return false;

  const normalizedName = option.name?.trim().toUpperCase();
  if (normalizedName && normalizedName !== code) return false;

  return option.label === formatAirportCode(code) || normalizedName === code;
};

export const buildGroupLabelMap = (options: LocationOption[]) => {
  const map = new Map<string, LocationOption>();
  options.forEach((option) => {
    const key = getLocationGroupKey(option);
    const existing = map.get(key);
    if (
      !existing ||
      (existing.subType !== "CITY" && option.subType === "CITY")
    ) {
      map.set(key, option);
    }
  });
  const labels = new Map<string, string>();
  map.forEach((option, key) => {
    labels.set(key, getLocationGroupLabel(option));
  });
  return labels;
};

export const parseDateValue = (value?: string) => {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
};

export const formatDateValue = (value: Date | null) =>
  value && isValid(value) ? format(value, DATE_FORMAT) : "";

export const getInitialLocationState = (
  value: string,
): { input: string; selected: LocationOption | null } => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { input: "", selected: null };
  }
  const upper = trimmed.toUpperCase();
  if (IATA_REGEX.test(upper)) {
    const option = buildFallbackOption(upper);
    return { input: option.label, selected: option };
  }
  return { input: value, selected: null };
};

export const getNoOptionsText = (inputValue: string, error: string | null) => {
  if (error) return error;
  if (inputValue.trim().length < MIN_LOCATION_QUERY) {
    return `Type at least ${MIN_LOCATION_QUERY} characters`;
  }
  return "No matches found";
};

export const getVisibleOptions = (
  inputValue: string,
  options: LocationOption[],
  lastOptions: LocationOption[],
) => {
  if (options.length) return options;
  if (inputValue.trim() && lastOptions.length) return lastOptions;
  return options;
};

export const getSearchSeed = (
  selected: LocationOption | null,
  inputValue: string,
) => {
  const trimmed = inputValue.trim();
  if (!selected || trimmed !== selected.label) {
    return trimmed;
  }
  const iata = selected.iataCode.trim().toUpperCase();
  const candidates = [selected.cityName, selected.name]
    .map((value) => value?.trim())
    .filter(Boolean) as string[];
  const match = candidates.find(
    (value) =>
      value.length >= MIN_LOCATION_QUERY && value.toUpperCase() !== iata,
  );
  return match ?? iata;
};
