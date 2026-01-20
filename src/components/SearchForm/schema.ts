import { z } from "zod";
import { parseISO, startOfDay, isAfter, isEqual, isValid } from "date-fns";

const dateSchema = z.string().refine((val) => {
  if (!val) return false;
  const parsed = parseISO(val);
  return isValid(parsed);
}, "Invalid date");

export const flightSearchSchema = z
  .object({
    origin: z.string().min(1, "Select an origin from the list"),
    destination: z.string().min(1, "Select a destination from the list"),
    departureDate: dateSchema.refine((val) => {
      const dep = startOfDay(parseISO(val));
      const today = startOfDay(new Date());
      return isAfter(dep, today) || isEqual(dep, today);
    }, "Departure must be today or later"),
    returnDate: dateSchema.optional().or(z.literal("")),
    adults: z.number().int().min(1, "Adults must be at least 1"),
    cabinClass: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]),
    nonStopOnly: z.boolean(),
    max: z.union([z.literal(20), z.literal(50), z.literal(100), z.null()]),
  })
  .refine(
    (data) => {
      if (!data.returnDate || !data.departureDate) return true;
      const dep = startOfDay(parseISO(data.departureDate));
      const ret = startOfDay(parseISO(data.returnDate));
      return isAfter(ret, dep);
    },
    {
      message: "Return must be after departure",
      path: ["returnDate"],
    },
  );

export type FlightSearchFormValues = z.infer<typeof flightSearchSchema>;
