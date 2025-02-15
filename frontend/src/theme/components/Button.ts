export const Button = {
  baseStyle: {
    borderRadius: "full",
  },
  variants: {
    send: {
      bg: "black",
      color: "white",
      _hover: { 
        bg: "blackAlpha.600"
      },
      _disabled: { 
        bg: "black !important",
        opacity: 0.6,
        cursor: "not-allowed"
      }
    }
  },
  defaultProps: {
    variant: "send",
    size: "sm"
  }
}; 