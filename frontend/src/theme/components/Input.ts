export const Input = {
  baseStyle: {
    field: {
      resize: "none", 
      border: "1px solid",
      borderColor: "gray.200",
      borderRadius: "1.5rem",
      textColor: "gray.800",
      boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.1)",
      verticalAlign: "top",
      minH: "5rem",
      maxH: "15rem",
      h: "auto",
      overflowY: "auto",
      p: "1rem",
      pr: "3.5rem",
      paddingTop: "1rem",
      lineHeight: "normal",
      alignSelf: "flex-start"
    }
  },
  variants: {
    chat: {
      field: {
        _hover: {
          boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.15)"
        },
        _focus: {
          boxShadow: "0 0.1875rem 0.375rem rgba(0, 0, 0, 0.2)",
          outline: undefined,
          borderColor: "gray.200"
        }
      }
    }
  },
  defaultProps: {
    variant: "chat"
  }
};