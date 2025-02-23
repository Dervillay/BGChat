export const Link = {
  baseStyle: {
    position: "relative",
    fontWeight: "semibold",
    textDecoration: "none",
    _hover: {
      textDecoration: "none",
    }
  },
  variants: {
    shimmeringLink: {
      backgroundImage: "linear-gradient(to-l, #7928CA, #FF0080)",
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
