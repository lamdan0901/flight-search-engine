import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import { Fab, Zoom } from "@mui/material";
import { useEffect, useState } from "react";

type ScrollToTopFabProps = {
  threshold?: number;
};

export const ScrollToTopFab = ({ threshold = 240 }: ScrollToTopFabProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Zoom in={isVisible}>
      <Fab
        color="primary"
        aria-label="Scroll to top"
        onClick={handleScrollToTop}
        size="medium"
        sx={{
          position: "fixed",
          right: { xs: 16, md: 24 },
          bottom: { xs: 16, md: 24 },
          zIndex: 1150,
        }}
      >
        <KeyboardArrowUpRoundedIcon />
      </Fab>
    </Zoom>
  );
};
