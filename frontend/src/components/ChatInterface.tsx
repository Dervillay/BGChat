import React, { useState, useEffect } from "react";
import { Box, Container, VStack } from "@chakra-ui/react";
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

	const handleGetKnownBoardGames = async () => {
		if (knownBoardGames.length) return;

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

	useEffect(() => {
		handleGetKnownBoardGames();
	}, []);

	const handleSelectBoardGame = async (e) => {
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
			<Box position="fixed" top="1rem" right="1rem" zIndex={1}>
				<BoardGameSelect
					selectedBoardGame={selectedBoardGame}
					knownBoardGames={knownBoardGames}
					onSelectBoardGame={handleSelectBoardGame}
				/>
			</Box>

			<Container flex="1" display="flex">
				<VStack flex="1" overflowY="auto" spacing={2}>
					{messages.map((message, index) => (
						<ChatMessage key={index} message={message.text} isUser={message.isUser} />
					))}
				</VStack>
			</Container>

			<ChatInput
				inputValue={inputValue}
				isLoading={isLoading}
				selectedBoardGame={selectedBoardGame}
				setInputValue={setInputValue}
				setIsLoading={setIsLoading}
				onMessageSend={handleMessageSend}
			/>
		</Box>
	);
};

export default ChatInterface;
