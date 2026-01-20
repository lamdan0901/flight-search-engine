import { format, isValid, parseISO } from "date-fns";
import { getCachedLocationName } from "../services/locations";

export const formatAirportCode = (code: string) => {
  const upper = code.trim().toUpperCase();
  if (!upper) return "";
  const cachedName = getCachedLocationName(upper);
  return cachedName ? `${upper} - ${cachedName}` : upper;
};

export const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} hr ${mins} min`;
};

export const formatTime = (dateString: string) => {
  if (!dateString) return "--:--";
  const date = parseISO(dateString);
  if (!isValid(date)) {
    return dateString.split(":").slice(0, 2).join(":");
  }
  return format(date, "HH:mm");
};

export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = parseISO(dateString);
  if (!isValid(date)) return "";
  return format(date, "MM/dd/yy");
};
