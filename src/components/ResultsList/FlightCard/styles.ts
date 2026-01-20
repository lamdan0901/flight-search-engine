export const cardStyles = {
  position: "relative",
  p: 0,
  overflow: "hidden",
  transition: "all 0.2s ease-in-out",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(14, 165, 164, 0.12)",
    "&::before": {
      opacity: 1,
    },
  },
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    background: "linear-gradient(180deg, #0ea5a4 0%, #06b6d4 100%)",
    opacity: 0,
    transition: "opacity 0.2s ease-in-out",
  },
};
