import { useState, useEffect, useRef } from "react";
import { Box, Container, VStack, Text, Flex, IconButton, Tooltip } from "@chakra-ui/react";
import { AssistantMessage } from "./AssistantMessage.tsx";
import { ChatInput } from "./ChatInput.tsx";
import { ThinkingPlaceholder } from "./ThinkingPlaceholder.tsx";
import { ErrorMessage } from "./ErrorMessage.tsx";
import { DarkModeToggle } from "./DarkModeToggle.tsx";
import { theme } from "../theme/index.ts";
import { FiRefreshCw } from 'react-icons/fi';
import { useFetchWithAuth } from "../utils/fetchWithAuth.ts";
import { withError } from "../utils/withError.ts";
import { UserMessage } from "./UserMessage.tsx";
import { UserProfileMenu } from "./UserProfileMenu.tsx";
import { MessageQueue } from "../utils/messageQueue.ts";
import { Message } from "../types/message";

declare global {
	interface Window {
		activeEventSource: EventSource | null;
	}
}

const ChatInterface = () => {
	const [knownBoardGames, setKnownBoardGames] = useState<string[]>([]);
	const [selectedBoardGame, setSelectedBoardGame] = useState<string>("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isThinking, setIsThinking] = useState(false);
	const [hasInteracted, setHasInteracted] = useState(false);

	const fetchWithAuth = useFetchWithAuth();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messageQueue = new MessageQueue((message) => {
		setMessages(prev => [...prev, message]);
	});

	useEffect(() => {
		handleGetKnownBoardGames();
	}, []);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleGetKnownBoardGames = async () => {
		try {
			const response = await withError(() => fetchWithAuth(
				`${process.env.REACT_APP_BACKEND_URL}/known-board-games`,
				{ method: "GET" }
			));
			const knownBoardGames = await response.json();
			setKnownBoardGames(knownBoardGames);
		} catch (error: any) {
			messageQueue.push({ content: "Failed to load known board games: " + error.message, role: "error" });
		}	
	};

	const handleSelectBoardGame = async (boardGame: string) => {
		setHasInteracted(true);
		setIsLoading(true);
		try {
			const response = await withError(() => fetchWithAuth(
				`${process.env.REACT_APP_BACKEND_URL}/message-history`,
				{ method: "POST", body: JSON.stringify({ board_game: boardGame }) }
			));
			const data = await response.json();
			setMessages(data);
			setSelectedBoardGame(boardGame);
		} catch (error: any) {
			messageQueue.push({ content: "Failed to switch board game. Please try again: " + error.message, role: "error" });
		}
		setIsLoading(false);
	};

	const handleEditMessage = async (index: number, newContent: string) => {
		try {
			await withError(() => fetchWithAuth(
				`${process.env.REACT_APP_BACKEND_URL}/delete-messages-from-index`,
				{ 
					method: "POST",
					body: JSON.stringify({
						board_game: selectedBoardGame,
						index: index
					})
				}
			));
			setMessages((prev) => prev.slice(0, index));
		} catch (error: any) {
			messageQueue.push({ content: "Failed to edit message: " + error.message, role: "error" });
		}

		await handleSendMessage(newContent);
	};

	const handleDetermineBoardGame = async (message: string) => {
		const response = await withError(() => fetchWithAuth(
			`${process.env.REACT_APP_BACKEND_URL}/determine-board-game`, 
			{
				method: "POST",
				body: JSON.stringify({ question: message })
			}
		));
		const boardGame = await response.json();

		if (knownBoardGames.includes(boardGame)) {
			setSelectedBoardGame(boardGame);
			return boardGame;
		}

		const errorMessage = `Sorry, I'm unable to determine which board game your question refers to.
							Please ask another question, or manually select a board game from the dropdown instead.`;
		const chunks = errorMessage.match(/.{1,4}/g) || []; // Split into chunks of 4 characters
		setIsThinking(false);
		
		// Emulate streaming behaviour for visual consistency
		for (const chunk of chunks) {
			await new Promise(resolve => setTimeout(resolve, 50));
			setMessages((prev) => [
				...prev.slice(0, -1),
				{ 
					content: prev.at(-1)?.content + chunk,
					role: "assistant"
				}
			]);
		}
		return "";
	}

	const handleSendMessage = async (message: string) => {
		setHasInteracted(true);
		setIsLoading(true);
		setIsThinking(true);
		setMessages((prev) => [
			...prev,
			{ content: message, role: "user" },
			{ content: "", role: "assistant" }
		]);

		try {
			let boardGame = selectedBoardGame;
			
			if (!boardGame) {
				boardGame = await handleDetermineBoardGame(message);

				if (!boardGame) {
					return;
				}
			}

			const response = await withError(() => fetchWithAuth(
				`${process.env.REACT_APP_BACKEND_URL}/ask-question`, 
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
			let currentContent = "";

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
							currentContent += data.chunk;
							setMessages((prev) => [
								...prev.slice(0, -1),
								{ 
									content: currentContent,
									role: "assistant"
								}
							]);
						}
						else if (data.done) {
							setIsLoading(false);
						}
						else if (data.error) {
							messageQueue.push({ content: data.error, role: "error" });
						}
					}
				}
			}
		} catch (error: any) {
			messageQueue.push({ content: error.message, role: "error" });
		} finally {
			setIsThinking(false);
			setIsLoading(false);
		}
	};

	const handleClearChat = async () => {
		try {
			if (selectedBoardGame) {
				await withError(() => fetchWithAuth(
					`${process.env.REACT_APP_BACKEND_URL}/clear-message-history`,
					{ 
						method: "POST",
						body: JSON.stringify({ board_game: selectedBoardGame })
					}
				));
			}
			setMessages([]);
		} catch (error: any) {
			messageQueue.push({ content: "Failed to clear chat: " + error.message, role: "error" });
		}
	};

	const handleCloseError = (index: number) => {
		setMessages(prev => prev.filter((_, i) => i !== index));
	};

	return (
		<Container h="100dvh" display="flex" flexDirection="column" overflow="hidden">
			{!hasInteracted ? (
				// Centered layout
				<Flex 
					direction="column" 
					justify="center" 
					align="center"
					gap={2}
					h="100dvh"
				>
					<Text 
						bgGradient={theme.gradients.cosmic} 
						bgClip="text" 
						fontSize={{ base: "5xl", md: "7xl" }} 
						fontWeight="regular"
						textAlign="center"
					>
						BGChat
					</Text>
					<ChatInput
						inputValue={inputValue}
						isLoading={isLoading}
						selectedBoardGame={selectedBoardGame}
						setInputValue={setInputValue}
						onMessageSend={handleSendMessage}
						knownBoardGames={knownBoardGames}
						onSelectBoardGame={handleSelectBoardGame}
						variant="default"
					/>
				</Flex>
			) : (
				// Normal layout with fixed header and input
				<>
					{/* Fixed top bar */}
					<Box
						position="fixed"
						top={0}
						left={0}
						right={0}
						transform="none"
						h={{ base: "3.5rem", md: "4rem" }}
						bgGradient={`linear(to bottom, var(--chakra-colors-chakra-body-bg) 50%, transparent 100%)`}
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						px={{ base: 3, md: 5 }}
						zIndex={1}
					>
						<Text 
							bgGradient={theme.gradients.cosmic} 
							bgClip="text" 
							fontSize={{ base: "2xl", md: "3xl" }} 
							fontWeight="regular"
						>
							BGChat
						</Text>
						<Flex align="center" gap={2}>
							<DarkModeToggle />
							<UserProfileMenu />
						</Flex>
					</Box>

					{/* Scrollable messages area between header and input */}
					<Box
						position="fixed"
						pt={{ base: "3.5rem", md: "4rem" }}
						top={0}
						bottom={{ base: "6rem", md: "6.5rem" }}
						left={0}
						right={0}
						overflowY="auto"
						css={{
							'&::-webkit-scrollbar': {
								display: 'none'
							},
							scrollbarWidth: 'none',
							msOverflowStyle: 'none'
						}}
					>
						<Container maxW="48rem" mx="auto" px={{ base: 2, md: 4 }} py={4}>
							<VStack w="100%" spacing={4}>
								{messages.map((message, index) => (
									message.role === "user" ? (
										<UserMessage
											key={index}
											content={message.content}
											onEdit={(newContent) => handleEditMessage(index, newContent)}
										/>
									) : message.role === "assistant" ? (
										<AssistantMessage 
											key={index}
											content={message.content}
										/>
									) : (
										<ErrorMessage 
											key={index}
											content={message.content} 
											onClose={() => handleCloseError(index)} 
										/>
									)
								))}
								{isThinking && <ThinkingPlaceholder />}
								{messages.length >= 2 && !isLoading && messages.some(msg => msg.role === "user") && (
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
												_dark={{
													color: "#a0a0a0",
													_hover: { 
														color: "#e0e0e0",
														filter: "brightness(1.3)"
													}
												}}
												aria-label="Reset chat"
											/>
										</Tooltip>
									</Flex>
								)}
								<div ref={messagesEndRef} />
							</VStack>
						</Container>
					</Box>

					{/* Fixed bottom ChatInput */}
					<Box 
						position="fixed" 
						bottom={0}
						left={0}
						right={0}
						zIndex={1}
						p={{ base: 0, md: 4 }}
					>
						<ChatInput
							inputValue={inputValue}
							isLoading={isLoading}
							selectedBoardGame={selectedBoardGame}
							setInputValue={setInputValue}
							onMessageSend={handleSendMessage}
							knownBoardGames={knownBoardGames}
							onSelectBoardGame={handleSelectBoardGame}
							variant="bottomFixed"
						/>
					</Box>
				</>
			)}
		</Container>
	);
};

export default ChatInterface;
