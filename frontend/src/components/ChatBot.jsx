import React, { useState, useEffect } from 'react';
import { Box, Container, Flex, Input, VStack, useColorModeValue, IconButton, Spinner, Select } from '@chakra-ui/react';
import { FaArrowUp } from 'react-icons/fa';
import Message from './Message.jsx';

const ChatBot = () => {
  const [knownBoardGames, setKnownBoardGames] = useState([]);
  const [selectedBoardGame, setSelectedBoardGame] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetKnownBoardGames = async () => {
    if (knownBoardGames.length > 0) return;

    try {
      const response = await fetch('/api/known-board-games', { method: 'GET' });
      const data = await response.json();
      setKnownBoardGames(data.response);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Failed to load known board games", isUser: false }]);
    }
  };

  useEffect(() => {
    handleGetKnownBoardGames();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);

    try {
      const askResponse = await fetch('/api/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      
      const askData = await askResponse.json();
      setMessages(prev => [...prev, { text: askData.response, isUser: false }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting to the server.", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBoardGameSelect = async (e) => {
    try {
      const selectedBoardGame = e.target.value;

      const response = await fetch('/api/set-selected-board-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "selected_board_game": selectedBoardGame}),
      });
      const data = await response.json();

      // TODO: if not successful, pop a toast
      if (data.success) {
        setSelectedBoardGame(selectedBoardGame);
      }
    } catch (error) {
      setMessages(prev => [...prev, { text: "Failed to select board game", isUser: false }]);
    }
  };

  return (
    <Box h="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Dropdown for selecting known board games */}
      <Box position="fixed" top={4} right={4} zIndex={1}>
        <Select 
          value={selectedBoardGame}
          onChange={handleBoardGameSelect}
          placeholder="Select a board game"
          bg={useColorModeValue('white', 'gray.800')}
          borderColor={useColorModeValue('gray.200', 'gray.600')}
        >
          {knownBoardGames.map((game, index) => (
            <option key={index} value={game}>{game}</option>
          ))}
        </Select>
      </Box>

      {/* Messages container */}
      <VStack h="calc(100vh - 100px)" overflowY="auto" spacing={0}>
        {messages.map((message, index) => (
          <Message key={index} message={message.text} isUser={message.isUser} />
        ))}
      </VStack>

      {/* Input container */}
      <Box 
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        p={4}
        bg={useColorModeValue('white', 'gray.800')}
        borderTop="1px"
        borderColor={useColorModeValue('gray.200', 'gray.600')}
      >
        <Container maxW="container.lg">
          <Flex>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about board games..."
              mr={2}
              disabled={isLoading}
            />
            <IconButton
              icon={isLoading ? <Spinner /> : <FaArrowUp />}
              onClick={handleSend}
              colorScheme="blackAlpha"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            />
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default ChatBot;
