import React, { useState, useEffect } from "react";
import { Box, Container, VStack, Text } from "@chakra-ui/react";
import { ChatMessage } from "./ChatMessage.tsx";
import { ChatInput } from "./ChatInput.tsx";
import { BoardGameSelect } from "./BoardGameSelect.tsx";

interface MessageData {
	text: string;
	isUser: boolean;
}

const ChatInterface = () => {
	const [knownBoardGames, setKnownBoardGames] = useState<string[]>([]);
	const [selectedBoardGame, setSelectedBoardGame] = useState<string>("");
	const [messages, setMessages] = useState<MessageData[]>([]);
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
			setMessages((prev) => [...prev, { text: "Failed to load known board games", isUser: false }]);
		}
	};

	const handleGetSelectedBoardGame = async () => {
		try {
			const response = await fetch("/api/selected-board-game", { method: "GET" });
			const data = await response.json();
			setSelectedBoardGame(data.response);
		} catch {
			setMessages((prev) => [...prev, { text: "Failed to load selected board game", isUser: false }]);
		}
	};

	const handleSelectBoardGame = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		const game = e.target.value;
		try {
			const response = await fetch("/api/set-selected-board-game", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ selected_board_game: game }),
			});
			const data = await response.json();

			if (data.success) {
				setSelectedBoardGame(game);
			}
		} catch {
			setMessages((prev) => [...prev, { text: "Failed to select board game", isUser: false }]);
		}
	};

	const handleMessageSend = async (message: string) => {
		setMessages((prev) => [...prev, { text: message, isUser: true }]);

		try {
			const response = await fetch("/api/ask-question", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message }),
			});
			const data = await response.json();

			if (!selectedBoardGame) {
				await handleGetSelectedBoardGame();
			}
			setMessages((prev) => [...prev, { text: data.response, isUser: false }]);
		} catch {
			setMessages((prev) => [
				...prev,
				{ text: "Sorry, I'm having trouble connecting to the server.", isUser: false },
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
						<ChatMessage key={index} message={message.text} isUser={message.isUser} />
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
					onMessageSend={handleMessageSend}
				/>
			</Container>
		</Box>
	);
};

export default ChatInterface;
