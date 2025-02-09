export const ChatInputStyles = {
  baseStyle: {
    field: {
      as: "textarea",
      resize: "none",
      border: "1px solid",
      borderColor: "gray.200",
      borderRadius: "1.5rem",
      textColor: "gray.800",
      boxShadow: "sm",
      minH: "5rem",
      maxH: "15rem",
      h: "auto",
      overflowY: "auto",
      p: "4",
      pr: "14",
    }
  },
  variants: {
    chat: {
      field: {
        _hover: { boxShadow: "md" },
        _focus: {
          boxShadow: "lg",
          outline: "none",
          borderColor: "gray.200"
        }
      }
    }
  },
  defaultProps: {
    variant: "chat"
  }
}; 