import { border } from "@chakra-ui/react";

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
      lineHeight: "normal",
      "&::-webkit-scrollbar": {
        width: "0.45rem",
      },
      "&::-webkit-scrollbar-track": {
        margin: "1.25rem",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "1.5rem",
        backgroundColor: "rgba(0,0,0,0.4)",
      }
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