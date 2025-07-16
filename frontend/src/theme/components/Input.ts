export const Input = {
  baseStyle: {
    field: {
      resize: "none", 
      border: "1px solid",
      borderColor: "chakra-body-border",
      borderRadius: "1.5rem",
      textColor: "chakra-body-text",
      verticalAlign: "top",
      minH: "5rem",
      maxH: "15rem",
      h: "auto",
      overflowY: "auto",
      lineHeight: "normal",
      _dark: {
        bg: "chakra-body-message-bg",
        _placeholder: {
          color: "#a0a0a0"
        }
      },
      _hover: {
        borderColor: "chakra-body-border-focus"
      },
      _focus: {
        outline: undefined,
        borderColor: "chakra-body-border-focus",
      },
      "&::-webkit-scrollbar": {
        width: "0.45rem",
      },
      "&::-webkit-scrollbar-track": {
        margin: "1.25rem",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "1.5rem",
        backgroundColor: "rgba(0,0,0,0.4)",
      },
    }
  },
};