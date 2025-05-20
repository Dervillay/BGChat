import React, { useState, useEffect, useRef } from "react";
import { Box, Container, VStack, Text, Button, Flex } from "@chakra-ui/react";
import { ChatMessage } from "./ChatMessage.tsx";
import { ChatInput } from "./ChatInput.tsx";
import { BoardGameSelect } from "./BoardGameSelect.tsx";
import { theme } from "../theme/index.ts";
import { useAuth0 } from '@auth0/auth0-react';
import { FiLogOut } from 'react-icons/fi';
import { useFetchWithAuth } from "../utils/fetchWithAuth.ts";
import { withError } from "../utils/withError.ts";
import { ThinkingPlaceholder } from "./ThinkingPlaceholder.tsx";

declare global {
	interface Window {
		activeEventSource: EventSource | null;
	}
}

interface Message {
	content: string;
	role: "user" | "assistant";
}

const ChatInterface = () => {
	const [knownBoardGames, setKnownBoardGames] = useState<string[]>([]);
	const [selectedBoardGame, setSelectedBoardGame] = useState<string>("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isThinking, setIsThinking] = useState(false);
	const { logout } = useAuth0();
	const fetchWithAuth = useFetchWithAuth();
	
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		handleGetKnownBoardGames();
	}, []);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleGetKnownBoardGames = async () => {
		try {
			const response = await withError(() => fetchWithAuth(
				"/known-board-games",
				{ method: "GET" }
			));
			const knownBoardGames = await response.json();
			setKnownBoardGames(knownBoardGames);
		} catch (error) {
			setMessages((prev) => [...prev, { content: "Failed to load known board games: " + error.message, role: "assistant" }]);
		}	
	};

	const handleGetSelectedBoardGame = async () => {
		try {
			const response = await withError(() => fetchWithAuth(
				"/selected-board-game",
				{ method: "GET" }
			));
			const selectedBoardGame = await response.json();
			setSelectedBoardGame(selectedBoardGame);
		} catch (error) {
			setMessages((prev) => [...prev, { content: "Failed to load selected board game: " + error.message, role: "assistant" }]);
		}
	};

	const handleSelectBoardGame = async (boardGame: string) => {
		setIsLoading(true);
		try {
			const response = await withError(() => fetchWithAuth(
				"/set-selected-board-game",
				{ method: "POST", body: JSON.stringify({ selected_board_game: boardGame }) },
			));
			const data = await response.json();

			if (data.success) {
				setSelectedBoardGame(boardGame);
				const response = await withError(() => fetchWithAuth(
					`/chat-history`,
					{ method: "GET" }
				));
				const data = await response.json();
				setMessages(data);
			}
		} catch (error) {
			setMessages((prev) => [
				...prev,
				{
					content: "Failed to switch board game. Please try again: " + error.message,
					role: "assistant",
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSendMessage = async (message: string) => {
		setIsLoading(true);
		setIsThinking(true);
		setMessages((prev) => [
			...prev,
			{ content: message, role: "user" },
			{ content: "", role: "assistant" },
		]);

		try {
			const response = await withError(() => fetchWithAuth(
				`/ask-question`, 
				{ method: "POST", body: JSON.stringify({ question: message }) }
			));

			if (!selectedBoardGame) {
				handleGetSelectedBoardGame();
			}

			const reader = response.body?.getReader();
			if (!reader) {
				throw new Error('No reader available');
			}

			const decoder = new TextDecoder();
			let hasStartedStreaming = false;

			while (true) {
				const { done, value } = await reader.read();

				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split('\n');
				const dataStart = "data: ";

				for (const line of lines) {
					if (line.startsWith(dataStart)) {
						const data = JSON.parse(line.slice(dataStart.length));

						if (data.chunk) {
							if (!hasStartedStreaming) {
								hasStartedStreaming = true;
								setIsThinking(false);
							}
							setMessages((prev) => [
								...prev.slice(0, -1),
								{ 
									content: prev.at(-1)?.content + data.chunk,
									role: "assistant"
								}
							]);
						}
						else if (data.done) {
							setIsLoading(false);
						}
					}
				}
			}
		} catch (error) {
			// TODO: add better error handling
			setMessages((prev) => {
				const newMessages = [...prev];
				if (newMessages[newMessages.length - 1].role === "assistant" && 
					newMessages[newMessages.length - 1].content === "") {
					newMessages[newMessages.length - 1].content = "Sorry, I'm having trouble connecting to the server.";
				} 
				else {
					newMessages.push({ content: "Sorry, I'm having trouble connecting to the server.", role: "assistant" });
				}
				return newMessages;
			});
		} finally {
			setIsLoading(false);
			setIsThinking(false);
		}
	};

	return (
		<Flex direction="column" h="100vh">
			<Box
				position="fixed"
				top={0}
				left={0}
				right={0}
				h="4rem"
				bgGradient="linear(to bottom, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0) 100%)"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				px={5}
				zIndex={1}
			>
				<Text bgGradient={theme.gradients.purpleToRed} bgClip="text" fontSize="4xl" fontWeight="extrabold">
					BGChat
				</Text>
				<Box>
					<BoardGameSelect
						selectedBoardGame={selectedBoardGame}
						knownBoardGames={knownBoardGames}
						onSelectBoardGame={handleSelectBoardGame}
					/>
				</Box>
			</Box>

			<Container maxW="48rem" flex="1" display="flex" mt="4rem">
				<VStack flex="1" overflowY="auto" spacing={4} w="100%" pb="5.5rem">
					{messages.map((message, index) => (
						<ChatMessage 
							key={index} 
							content={message.content} 
							role={message.role}
						/>
					))}
					{isThinking && <ThinkingPlaceholder />}
					<div ref={messagesEndRef} />
				</VStack>
			</Container>

			<Box position="relative" p={4}>
				<Container maxW="48rem" position="fixed" bottom="1rem" left="50%" transform="translateX(-50%)">
					<ChatInput
						inputValue={inputValue}
						isLoading={isLoading}
						selectedBoardGame={selectedBoardGame}
						setInputValue={setInputValue}
						setIsLoading={setIsLoading}
						onMessageSend={handleSendMessage}
					/>
				</Container>

				<Button
					leftIcon={<FiLogOut />}
					onClick={() => logout({logoutParams:{ returnTo: window.location.origin }})}
					position="absolute"
					bottom="100%"
					left={4}
					mb={2}
					size="sm"
					variant="ghost"
				>
					Logout
				</Button>
			</Box>
		</Flex>
	);
};

export default ChatInterface;
