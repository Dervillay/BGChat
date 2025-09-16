export const FeedbackModal = {
  baseStyle: {
    overlay: {
      backdropFilter: "blur(10px)",
      bg: "blackAlpha.300",
    },
    content: {
      bg: "chakra-body-bg",
      borderRadius: "xl",
      mx: 4,
      sx: {
        '::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          borderRadius: '1rem',
          padding: '2px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
        },
      },
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
      _focus: { borderColor: "chakra-body-border-focus", boxShadow: "outline" },
      _placeholder: { color: "chakra-body-text", opacity: 0.6 },
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
      _focus: { borderColor: "chakra-body-border-focus", boxShadow: "outline" },
    },
    footer: {
      justifyContent: "flex-end",
    },
    submitButton: {
      bgGradient: "gradient.cosmic",
      color: "white",
    },
  },
};
