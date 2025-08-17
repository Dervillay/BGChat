import { FaBorderAll } from "react-icons/fa";

export const ChatInput = {
  baseStyle: {
    container: {
      direction: "column",
      maxW: { base: "100%", md: "48rem" },
      mx: "auto",
      gap: 1.5,
      border: "1px solid",
      bg: "chakra-body-bg",
      borderColor: "chakra-body-border",
      borderRadius: "1.5rem",
      textColor: "chakra-body-text",
      h: "auto",
      lineHeight: "normal",
      px: "1rem",
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
      minH: "2.5rem",
      maxH: "6rem",
      fontSize: "md",
      flex: "1",
      border: "none",
      borderRadius: "0",
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
        border: "none",
        _light: {
          border: "1px solid",
          borderColor: "chakra-body-border",
        }
      }
    }
  }
}; 