import {
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PriceBucket } from "../types/flight";

export const PriceChart = ({
  count,
  buckets,
}: {
  count: number;
  buckets: PriceBucket[];
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const xAxisAngle = isSmallScreen ? -55 : 0;

  // Make the chart height responsive to the bucket prices
  const maxRangeValue = buckets.reduce((maxValue, bucket) => {
    const matches = bucket.range.match(/[\d,.]+/g);
    const lastValue = matches?.[matches.length - 1];

    if (!lastValue) {
      return maxValue;
    }

    const parsed = Number(lastValue.replace(/,/g, ""));
    if (Number.isNaN(parsed)) {
      return maxValue;
    }

    return Math.max(maxValue, parsed);
  }, 0);

  const maxForScale = Math.min(maxRangeValue, 2000);
  const heightScale = maxForScale / 2000;
  const chartHeight = isSmallScreen ? Math.round(200 + heightScale * 40) : 180;
  const bottomMargin = isSmallScreen ? Math.round(14 + heightScale * 10) : 0;

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="end" justifyContent="space-between">
          <Typography variant="subtitle1">Price distribution</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            There are {count} offers
          </Typography>
        </Stack>

        {buckets.length ? (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={buckets} margin={{ bottom: bottomMargin }}>
              <XAxis
                dataKey="range"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={xAxisAngle}
                textAnchor={isSmallScreen ? "end" : "middle"}
                height={isSmallScreen ? 60 : 30}
                tickMargin={8}
              />
              <YAxis allowDecimals={false} width={40} />
              <Tooltip cursor={{ fill: "#eaeff1" }} />
              <Bar
                dataKey="count"
                fill="#0ea5a4"
                radius={[6, 6, 0, 0]}
                maxBarSize={100}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Search for flights to see a price trend.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};
