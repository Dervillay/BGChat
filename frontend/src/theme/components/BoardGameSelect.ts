export const BoardGameSelect = {
  control: (provided: any, state: any, selectedBoardGame: string) => ({
    ...provided,
    border: 'none',
    boxShadow: 'none',
    borderRadius: '1.5rem',
    minWidth: selectedBoardGame ? 'fit-content' : '11.5rem',
    maxWidth: "13rem",
    paddingRight: '1.25rem',
    color: 'chakra-body-text',
    fontSize: 'md',
    '&:hover': {
      boxShadow: 'none',
      border: '1px',
      borderColor: 'chakra-body-border-focus',
      cursor: 'pointer',
    },
    '&:focus-within': {
      boxShadow: 'none',
      border: '1px',
      borderColor: 'chakra-body-border-focus',
    },
    ...(state.isFocused && {
      border: '1px',
      borderColor: 'chakra-body-border-focus',
    }),
  }),
  
  singleValue: (provided: any) => ({
    ...provided,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  }),
  
  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: 'chakra-body-text',
    marginRight: '0',
    position: 'absolute',
  }),
  
  menu: (provided: any) => ({
    ...provided,
    minWidth: { base: '13rem', md: '18rem' },
    borderRadius: '10px',
    right: 0,
    borderColor: 'chakra-body-border',
  }),
  
  menuList: (provided: any) => ({
    ...provided,
    borderRadius: '10px',
    padding: '0.3rem',
    backgroundColor: 'chakra-body-bg',
    maxHeight: '15rem',
    overflowY: 'auto',
    _dark: {
      backgroundColor: 'chakra-body-message-bg',
    }
  }),
  
  option: (provided: any, state: any) => ({
    ...provided,
    fontWeight: 'normal',
    backgroundColor: 'transparent',
    color: 'chakra-body-text',
    fontSize: 'md',
    '&:hover': {
      backgroundColor: 'gray.100',
      borderRadius: '5px',
    },
    _dark: {
      '&:hover': {
        backgroundColor: 'chakra-body-border',
      },
    },
    ...(state.isSelected && {
      color: 'chakra-body-text-highlight',
    }),
  }),
  
  placeholder: (provided: any) => ({
    ...provided,
    _dark: {
      color: '#a0a0a0',
    },
  }),
};
