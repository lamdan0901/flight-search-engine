import FlightTakeoff from "@mui/icons-material/FlightTakeoff";
import { Box, Container, Stack, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";

export const AppLayout = () => (
  <Box>
    <Box
      component="header"
      sx={{
        py: { xs: 4, md: 6 },
        background:
          "linear-gradient(120deg, rgba(14,165,164,0.15), rgba(249,115,22,0.1))",
      }}
    >
      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        maxWidth="lg"
      >
        <Stack>
          <Typography variant="h4">Atlas Airfare</Typography>
          <Typography variant="body1" color="text.secondary">
            Search, share, and refine real-time flight offers in seconds.
          </Typography>
        </Stack>

        <FlightTakeoff
          sx={{
            fontSize: {
              md: 88,
              xs: 60,
            },
            opacity: 0.6,
          }}
        />
      </Container>
    </Box>
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Outlet />
    </Container>
  </Box>
);
