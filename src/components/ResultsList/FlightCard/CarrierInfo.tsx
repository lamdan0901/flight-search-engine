import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { Chip, IconButton, Stack } from "@mui/material";

interface CarrierInfoProps {
  carrierCodes: string[];
  expanded: boolean;
}

export const CarrierChips = ({ carrierCodes }: { carrierCodes: string[] }) => (
  <Stack direction={{ xs: "row", md: "column" }} spacing={1} flexWrap="wrap">
    {carrierCodes.map((code) => (
      <Chip
        key={code}
        label={code}
        size="small"
        sx={{
          fontWeight: 600,
          bgcolor: "primary.main",
          color: "white",
          "& .MuiChip-label": { px: 1.5 },
        }}
      />
    ))}
  </Stack>
);

export const ExpandButton = ({
  expanded,
  onClick,
}: {
  expanded: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) => (
  <IconButton
    sx={{
      transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.2s",
      bgcolor: "grey.100",
      "&:hover": { bgcolor: "grey.200" },
    }}
    size="small"
    onClick={onClick}
  >
    <ExpandMoreIcon fontSize="small" />
  </IconButton>
);

export const CarrierInfo = ({ carrierCodes, expanded }: CarrierInfoProps) => (
  <Stack
    direction="row"
    spacing={1}
    alignItems="center"
    sx={{
      minWidth: { md: 100 },
      justifyContent: { xs: "space-between", md: "flex-end" },
    }}
  >
    <CarrierChips carrierCodes={carrierCodes} />
    <ExpandButton expanded={expanded} />
  </Stack>
);
