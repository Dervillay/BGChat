export const ChatInput = {
  baseStyle: {
    container: {
      direction: "column",
      minW: "100%",
      gap: 1,
      border: "1px solid",
      borderColor: "chakra-body-border",
      borderRadius: "1.5rem",
      textColor: "chakra-body-text",
      h: "auto",
      lineHeight: "normal",
      px: ".75rem",
      py: "1rem",
      _dark: {
        bg: "chakra-body-message-bg",
      },
      _hover: {
        borderColor: "chakra-body-border-focus"
      },
      _focus: {
        outline: undefined,
        borderColor: "chakra-body-border-focus",
      }
    },
    input: {
      variant: "unstyled",
      minH: "3rem",
      fontSize: { base: "sm", md: "md" },
      flex: "1",
      border: "none",
      resize: "none",
      overflowY: "auto",
      _dark: {
        bg: "transparent",
        _placeholder: {
          color: "#a0a0a0"
        }
      },
      _hover: {
        border: "none"
      },
      _focus: {
        border: "none",
        boxShadow: "none"
      }
    },
    controls: {
      align: "center",
      gap: { base: 1, md: 2 },
      justify: "flex-end",
      flexShrink: 0
    }
  }
}; 