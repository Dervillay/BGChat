import React from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Box, 
  Container,
  Flex,
} from '@chakra-ui/react';

const Message = ({ message, isUser }) => {  
  return (
    <Box
      w="100%"
      bg={isUser ? 'gray.100' : 'white'}
      p={4}
    >
      <Container maxW="container.lg">
        <Flex>
          <Box
            w="30px"
            h="30px"
            borderRadius="md"
            bg={isUser ? 'black' : 'grey.600'}
            mr={3}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontWeight="bold"
          >
            {isUser ? 'Me' : 'Board Brain'}
          </Box>
          <ReactMarkdown>
            {message}
          </ReactMarkdown>
        </Flex>
      </Container>
    </Box>
  );
};

export default Message;
