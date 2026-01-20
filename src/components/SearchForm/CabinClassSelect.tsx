import { MenuItem, TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";
import type { FlightSearchQuery } from "../../types/flight";
import { cabinOptions } from "./const";

type CabinClassSelectProps = {
  control: Control<FlightSearchQuery>;
  query: FlightSearchQuery;
  onChange: (query: FlightSearchQuery) => void;
};

export const CabinClassSelect = ({
  control,
  query,
  onChange,
}: CabinClassSelectProps) => (
  <Controller
    name="cabinClass"
    control={control}
    render={({ field }) => (
      <TextField
        select
        label="Cabin Class"
        {...field}
        onChange={(event) => {
          const val = event.target
            .value as FlightSearchQuery["cabinClass"];
          field.onChange(val);
          onChange({ ...query, cabinClass: val });
        }}
        sx={{ flex: 1, minWidth: { xs: 0, md: 190 } }}
      >
        {cabinOptions.map(({ value, label }) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>
    )}
  />
);
