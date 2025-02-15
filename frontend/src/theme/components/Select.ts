export const Select = {
  variants: {
    select: {
      field: {
        width: "auto",
        minWidth: "10rem",
        fontWeight: "semibold",
        bg: "white",
        border: "1px solid",
        borderColor: "gray.200",
        borderRadius: "1.5rem",
        _hover: {
          borderColor: "gray.300",
        },
        _focus: {
          borderColor: "gray.300",
        },
      }
    }
  },
  defaultProps: {
    variant: "select"
  }
}; 