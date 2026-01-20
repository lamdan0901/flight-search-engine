import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Flight, LocationCity } from "@mui/icons-material";
import type { FocusEvent, SyntheticEvent, UIEvent } from "react";
import type { LocationOption } from "../../services/locations";
import { getLocationGroupKey } from "./utils";
import {
  buildGroupedOptionName,
  buildLocationDisplayName,
} from "./utils";

type LocationDisplayProps = {
  option: LocationOption;
  sx?: Record<string, unknown>;
};

const LocationDisplay = ({ option, sx }: LocationDisplayProps) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={1}
    sx={{
      flex: 1,
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
      ...sx,
    }}
  >
    <Chip
      label={option.iataCode.toUpperCase()}
      size="small"
      variant="outlined"
      sx={{ height: 22, fontSize: "0.7rem" }}
    />
    <Typography variant="body1" noWrap sx={{ flex: 1, minWidth: 0 }}>
      {buildLocationDisplayName(option)}
    </Typography>
  </Stack>
);

type LocationAutocompleteProps = {
  label: string;
  placeholder: string;
  value: LocationOption | null;
  options: LocationOption[];
  inputValue: string;
  loading: boolean;
  noOptionsText: string;
  errorMessage?: string;
  groupLabels: Map<string, string>;
  showDisplay: boolean;
  displayOption: LocationOption | null;
  onInputChange: (
    event: SyntheticEvent,
    value: string,
    reason: string,
  ) => void;
  onChange: (event: SyntheticEvent, value: LocationOption | null) => void;
  onOpen: () => void;
  onScroll: (event: UIEvent<HTMLElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

export const LocationAutocomplete = ({
  label,
  placeholder,
  value,
  options,
  inputValue,
  loading,
  noOptionsText,
  errorMessage,
  groupLabels,
  showDisplay,
  displayOption,
  onInputChange,
  onChange,
  onOpen,
  onScroll,
  onFocus,
  onBlur,
}: LocationAutocompleteProps) => (
  <Autocomplete
    fullWidth
    sx={{ flex: 1, minWidth: 0 }}
    value={value}
    options={options}
    loading={loading}
    inputValue={inputValue}
    onInputChange={onInputChange}
    onChange={onChange}
    onOpen={onOpen}
    ListboxProps={{ onScroll }}
    filterOptions={(available) => available}
    getOptionLabel={(option) => option.label}
    isOptionEqualToValue={(option, selected) =>
      option.iataCode === selected.iataCode &&
      option.subType === selected.subType
    }
    groupBy={getLocationGroupKey}
    noOptionsText={noOptionsText}
    openOnFocus
    autoHighlight
    renderGroup={(params) => (
      <li key={params.key}>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            bgcolor: "grey.100",
            px: 2,
            py: 1,
            zIndex: 1,
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
            {groupLabels.get(params.group) ?? params.group}
          </Typography>
        </Box>
        <Divider />
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {params.children}
        </ul>
      </li>
    )}
    renderOption={(props, option) => (
      <li {...props} key={`${option.iataCode}-${option.subType}`}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: "100%", minHeight: 48, py: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {option.subType === "CITY" ? (
              <LocationCity fontSize="small" color="action" />
            ) : (
              <Flight fontSize="small" color="action" />
            )}
            <Typography variant="body2">
              {buildGroupedOptionName(option)}
            </Typography>
          </Stack>
          <Chip
            label={option.iataCode.toUpperCase()}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ height: 24, fontSize: "0.75rem", fontWeight: 500 }}
          />
        </Stack>
      </li>
    )}
    renderInput={(params) => (
      <TextField
        {...params}
        label={label}
        placeholder={placeholder}
        error={Boolean(errorMessage)}
        helperText={errorMessage || " "}
        required
        fullWidth
        sx={
          showDisplay
            ? { "& .MuiInputBase-root": { position: "relative" } }
            : undefined
        }
        InputProps={{
          ...params.InputProps,
          startAdornment:
            showDisplay && displayOption ? (
              <LocationDisplay
                option={displayOption}
                sx={{
                  position: "absolute",
                  left: 14,
                  right: 0,
                  pr: 6,
                  pointerEvents: "none",
                }}
              />
            ) : (
              params.InputProps.startAdornment
            ),
          endAdornment: (
            <>
              {loading ? <CircularProgress color="inherit" size={18} /> : null}
              {params.InputProps.endAdornment}
            </>
          ),
        }}
        inputProps={{
          ...params.inputProps,
          onFocus: (event) => {
            onFocus?.();
            params.inputProps.onFocus?.(event as FocusEvent<HTMLInputElement>);
          },
          onBlur: (event) => {
            onBlur?.();
            params.inputProps.onBlur?.(event as FocusEvent<HTMLInputElement>);
          },
          style: showDisplay
            ? { color: "transparent", caretColor: "transparent" }
            : undefined,
        }}
      />
    )}
  />
);
