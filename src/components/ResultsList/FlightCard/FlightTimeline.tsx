import { Box, Stack, Typography } from "@mui/material";
import type { Segment } from "../../../types/flight";
import {
  formatAirportCode,
  formatDate,
  formatDuration,
  formatTime,
} from "../../../utils/formatters";
import { formatDayOffsetLabel } from "./utils";
import { TimelinePath } from "./TimelinePath";

interface FlightTimelineProps {
  firstSegment: Segment;
  lastSegment: Segment;
  stopsCount: number;
  totalDurationMinutes: number;
  showDates: boolean;
  itineraryDayOffset: number;
}

export const FlightTimeline = ({
  firstSegment,
  lastSegment,
  stopsCount,
  totalDurationMinutes,
  showDates,
  itineraryDayOffset,
}: FlightTimelineProps) => (
  <Box sx={{ flex: 1 }}>
    <Stack direction="column" alignItems="center">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={1}
        sx={{ width: "100%" }}
      >
        <Stack
          alignItems="center"
          sx={{ minWidth: { xs: 60, sm: 70 }, flexShrink: 0 }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              lineHeight: 1,
              mb: 0.5,
              whiteSpace: "nowrap",
            }}
          >
            {formatTime(firstSegment.departure.time)}
          </Typography>
          {showDates && (
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 500,
                lineHeight: 1.2,
                mb: 0.5,
                whiteSpace: "nowrap",
              }}
            >
              {formatDate(firstSegment.departure.time)}
            </Typography>
          )}
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              width: { xs: "120px", md: "160px" },
              textAlign: "center",
            }}
          >
            {formatAirportCode(firstSegment.departure.airport)}
          </Typography>
        </Stack>

        <TimelinePath stopsCount={stopsCount} />

        <Stack
          alignItems="center"
          sx={{ minWidth: { xs: 60, sm: 70 }, flexShrink: 0 }}
        >
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                lineHeight: 1,
                mb: 0.5,
                whiteSpace: "nowrap",
              }}
            >
              {formatTime(lastSegment.arrival.time)}
            </Typography>
            {itineraryDayOffset !== 0 && (
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  top: -6,
                  right: -14,
                  color: "text.secondary",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {formatDayOffsetLabel(itineraryDayOffset)}
              </Typography>
            )}
          </Box>
          {showDates && (
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 500,
                lineHeight: 1.2,
                mb: 0.5,
                whiteSpace: "nowrap",
              }}
            >
              {formatDate(lastSegment.arrival.time)}
            </Typography>
          )}
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              width: { xs: "120px", md: "160px" },
              textAlign: "center",
            }}
          >
            {formatAirportCode(lastSegment.arrival.airport)}
          </Typography>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        spacing={1.5}
        justifyContent="center"
        alignItems="center"
        sx={{ flexWrap: "wrap", width: "100%" }}
      >
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <Typography
            variant="subtitle1"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
            }}
          >
            {formatDuration(totalDurationMinutes)}
          </Typography>
        </Box>

        {/* Stop dots */}
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor:
                stopsCount === 0
                  ? "rgba(16, 185, 129, 0.1)"
                  : stopsCount === 1
                    ? "rgba(245, 158, 11, 0.1)"
                    : "rgba(239, 68, 68, 0.1)",
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor:
                  stopsCount === 0
                    ? "#10b981"
                    : stopsCount === 1
                      ? "#f59e0b"
                      : "#ef4444",
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color:
                  stopsCount === 0
                    ? "#10b981"
                    : stopsCount === 1
                      ? "#d97706"
                      : "#dc2626",
              }}
            >
              {stopsCount === 0
                ? "Direct"
                : stopsCount === 1
                  ? "1 stop"
                  : `${stopsCount} stops`}
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Stack>
  </Box>
);
