import { extendTheme } from '@chakra-ui/react';
import { Input } from './components/Input.ts';
import { Button } from './components/Button.ts';
import { Select } from './components/Select.ts';

export const theme = extendTheme({
    components: {
        Input,
        Button,
        Select,
    },
}); 