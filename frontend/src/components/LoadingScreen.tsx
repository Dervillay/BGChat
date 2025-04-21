import React from 'react';
import { Box, Center, Image } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const pulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
`;

export const LoadingScreen = () => {
  const animation = `${pulse} 2s ease-in-out infinite`;
  
  return (
    <Center h="100vh">
      <Box animation={animation}>
        <Image 
          src="/images/logo.png" 
          width="5vw"
          height="5vw"
        />
        </Box>
    </Center>
  );
}; 