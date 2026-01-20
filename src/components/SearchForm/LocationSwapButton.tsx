import { Box, IconButton } from "@mui/material";
import { SwapHoriz } from "@mui/icons-material";

type LocationSwapButtonProps = {
  isRotated: boolean;
  onSwap: () => void;
};

export const LocationSwapButton = ({
  isRotated,
  onSwap,
}: LocationSwapButtonProps) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: {
        md: "static",
        xs: "absolute",
      },
      right: -20,
      top: 45,
      zIndex: 1,
    }}
    pb={2.5}
  >
    <IconButton
      onClick={onSwap}
      color="primary"
      sx={{
        transform: {
          xs: isRotated ? "rotate(270deg)" : "rotate(90deg)",
          md: isRotated ? "rotate(180deg)" : "rotate(0deg)",
        },
        transition: "transform 0.3s ease-in-out",
        bgcolor: "background.paper",
        border: "1px solid #0ea5a4",
        "&:hover": {
          bgcolor: "background.default",
        },
      }}
    >
      <SwapHoriz />
    </IconButton>
  </Box>
);
