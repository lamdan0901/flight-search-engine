import { Add, Remove } from "@mui/icons-material";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import type { FlightSearchQuery } from "../../types/flight";

type AdultsCounterProps = {
  control: Control<FlightSearchQuery>;
  errors: FieldErrors<FlightSearchQuery>;
  query: FlightSearchQuery;
  onChange: (query: FlightSearchQuery) => void;
};

export const AdultsCounter = ({
  control,
  errors,
  query,
  onChange,
}: AdultsCounterProps) => (
  <Box
    sx={{
      mb: { xs: 0, md: "23px" },
      border: 1,
      borderColor: "rgba(0, 0, 0, 0.23)",
      borderRadius: 1,
      py: 1.4,
      px: 1.5,
      position: "relative",
      "&:hover": {
        borderColor: "text.primary",
      },
    }}
  >
    <Controller
      name="adults"
      control={control}
      render={({ field }) => (
        <Stack>
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              top: -10,
              left: 10,
              bgcolor: "background.paper",
              px: 0.5,
              color: "text.secondary",
            }}
          >
            Adults
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              size="small"
              onClick={() => {
                const newVal = Math.max(1, field.value - 1);
                field.onChange(newVal);
                onChange({ ...query, adults: newVal });
              }}
              disabled={field.value <= 1}
              sx={{
                bgcolor: "grey.200",
                borderRadius: 1,
                width: 32,
                height: 32,
                "&:hover": { bgcolor: "grey.300" },
                "&.Mui-disabled": { bgcolor: "grey.100" },
              }}
            >
              <Remove fontSize="small" />
            </IconButton>
            <Typography
              variant="body1"
              sx={{
                minWidth: 32,
                textAlign: "center",
                fontWeight: 500,
              }}
            >
              {field.value}
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                const newVal = field.value + 1;
                field.onChange(newVal);
                onChange({ ...query, adults: newVal });
              }}
              sx={{
                bgcolor: "grey.800",
                color: "white",
                borderRadius: 1,
                width: 32,
                height: 32,
                "&:hover": { bgcolor: "grey.900" },
              }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Stack>
          {errors.adults && (
            <Typography variant="caption" color="error">
              {errors.adults.message}
            </Typography>
          )}
        </Stack>
      )}
    />
  </Box>
);
