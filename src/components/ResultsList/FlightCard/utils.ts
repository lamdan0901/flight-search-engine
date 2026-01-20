import { differenceInCalendarDays, parseISO } from "date-fns";

export const getDayOffset = (departureTime?: string, arrivalTime?: string) => {
  if (!departureTime || !arrivalTime) return 0;
  return differenceInCalendarDays(parseISO(arrivalTime), parseISO(departureTime));
};

export const formatDayOffsetLabel = (offset: number) => {
  if (offset === 0) return "";
  return offset > 0 ? `+${offset}` : offset;
};
