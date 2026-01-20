import { useState } from "react";
import { Box, Button, Paper, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FlightSearchQuery } from "../../types/flight";
import { flightSearchSchema } from "./schema";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { LocationSwapButton } from "./LocationSwapButton";
import { DateFields } from "./DateFields";
import { CabinClassSelect } from "./CabinClassSelect";
import { AdultsCounter } from "./AdultsCounter";
import { getNoOptionsText } from "./utils";
import { useLocationField } from "./useLocationField";
import { Flight } from "@mui/icons-material";

export const SearchForm = ({
  query,
  onChange,
  onSubmit,
  disabled,
}: {
  query: FlightSearchQuery;
  onChange: (query: FlightSearchQuery) => void;
  onSubmit: (query: FlightSearchQuery) => void;
  disabled?: boolean;
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FlightSearchQuery>({
    resolver: zodResolver(flightSearchSchema),
    values: query,
  });

  const originField = useLocationField({
    field: "origin",
    query,
    setValue,
    onChange,
  });
  const destinationField = useLocationField({
    field: "destination",
    query,
    setValue,
    onChange,
  });
  const [isLocationRotated, setLocationRotated] = useState(false);

  const onFormSubmit = (data: FlightSearchQuery) => {
    onSubmit(data);
  };

  const handleSwap = () => {
    setLocationRotated((prev) => !prev);
    const oldOriginInput = originField.input;
    const oldDestinationInput = destinationField.input;
    const oldOriginSelected = originField.selected;
    const oldDestinationSelected = destinationField.selected;

    originField.setInput(oldDestinationInput);
    destinationField.setInput(oldOriginInput);
    originField.setSelected(oldDestinationSelected);
    destinationField.setSelected(oldOriginSelected);

    const newOrigin = query.destination;
    const newDestination = query.origin;

    // We need to bypass the sync effects temporarily to prevent them from reverting/interfering
    originField.suspendSyncOnce();
    destinationField.suspendSyncOnce();

    const newQuery = {
      ...query,
      origin: newOrigin,
      destination: newDestination,
    };

    setValue("origin", newOrigin);
    setValue("destination", newDestination);
    onChange(newQuery);

    // If both are valid, trigger a search
    if (newOrigin && newDestination) {
      onSubmit(newQuery);
    }
  };

  return (
    <Paper elevation={0} sx={{ px: 2, pt: 2.5, pb: 0 }}>
      <Stack
        spacing={1}
        component="form"
        onSubmit={handleSubmit(onFormSubmit)}
        noValidate
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={0.5}
          sx={{ width: "100%" }}
          position="relative"
        >
          <LocationAutocomplete
            label="Origin (City or Airport)"
            placeholder="San Francisco or SFO"
            value={originField.selected}
            options={originField.visibleOptions}
            loading={originField.loading || originField.loadingMore}
            inputValue={originField.input}
            onInputChange={originField.handleInputChange}
            onChange={originField.handleChange}
            onOpen={originField.handleOpen}
            onScroll={originField.handleListboxScroll}
            noOptionsText={getNoOptionsText(
              originField.input,
              originField.error,
            )}
            errorMessage={errors.origin?.message}
            groupLabels={originField.groupLabels}
            showDisplay={originField.showDisplay}
            displayOption={originField.selected}
            onFocus={() => originField.setFocused(true)}
            onBlur={() => originField.setFocused(false)}
          />
          <LocationSwapButton
            isRotated={isLocationRotated}
            onSwap={handleSwap}
          />
          <LocationAutocomplete
            label="Destination (City or Airport)"
            placeholder="London or LHR"
            value={destinationField.selected}
            options={destinationField.visibleOptions}
            loading={destinationField.loading || destinationField.loadingMore}
            inputValue={destinationField.input}
            onInputChange={destinationField.handleInputChange}
            onChange={destinationField.handleChange}
            onOpen={destinationField.handleOpen}
            onScroll={destinationField.handleListboxScroll}
            noOptionsText={getNoOptionsText(
              destinationField.input,
              destinationField.error,
            )}
            errorMessage={errors.destination?.message}
            groupLabels={destinationField.groupLabels}
            showDisplay={destinationField.showDisplay}
            displayOption={destinationField.selected}
            onFocus={() => destinationField.setFocused(true)}
            onBlur={() => destinationField.setFocused(false)}
          />
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems="flex-start"
        >
          <DateFields
            control={control}
            errors={errors}
            query={query}
            onChange={onChange}
          />

          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start"
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            <CabinClassSelect
              control={control}
              query={query}
              onChange={onChange}
            />
            <AdultsCounter
              control={control}
              errors={errors}
              query={query}
              onChange={onChange}
            />
          </Stack>

          <Box
            sx={{
              flexShrink: 0,
              alignSelf: { xs: "stretch", md: "center" },
              pt: { xs: 2, md: 0 },
              pb: { xs: 1, md: 3.25 },
            }}
          >
            <Button
              type="submit"
              variant="contained"
              startIcon={<Flight />}
              color="primary"
              size="large"
              sx={{
                width: { xs: "100%", md: "auto" },
              }}
              disabled={disabled}
            >
              Search flights
            </Button>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
};
