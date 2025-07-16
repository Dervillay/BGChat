import { extendTheme } from '@chakra-ui/react';
import { Input } from './components/Input.ts';
import { Button } from './components/Button.ts';
import { Select } from './components/Select.ts';
import { Link } from './components/Link.ts';
import { Tooltip } from './components/Tooltip.ts';
import { gradients } from './gradients.ts';

export const theme = extendTheme({
    gradients,
    config: {
        initialColorMode: 'dark',
        useSystemColorMode: false,
    },
    semanticTokens: {
        colors: {
            'chakra-body-bg': {
                _light: 'white',
                _dark: '#101010',
            },
            'chakra-body-message-bg': {
                _light: 'gray.100',
                _dark: '#2a2a2a',
            },
            'chakra-body-text': {
                _light: 'gray.700',
                _dark: '#e0e0e0',
            },
            'chakra-body-text-highlight': {
                _light: 'gray.900',
                _dark: '#ffffff',
            },
            'chakra-body-border': {
                _light: 'gray.200',
                _dark: '#505050',
            },
            'chakra-body-border-focus': {
                _light: 'gray.300',
                _dark: '#606060',
            },
        },
    },
    components: {
        Input,
        Button,
        Select,
        Link,
        Tooltip,
    },
}); 