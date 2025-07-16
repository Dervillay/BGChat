import { gradients } from '../gradients.ts';

export const Link = {
  baseStyle: {
    position: "relative",
    fontWeight: "semibold",
    textDecoration: "none",
  },
  variants: {
    rulebookLink: {
      backgroundImage: gradients.cosmic,
      backgroundSize: "300% 300%",
      backgroundPosition: "0% 50%",
      backgroundClip: "text",
      transition: "all 0.4s ease",
      _hover: {
        backgroundPosition: "100% 50%",
        transform: "translateY(-1px)",
        filter: "brightness(1.1)",
      },
      sx: {
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        "&.mouse-moving": {
          animation: "shimmerHover 1.2s ease-in-out infinite",
        },
        "@keyframes shimmerHover": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        }
      }
    },
  }
};
