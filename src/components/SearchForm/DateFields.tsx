import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Clear } from "@mui/icons-material";
import {
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import type { Control, FieldErrors } from "react-hook-form";
import type { FlightSearchQuery } from "../../types/flight";
import { formatDateValue, parseDateValue } from "./utils";
import { Controller } from "react-hook-form";

type DateFieldsProps = {
  control: Control<FlightSearchQuery>;
  errors: FieldErrors<FlightSearchQuery>;
  query: FlightSearchQuery;
  onChange: (query: FlightSearchQuery) => void;
};

export const DateFields = ({
  control,
  errors,
  query,
  onChange,
}: DateFieldsProps) => (
  <Stack
    direction="row"
    spacing={1}
    sx={{ width: { xs: "100%", md: "auto" }, flex: { md: 1 } }}
  >
    <Controller
      name="departureDate"
      control={control}
      render={({ field }) => (
        <DatePicker
          label="Departure Date"
          value={parseDateValue(field.value)}
          onChange={(value) => {
            const formatted = formatDateValue(value);
            field.onChange(formatted);
            onChange({ ...query, departureDate: formatted });
          }}
          slotProps={{
            textField: {
              error: Boolean(errors.departureDate),
              helperText: errors.departureDate?.message || " ",
              fullWidth: true,
              required: true,
            },
          }}
        />
      )}
    />

    <Controller
      name="returnDate"
      control={control}
      render={({ field }) => (
        <DatePicker
          label="Return Date"
          enableAccessibleFieldDOMStructure={false}
          value={parseDateValue(field.value)}
          onChange={(value) => {
            const formatted = formatDateValue(value);
            field.onChange(formatted);
            onChange({
              ...query,
              returnDate: formatted ? formatted : undefined,
            });
          }}
          slots={{
            textField: (params) => (
              <TextField
                {...params}
                error={Boolean(errors.returnDate)}
                helperText={errors.returnDate?.message || " "}
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {field.value && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => {
                              field.onChange(undefined);
                              onChange({
                                ...query,
                                returnDate: undefined,
                              });
                            }}
                            aria-label="clear return date"
                            sx={{ mr: -1 }}
                          >
                            <Clear fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      )}
                      {params.InputProps?.endAdornment}
                    </>
                  ),
                }}
              />
            ),
          }}
        />
      )}
    />
  </Stack>
);
