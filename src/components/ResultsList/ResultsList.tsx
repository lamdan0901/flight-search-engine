import { Pagination, Stack } from "@mui/material";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import type { FlightOffer } from "../../types/flight";
import { EmptyState } from "../feedback/EmptyState";
import { ErrorState } from "../feedback/ErrorState";
import { LoadingState } from "../feedback/LoadingState";
import { FlightCard } from "./FlightCard";

const PAGE_SIZE = 25;

export const ResultsList = ({
  offers,
  loading,
  error,
  onRetry,
  onEmptyAction,
}: {
  offers: FlightOffer[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onEmptyAction?: () => void;
}) => {
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement | null>(null);
  const totalPages = Math.max(1, Math.ceil(offers.length / PAGE_SIZE));
  const displayPage = Math.min(page, totalPages);

  const pageOffers = useMemo(() => {
    const start = (displayPage - 1) * PAGE_SIZE;
    return offers.slice(start, start + PAGE_SIZE);
  }, [displayPage, offers]);

  const scrollToListTop = (node: HTMLDivElement | null) => {
    if (!node) return;

    const top = node.getBoundingClientRect().top + window.scrollY;
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      window.scrollTo({ top });
      return;
    }

    const start = window.scrollY;
    const distance = top - start;
    const durationMs = 200;
    let startTime: number | null = null;

    const step = (time: number) => {
      if (startTime === null) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, start + distance * eased);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const handlePageChange = (_event: ChangeEvent<unknown>, value: number) => {
    setPage(value);
    requestAnimationFrame(() => scrollToListTop(listRef.current));
  };

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <ErrorState
        title="We hit turbulence"
        description={error}
        onRetry={onRetry}
      />
    );
  }

  if (!offers.length) {
    return (
      <EmptyState
        title="No flights match yet"
        description="Try adjusting filters or widening your dates."
        ctaLabel="Reset filters"
        onCta={onEmptyAction}
      />
    );
  }

  return (
    <Stack spacing={2} ref={listRef}>
      {pageOffers.map((offer) => (
        <FlightCard key={offer.id} offer={offer} />
      ))}

      {offers.length > PAGE_SIZE ? (
        <Stack alignItems="center" py={1}>
          <Pagination
            count={totalPages}
            page={displayPage}
            onChange={handlePageChange}
            shape="rounded"
            sx={{
              "& .MuiPaginationItem-root": {
                fontWeight: 600,
              },
            }}
          />
        </Stack>
      ) : null}
    </Stack>
  );
};
