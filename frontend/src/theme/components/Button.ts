export const Button = {
  baseStyle: {
    borderRadius: "full",
    _dark: {
      _hover: {
        filter: "brightness(1.2)"
      }
    }
  },
  variants: {
    send: {
      bg: "black",
      color: "white",
      _hover: { 
        bg: "blackAlpha.600"
      },
      _disabled: { 
        bg: "black",
        opacity: 0.6,
        cursor: "not-allowed"
      },
      _dark: {
        bg: "#e0e0e0",
        color: "#101010",
        _hover: {
          bg: "#f0f0f0",
          filter: "brightness(1.1)"
        },
        _disabled: {
          bg: "#a0a0a0",
          color: "#606060",
          opacity: 0.6,
          cursor: "not-allowed"
        }
      }
    }
  },
  defaultProps: {
    variant: "send",
    size: "sm"
  }
}; 