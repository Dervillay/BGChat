import React, { useState, useEffect } from "react";
import { Box, Container, VStack, Text } from "@chakra-ui/react";
import { ChatMessage } from "./ChatMessage.tsx";
import { ChatInput } from "./ChatInput.tsx";
import { BoardGameSelect } from "./BoardGameSelect.tsx";

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

	useEffect(() => {
		handleGetKnownBoardGames();
	}, []);

	const handleGetKnownBoardGames = async () => {
		try {
			const response = await fetch("/api/known-board-games", { method: "GET" });
			const data = await response.json();
			setKnownBoardGames(data.response);
		} catch {
			setMessages((prev) => [...prev, { content: "Failed to load known board games", role: "assistant" }]);
		}
	};

	const handleGetSelectedBoardGame = async () => {
		try {
			const response = await fetch("/api/selected-board-game", { method: "GET" });
			const data = await response.json();
			setSelectedBoardGame(data.response);
		} catch {
			setMessages((prev) => [...prev, { content: "Failed to load selected board game", role: "assistant" }]);
		}
	};

	const handleSelectBoardGame = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		const game = e.target.value;
		setIsLoading(true);
		try {
			// First, set the selected game
			const response = await fetch("/api/set-selected-board-game", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ selected_board_game: game }),
			});
			const data = await response.json();

			if (data.success) {
				setSelectedBoardGame(game);

				const response = await fetch(`/api/chat-history`, {
					method: "GET",
				});
				const data = await response.json();
				setMessages(data.response);
			}
		} catch (error) {
			setMessages((prev) => [
				...prev,
				{
					content: "Failed to switch board game. Please try again.",
					role: "assistant",
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSendMessage = async (message: string) => {
		setMessages((prev) => [...prev, { content: message, role: "user" }]);

		try {
			const response = await fetch("/api/ask-question", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ question: message }),
			});
			const data = await response.json();

			if (!selectedBoardGame) {
				await handleGetSelectedBoardGame();
			}

			setMessages((prev) => [...prev, { content: data.response, role: "assistant" }]);
		} catch {
			setMessages((prev) => [
				...prev,
				{ content: "Sorry, I'm having trouble connecting to the server.", role: "assistant" },
			]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Box h="100vh" display="flex" flexDirection="column">
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
				<Text bgGradient="linear(to-l, #7928CA, #FF0080)" bgClip="text" fontSize="4xl" fontWeight="extrabold">
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

			<Container flex="1" display="flex" mt="4rem">
				<VStack flex="1" overflowY="auto" spacing={2}>
					{messages.map((message, index) => (
						<ChatMessage key={index} content={message.content} role={message.role} />
					))}
				</VStack>
			</Container>

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
		</Box>
	);
};

export default ChatInterface;
