import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Drawer,
  FormControlLabel,
  Checkbox,
  Paper,
  Slider,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import type { FilterState, OfferLimit } from "../types/flight";
import { SortBar } from "./SortBar";
import { theme } from "../theme";

const stopOptions = [
  { label: "Nonstop", value: 0 },
  { label: "1 stop", value: 1 },
  { label: "2+ stops", value: 2 },
];

export const FiltersPanel = ({
  filters,
  availableAirlines,
  priceBounds,
  onChange,
  onReset,
  sortKey,
  onSortChange,
  limit,
  onLimitChange,
}: {
  filters: FilterState;
  availableAirlines: string[];
  priceBounds: { min: number; max: number };
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  sortKey: FilterState["sortKey"];
  onSortChange: (value: FilterState["sortKey"]) => void;
  limit: OfferLimit;
  onLimitChange: (value: OfferLimit) => void;
}) => {
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [stopsExpanded, setStopsExpanded] = useState(() => {
    return searchParams.get("stopsOpen") === "1";
  });
  const [airlinesExpanded, setAirlinesExpanded] = useState(() => {
    return searchParams.get("airlinesOpen") === "1";
  });

  const updateExpandParams = useCallback(
    (stopsOpen: boolean, airlinesOpen: boolean) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);

          if (stopsOpen && filters.stops.length > 0) {
            next.set("stopsOpen", "1");
          } else {
            next.delete("stopsOpen");
          }

          if (airlinesOpen && filters.airlines.length > 0) {
            next.set("airlinesOpen", "1");
          } else {
            next.delete("airlinesOpen");
          }

          return next;
        },
        { replace: true },
      );
    },
    [filters.airlines.length, filters.stops.length, setSearchParams],
  );

  useEffect(() => {
    updateExpandParams(stopsExpanded, airlinesExpanded);
  }, [stopsExpanded, airlinesExpanded, updateExpandParams]);

  const handleStopsAccordion = (
    _: React.SyntheticEvent,
    isExpanded: boolean,
  ) => {
    setStopsExpanded(isExpanded);
  };

  const handleAirlinesAccordion = (
    _: React.SyntheticEvent,
    isExpanded: boolean,
  ) => {
    setAirlinesExpanded(isExpanded);
  };

  const sliderValue = useMemo(() => {
    if (filters.priceMin === null || filters.priceMax === null) {
      return [priceBounds.min, priceBounds.max];
    }
    return [filters.priceMin, filters.priceMax];
  }, [filters.priceMax, filters.priceMin, priceBounds.max, priceBounds.min]);

  const [sliderDraft, setSliderDraft] = useState<[number, number]>([
    sliderValue[0],
    sliderValue[1],
  ]);

  useEffect(() => {
    setSliderDraft([sliderValue[0], sliderValue[1]]);
  }, [sliderValue]);

  const toggleStop = (value: number) => {
    const nextStops = filters.stops.includes(value)
      ? filters.stops.filter((stop) => stop !== value)
      : [...filters.stops, value];
    onChange({ ...filters, stops: nextStops });
  };

  const toggleAirline = (code: string) => {
    const nextAirlines = filters.airlines.includes(code)
      ? filters.airlines.filter((airline) => airline !== code)
      : [...filters.airlines, code];
    onChange({ ...filters, airlines: nextAirlines });
  };

  const handleSlider = (_: Event, value: number | number[]) => {
    if (Array.isArray(value)) {
      setSliderDraft([value[0], value[1]]);
    }
  };

  const handleSliderCommit = (
    _: Event | React.SyntheticEvent,
    value: number | number[],
  ) => {
    if (Array.isArray(value)) {
      onChange({ ...filters, priceMin: value[0], priceMax: value[1] });
    }
  };

  const sortBar = (
    <SortBar
      sortKey={sortKey}
      onChange={onSortChange}
      limit={limit}
      onLimitChange={onLimitChange}
    />
  );

  const panel = (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Accordion
          expanded={stopsExpanded}
          onChange={handleStopsAccordion}
          disableGutters
          elevation={0}
          sx={{
            "&:before": { display: "none" },
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ px: 0, minHeight: "auto" }}
          >
            <Typography variant="subtitle1">
              Stops{filters.stops.length > 0 && ` (${filters.stops.length})`}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            <Stack spacing={0}>
              {stopOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={filters.stops.includes(option.value)}
                      onChange={() => toggleStop(option.value)}
                    />
                  }
                  label={option.label}
                />
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={airlinesExpanded}
          onChange={handleAirlinesAccordion}
          disableGutters
          elevation={0}
          sx={{
            "&:before": { display: "none" },
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ px: 0, minHeight: "auto" }}
          >
            <Typography variant="subtitle1">
              Airlines
              {filters.airlines.length > 0 && ` (${filters.airlines.length})`}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            {availableAirlines.length ? (
              <Stack spacing={0}>
                {availableAirlines.map((code) => (
                  <FormControlLabel
                    key={code}
                    control={
                      <Checkbox
                        checked={filters.airlines.includes(code)}
                        onChange={() => toggleAirline(code)}
                      />
                    }
                    label={code}
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Search to reveal airline filters.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        <Stack spacing={1}>
          <Typography variant="subtitle1">Price range</Typography>
          <Slider
            min={priceBounds.min}
            max={priceBounds.max}
            value={sliderDraft}
            onChange={handleSlider}
            onChangeCommitted={handleSliderCommit}
            valueLabelDisplay="auto"
            disableSwap
          />
          <Typography variant="caption" color="text.secondary">
            ${sliderDraft[0]} - ${sliderDraft[1]}
          </Typography>
        </Stack>

        {isMobile ? (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" fullWidth onClick={onReset}>
              Reset filters
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </Stack>
        ) : (
          <Button variant="outlined" onClick={onReset}>
            Reset filters
          </Button>
        )}
      </Stack>
    </Paper>
  );

  if (isMobile) {
    return (
      <>
        <Button
          variant="outlined"
          sx={{ bgcolor: "white", py: 1, mt: 2 }}
          fullWidth
          startIcon={<FilterAltIcon />}
          onClick={() => setOpen(true)}
        >
          Filters & Sort
        </Button>
        <Drawer anchor="bottom" open={open} onClose={() => setOpen(false)}>
          <Box p={2}>
            <Stack spacing={2}>
              {sortBar}
              {panel}
            </Stack>
          </Box>
        </Drawer>
      </>
    );
  }

  return (
    <Stack spacing={2}>
      {sortBar}
      {panel}
    </Stack>
  );
};
