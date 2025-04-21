import { gradients } from '../gradients.ts';

export const Link = {
  baseStyle: {
    position: "relative",
    fontWeight: "semibold",
    textDecoration: "none",
  },
  variants: {
    shimmeringLink: {
      backgroundImage: gradients.purpleToRed,
      backgroundSize: "200% 200%",
      backgroundPosition: "30% 80%",
      backgroundClip: "text",
      transition: "background-position 0.1s ease",
      sx: {
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }
    }
  }
};
