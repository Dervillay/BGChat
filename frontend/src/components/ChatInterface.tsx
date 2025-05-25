import React, { useState, useEffect, useRef } from "react";
import { Box, Container, VStack, Text, Flex, IconButton, Tooltip } from "@chakra-ui/react";
import { AssistantMessage } from "./AssistantMessage.tsx";
import { ChatInput } from "./ChatInput.tsx";
import { ThinkingPlaceholder } from "./ThinkingPlaceholder.tsx";
import { theme } from "../theme/index.ts";
import { FiRefreshCw } from 'react-icons/fi';
import { useFetchWithAuth } from "../utils/fetchWithAuth.ts";
import { withError } from "../utils/withError.ts";
import { UserMessage } from "./UserMessage.tsx";
import { UserProfileMenu } from "./UserProfileMenu.tsx";

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

	const handleSelectBoardGame = async (boardGame: string) => {
		setIsLoading(true);
		try {
			const response = await withError(() => fetchWithAuth(
				"/get-message-history",
				{ method: "POST", body: JSON.stringify({ board_game: boardGame }) }
			));
			const data = await response.json();
			setMessages(data);
			setSelectedBoardGame(boardGame);
		} catch (error) {
			setMessages((prev) => [
				...prev,
				{
					content: "Failed to switch board game. Please try again: " + error.message,
					role: "assistant",
				},
			]);
		}
		setIsLoading(false);
	};

	const handleEditMessage = async (index: number, newContent: string) => {
		try {
			await withError(() => fetchWithAuth(
				"/delete-messages-from-index",
				{ 
					method: "POST",
					body: JSON.stringify({
						board_game: selectedBoardGame,
						index: index
					})
				}
			));
			setMessages((prev) => prev.slice(0, index));
		} catch (error) {
			// TODO: add better error handling
			console.error("Failed to delete messages:", error);
		}

		await handleSendMessage(newContent);
	};

	const handleDetermineBoardGame = async (message: string) => {
		const response = await withError(() => fetchWithAuth(
			"/determine-board-game",
			{ method: "POST", body: JSON.stringify({ question: message }) }
		));
		const boardGame = await response.json();

		if (knownBoardGames.includes(boardGame)) {
			setSelectedBoardGame(boardGame);
			return boardGame;
		}
		else {
			// Mock the streaming behaviour for this
			setMessages((prev) => [
				...prev,
				{ 
					content: `Sorry, I'm unable to determine which board game your question refers to.
						      Please ask another question, or manually select a board game from the dropdown instead.`,
					role: "assistant",
				},
			]);
			return null;
		}
	}

	const handleSendMessage = async (message: string) => {
		setIsLoading(true);
		setIsThinking(true);
		setMessages((prev) => [
			...prev,
			{ content: message, role: "user" },
			{ content: "", role: "assistant" },
		]);

		try {
			let boardGame = selectedBoardGame;
			if (!boardGame) {
				boardGame = await handleDetermineBoardGame(message);

				if (!boardGame) {
					setIsLoading(false);
					setIsThinking(false);
					return;
				}
			}

			const response = await withError(() => fetchWithAuth(
				"/ask-question", 
				{ 
					method: "POST", 
					body: JSON.stringify({ 
						question: message,
						board_game: boardGame
					})
				}
			));

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
			setIsThinking(false);
			setIsLoading(false);
		}
	};

	const handleClearChat = async () => {
		try {
			await withError(() => fetchWithAuth(
				"/clear-message-history",
				{ 
					method: "POST",
					body: JSON.stringify({ board_game: selectedBoardGame })
				}
			));
			setMessages([]);
		} catch (error) {
			// TODO: add better error handling
			console.error("Failed to clear chat:", error);
		}
	};

	return (
		<Container maxW="container.xl" h="100vh" p={4} display="flex" flexDirection="column">
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
					<UserProfileMenu />
				</Box>

				<Container maxW="48rem" flex="1" display="flex" mt="4rem">
					<VStack flex="1" overflowY="auto" w="100%" pb="5.5rem">
						{messages.map((message, index) => (
							message.role === "user" ? (
								<Flex key={index} justifyContent="flex-end" w="100%" role="group">
									<UserMessage
										content={message.content}
										onEdit={(newContent) => handleEditMessage(index, newContent)}
									/>
								</Flex>
							) : (
								<Box key={index} w="100%" position="relative">
									<AssistantMessage 
										content={message.content}
									/>
									{index === messages.length - 1 && !isLoading && messages.length > 0 && (
										<Flex justify="flex-end" w="100%" mt={1}>
											<Tooltip 
												label="Reset chat"
												placement="bottom"
												offset={[0, 0]}
											>
												<IconButton
													icon={<FiRefreshCw />}
													onClick={handleClearChat}
													size="sm"
													variant="ghost"
													color="gray.500"
													_hover={{ color: "gray.700" }}
													aria-label="Reset chat"
												/>
											</Tooltip>
										</Flex>
									)}
								</Box>
								
							)
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
							onMessageSend={handleSendMessage}
							knownBoardGames={knownBoardGames}
							onSelectBoardGame={handleSelectBoardGame}
						/>
					</Container>
				</Box>
			</Flex>
		</Container>
	);
};

export default ChatInterface;
