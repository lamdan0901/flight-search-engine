import { FlightTakeoff as FlightIcon } from "@mui/icons-material";
import { Box, Stack } from "@mui/material";

interface TimelinePathProps {
  stopsCount: number;
}

export const TimelinePath = ({ stopsCount }: TimelinePathProps) => (
  <Box
    sx={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      position: "relative",
      mx: 1,
      maxWidth: 220,
      minWidth: 60,
    }}
  >
    {/* Origin dot */}
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: "primary.main",
        flexShrink: 0,
        zIndex: 1,
      }}
    />

    {/* Flight path line */}
    <Box
      sx={{
        flex: 1,
        height: 2,
        background:
          stopsCount === 0
            ? "linear-gradient(90deg, #10b981 0%, #34d399 100%)"
            : stopsCount === 1
              ? "linear-gradient(90deg, #0ea5a4 0%, #f59e0b 50%, #06b6d4 100%)"
              : "linear-gradient(90deg, #0ea5a4 0%, #f59e0b 33%, #ef4444 66%, #06b6d4 100%)",
        position: "relative",
        mx: -0.5,
      }}
    >
      {/* Stop dots on the path */}
      {stopsCount > 0 && (
        <Stack
          direction="row"
          justifyContent="space-evenly"
          sx={{
            position: "absolute",
            top: "50%",
            left: "10%",
            right: "10%",
            transform: "translateY(-50%)",
          }}
        >
          {Array.from({
            length: Math.min(stopsCount, 3),
          }).map((_, i) => (
            <Box
              key={i}
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor:
                  stopsCount === 1 ? "#f59e0b" : i === 0 ? "#f59e0b" : "#ef4444",
                border: "2px solid",
                borderColor: "background.paper",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          ))}
        </Stack>
      )}

      {/* Airplane icon for nonstop */}
      {stopsCount === 0 && (
        <FlightIcon
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 18,
            color: "#10b981",
            bgcolor: "background.paper",
            borderRadius: "50%",
            p: 0.25,
          }}
        />
      )}
    </Box>

    {/* Destination dot */}
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: "primary.main",
        flexShrink: 0,
        zIndex: 1,
      }}
    />
  </Box>
);
