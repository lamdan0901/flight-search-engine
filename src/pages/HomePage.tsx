import { Box, Stack } from "@mui/material";
import { FiltersPanel } from "../components/FiltersPanel";
import { PriceChart } from "../components/PriceChart";
import { ResultsList } from "../components/ResultsList/ResultsList";
import { ScrollToTopFab } from "../components/ScrollToTopFab";
import { SearchForm } from "../components/SearchForm";
import { useFilteredOffers } from "../hooks/useFilteredOffers";
import { useFilters } from "../hooks/useFilters";
import { useSearchState } from "../hooks/useSearchState";
import { buildPriceBuckets } from "../utils/priceBuckets";

export const HomePage = () => {
  const { query, setQuery, offers, loading, error, submitSearch, retry } =
    useSearchState();
  const {
    filters,
    updateFilters,
    resetFilters,
    availableAirlines,
    priceBounds,
  } = useFilters(offers);
  const { sorted } = useFilteredOffers(offers, filters);
  const buckets = buildPriceBuckets(sorted.map((offer) => offer.price.amount));
  const hasResults = offers.length > 0;

  return (
    <Stack spacing={{ xs: 0, md: 2 }}>
      <SearchForm
        query={query}
        onChange={setQuery}
        onSubmit={(next) => submitSearch(next)}
        disabled={loading}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: { md: 280 }, flexShrink: 0 }}>
          <FiltersPanel
            filters={filters}
            availableAirlines={availableAirlines}
            priceBounds={priceBounds}
            onChange={(next) => updateFilters(next)}
            onReset={resetFilters}
            sortKey={filters.sortKey}
            onSortChange={(value) => updateFilters({ sortKey: value })}
            limit={query.max}
            onLimitChange={(value) => {
              const nextQuery = { ...query, max: value };
              setQuery(nextQuery);
              void submitSearch(nextQuery, { replace: true });
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Stack spacing={2}>
            {hasResults && (
              <PriceChart count={sorted.length} buckets={buckets} />
            )}
            <ResultsList
              offers={sorted}
              loading={loading}
              error={error}
              onRetry={retry}
              onEmptyAction={resetFilters}
            />
          </Stack>
        </Box>
      </Box>

      <ScrollToTopFab />
    </Stack>
  );
};
