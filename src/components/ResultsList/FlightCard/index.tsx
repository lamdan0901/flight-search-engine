import { Box, Collapse, Paper, Stack } from "@mui/material";
import { useState } from "react";
import type { FlightOffer } from "../../../types/flight";
import { formatDate } from "../../../utils/formatters";
import { CarrierChips, CarrierInfo, ExpandButton } from "./CarrierInfo";
import { FlightDetails } from "./FlightDetails";
import { FlightTimeline } from "./FlightTimeline";
import { getDayOffset } from "./utils";
import { PriceSection } from "./PriceSection";
import { cardStyles } from "./styles";

export const FlightCard = ({ offer }: { offer: FlightOffer }) => {
  const [expanded, setExpanded] = useState(false);
  const firstSegment = offer.segments[0];
  const lastSegment = offer.segments[offer.segments.length - 1];

  if (!firstSegment || !lastSegment) return null;

  const showDates =
    formatDate(firstSegment.departure.time) !==
    formatDate(lastSegment.arrival.time);

  const itineraryDayOffset = getDayOffset(
    firstSegment.departure.time,
    lastSegment.arrival.time,
  );

  const handleCardClick = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }
    setExpanded(!expanded);
  };

  return (
    <Paper
      elevation={0}
      sx={[cardStyles, expanded && { "&::before": { opacity: 1 } }]}
      onClick={handleCardClick}
    >
      <Box p={2}>
        {/* Desktop Layout */}
        <Stack
          direction="row"
          spacing={3}
          alignItems="center"
          display={{ xs: "none", md: "flex" }}
        >
          <PriceSection
            amount={offer.price.amount}
            currency={offer.price.currency}
          />
          <FlightTimeline
            firstSegment={firstSegment}
            lastSegment={lastSegment}
            stopsCount={offer.stopsCount}
            totalDurationMinutes={offer.totalDurationMinutes}
            showDates={showDates}
            itineraryDayOffset={itineraryDayOffset}
          />
          <CarrierInfo carrierCodes={offer.carrierCodes} expanded={expanded} />
        </Stack>

        {/* Mobile Layout */}
        <Stack spacing={2} display={{ xs: "flex", md: "none" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            position="relative"
          >
            <PriceSection
              amount={offer.price.amount}
              currency={offer.price.currency}
            />
            <Box
              position="absolute"
              left="50%"
              sx={{ transform: "translateX(-50%)" }}
            >
              <CarrierChips carrierCodes={offer.carrierCodes} />
            </Box>
            <ExpandButton expanded={expanded} onClick={handleCardClick} />
          </Stack>

          <FlightTimeline
            firstSegment={firstSegment}
            lastSegment={lastSegment}
            stopsCount={offer.stopsCount}
            totalDurationMinutes={offer.totalDurationMinutes}
            showDates={showDates}
            itineraryDayOffset={itineraryDayOffset}
          />
        </Stack>

        <Collapse in={expanded}>
          <FlightDetails segments={offer.segments} offerId={offer.id} />
        </Collapse>
      </Box>
    </Paper>
  );
};
