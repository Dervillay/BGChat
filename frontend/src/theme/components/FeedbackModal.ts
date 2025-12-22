export const FeedbackModal = {
  baseStyle: {
    overlay: {
      backdropFilter: "blur(10px)",
      bg: "blackAlpha.300",
    },
    content: {
      bg: "chakra-body-bg",
      borderRadius: "1rem",
      mx: 4,
    },
    borderPseudoElement: {
      content: '""',
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      borderRadius: '1rem',
      padding: '2px',
      WebkitMask:
        'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      pointerEvents: 'none',
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      pl: 5,
      pr: 2,
      pt: 2,
      pb: 0,
      position: "relative",
    },
    headerText: {
      fontSize: "lg",
    },
    closeButton: {
      variant: "ghost",
      size: "md",
    },
    formLabel: {
      fontWeight: "medium",
      color: "chakra-body-text",
    },
    textarea: {
      minH: "120px",
      resize: "vertical",
      borderColor: "chakra-body-border",
      _hover: { borderColor: "chakra-body-border-focus" },
      _focus: { 
        outline: "none",
        borderColor: "chakra-body-border-focus", 
        boxShadow: "none" 
      },
      _invalid: {
        borderColor: "red.500",
        _hover: { borderColor: "red.500" },
        _focus: { borderColor: "red.500", boxShadow: "none", outline: "none" },
      },
    },
    helperText: {
      fontSize: "sm",
      color: "chakra-body-text",
      mt: 1,
    },
    emailHelperText: {
      fontSize: "sm",
      color: "chakra-body-text",
      mb: 4,
    },
    input: {
      borderColor: "chakra-body-border",
      _hover: { borderColor: "chakra-body-border-focus" },
      _focus: { 
        outline: "none",
        borderColor: "chakra-body-border-focus", 
        boxShadow: "none" 
      },
      _invalid: {
        borderColor: "red.500",
        _hover: { borderColor: "red.500" },
        _focus: { borderColor: "red.500", boxShadow: "none", outline: "none" },
      },
    },
    footer: {
      justifyContent: "flex-end",
    },
    submitButton: {
      bg: "gray.100",
      color: "gray.700",
      _dark: {
        bg: "#2a2a2a",
        color: "#a0a0a0",
      },
      _hover: {
        bg: "gray.200",
        _dark: {
          bg: "#3a3a3a",
        },
      },
    },
  },
};
