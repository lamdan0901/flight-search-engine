import { MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import type { FilterState, OfferLimit } from "../types/flight";

const sortLabels: Record<FilterState["sortKey"], string> = {
  price: "Lowest price",
  duration: "Shortest duration",
  departureTime: "Earliest departure",
};

const limitOptions: Array<{ label: string; value: OfferLimit }> = [
  { label: "20", value: 20 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
  { label: "No limits", value: null },
];

export const SortBar = ({
  sortKey,
  onChange,
  limit,
  onLimitChange,
}: {
  sortKey: FilterState["sortKey"];
  onChange: (value: FilterState["sortKey"]) => void;
  limit: OfferLimit;
  onLimitChange: (value: OfferLimit) => void;
}) => (
  <Paper elevation={0} sx={{ p: 2 }}>
    <Stack justifyContent="space-between" spacing={2}>
      <Stack spacing={1}>
        <Typography variant="subtitle1">Sort by</Typography>
        <TextField
          select
          fullWidth
          value={sortKey}
          onChange={(event) =>
            onChange(event.target.value as FilterState["sortKey"])
          }
        >
          {Object.entries(sortLabels).map(([key, label]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle1">Max results</Typography>
        <TextField
          select
          fullWidth
          value={limit ?? "none"}
          onChange={(event) => {
            const value = event.target.value;
            onLimitChange(
              value === "none" ? null : (Number(value) as OfferLimit),
            );
          }}
        >
          {limitOptions.map((option) => (
            <MenuItem key={option.label} value={option.value ?? "none"}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Stack>
  </Paper>
);
