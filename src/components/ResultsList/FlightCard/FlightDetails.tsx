import { Box, Stack, Typography } from "@mui/material";
import type { Segment } from "../../../types/flight";
import { FlightSegment } from "./FlightSegment";

interface FlightDetailsProps {
  segments: Segment[];
  offerId: string;
}

export const FlightDetails = ({ segments, offerId }: FlightDetailsProps) => (
  <Box
    sx={{
      mt: 2,
      pt: 2,
      borderTop: "1px dashed",
      borderColor: "divider",
    }}
  >
    <Typography
      variant="caption"
      sx={{
        color: "text.secondary",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        mb: 1.5,
        display: "block",
      }}
    >
      Flight Details
    </Typography>
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      divider={
        <Box
          sx={{
            borderLeft: { md: "1px solid" },
            borderTop: { xs: "1px solid", md: "none" },
            borderColor: "divider",
          }}
        />
      }
    >
      {segments.map((segment, index) => (
        <FlightSegment
          key={`${offerId}-${segment.flightNumber}-${index}`}
          segment={segment}
          index={index}
        />
      ))}
    </Stack>
  </Box>
);
