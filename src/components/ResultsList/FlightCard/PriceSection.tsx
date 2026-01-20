import { Stack, Typography } from "@mui/material";
import { formatCurrency } from "../../../utils/formatters";

interface PriceSectionProps {
  amount: number;
  currency: string;
}

export const PriceSection = ({ amount, currency }: PriceSectionProps) => (
  <Stack
    sx={{
      minWidth: { md: 120 },
      alignItems: { xs: "flex-start", md: "flex-start" },
    }}
  >
    <Typography
      variant="h5"
      sx={{
        fontWeight: 700,
        color: "primary.main",
        lineHeight: 1.2,
      }}
    >
      {formatCurrency(amount, currency)}
    </Typography>
    <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.25 }}>
      per person
    </Typography>
  </Stack>
);
