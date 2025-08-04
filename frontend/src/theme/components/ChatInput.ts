export const ChatInput = {
  baseStyle: {
    container: {
      direction: "column",
      maxW: { base: "100%", md: "48rem" },
      mx: "auto",
      gap: 1,
      border: "1px solid",
      borderColor: "chakra-body-border",
      borderRadius: "1.5rem",
      textColor: "chakra-body-text",
      h: "auto",
      lineHeight: "normal",
      px: "0.8rem",
      py: "0.8rem",
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
  },
  variants: {
    bottomFixed: {
      container: {
        borderRadius: { base: "1.5rem 1.5rem 0 0", md: "1.5rem" },
      }
    }
  }
}; 