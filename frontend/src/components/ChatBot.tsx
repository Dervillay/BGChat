import React, { useState, useEffect } from "react";
import {
	Box,
	Container,
	InputGroup,
	Input,
	InputRightElement,
	VStack,
	useColorModeValue,
	IconButton,
	Spinner,
	Select,
} from "@chakra-ui/react";
import { FaArrowUp } from "react-icons/fa";
import { Message } from "./Message.tsx";
import { ChatInput } from "./ChatInput.tsx";

interface Message {
	text: string;
	isUser: boolean;
}

const ChatBot = () => {
	const [knownBoardGames, setKnownBoardGames] = useState<string[]>([]);
	const [selectedBoardGame, setSelectedBoardGame] = useState<string>("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
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

	const handleSend = async () => {
		if (!input.trim()) return;

		const userMessage = input.trim();
		setInput("");
		setIsLoading(true);
		setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);

		try {
			const response = await fetch("/api/ask-question", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: userMessage }),
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

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleBoardGameSelect = async (e) => {
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

	const adjustTextareaHeight = (e) => {
		const textarea = e.target;
		textarea.style.height = "auto";
		textarea.style.height = `${textarea.scrollHeight}px`;
	};

	return (
		<Box h="100vh">
			<Box position="fixed" top="1rem" right="1rem" zIndex={1}>
				<Select
					value={selectedBoardGame}
					onChange={handleBoardGameSelect}
					borderRadius="1.5rem"
					placeholder="Select a board game"
					bg={useColorModeValue("white", "gray.800")}
					borderColor={useColorModeValue("gray.200", "gray.600")}
				>
					{knownBoardGames.map((game, index) => (
						<option key={index} value={game}>
							{game}
						</option>
					))}
				</Select>
			</Box>

			<Container>
				<VStack h="calc(100vh - 6.25rem)" overflowY="auto" spacing={2}>
					{messages.map((message, index) => (
						<Message key={index} message={message.text} isUser={message.isUser} />
					))}
				</VStack>
			</Container>

			{/* TODO: Replace this with the ChatInput component */}
			<Container maxW="48rem" position="fixed" bottom="1rem" left="50%" transform="translateX(-50%)">
				<InputGroup alignItems="flex-end">
					<Input
						value={input}
						onChange={(e) => {
							setInput(e.target.value);
							adjustTextareaHeight(e);
						}}
						onKeyDown={handleKeyPress}
						placeholder={`Ask about the rules for ${selectedBoardGame || "a board game"}`}
						disabled={isLoading}
						as="textarea"
						resize="none"
						border="1px solid"
						borderColor="gray.200"
						borderRadius="1.5rem"
						textColor="gray.800"
						boxShadow="0 0.125rem 0.25rem rgba(0, 0, 0, 0.1)"
						verticalAlign="top"
						minH="5rem"
						maxH="15rem"
						h="auto"
						overflowY="auto"
						p="1rem"
						pr="3.5rem"
						_hover={{
							boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.15)",
						}}
						_focus={{
							boxShadow: "0 0.1875rem 0.375rem rgba(0, 0, 0, 0.2)",
							outline: undefined,
							borderColor: "gray.200",
						}}
						position="relative"
					/>
					<InputRightElement h="100%" position="absolute">
						<IconButton
							icon={isLoading ? <Spinner /> : <FaArrowUp />}
							onClick={handleSend}
							bg="black"
							color="white"
							_hover={{ bg: input.trim() ? "blackAlpha.600" : "black" }}
							disabled={!input.trim() || isLoading}
							aria-label="Send message"
							size="sm"
							borderRadius="full"
							position="absolute"
							bottom="1rem"
							right="1rem"
						/>
					</InputRightElement>
				</InputGroup>
			</Container>
		</Box>
	);
};

export default ChatBot;
