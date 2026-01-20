import { Box, Chip, Stack, Typography } from "@mui/material";
import type { Segment } from "../../../types/flight";
import { formatDate, formatDuration, formatTime } from "../../../utils/formatters";
import { formatDayOffsetLabel, getDayOffset } from "./utils";

interface FlightSegmentProps {
  segment: Segment;
  index: number;
}

export const FlightSegment = ({ segment, index }: FlightSegmentProps) => {
  const segmentDayOffset = getDayOffset(
    segment.departure.time,
    segment.arrival.time,
  );

  return (
    <Box
      sx={{
        flex: 1,
        pl: { md: index > 0 ? 2 : 0 },
        pt: { xs: index > 0 ? 1 : 0, md: 0 },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          label={`${segment.carrierCode} ${segment.flightNumber}`}
          size="small"
          variant="outlined"
          sx={{
            fontSize: "0.7rem",
            fontWeight: 600,
            borderColor: "primary.main",
            color: "primary.main",
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {formatDuration(segment.durationMinutes)}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        <Box>
          <Stack
            direction="row"
            alignItems="baseline"
            flexWrap="wrap"
            columnGap={0.8}
          >
            <Typography variant="h6" fontWeight={700} lineHeight={1}>
              {formatTime(segment.departure.time)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(segment.departure.time)}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {segment.departure.airport}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ alignSelf: "center" }}
        >
          →
        </Typography>
        <Box>
          <Stack
            direction="row"
            alignItems="baseline"
            flexWrap="wrap"
            columnGap={0.8}
            sx={{ position: "relative", width: "fit-content" }}
          >
            <Typography variant="h6" fontWeight={700} lineHeight={1}>
              {formatTime(segment.arrival.time)}
            </Typography>
            {segmentDayOffset !== 0 && (
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  top: -4,
                  right: -14,
                  color: "text.secondary",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {formatDayOffsetLabel(segmentDayOffset)}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {formatDate(segment.arrival.time)}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {segment.arrival.airport}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};
