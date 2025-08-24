import { FC, ChangeEvent, KeyboardEvent } from "react";
import { Input, IconButton, Spinner, Flex, Container } from "@chakra-ui/react";
import { FaArrowUp } from "react-icons/fa";
import { BoardGameSelect } from "./BoardGameSelect.tsx";
import { theme } from "../theme/index.ts";

interface ChatInputProps {
	inputValue: string;
	isLoading: boolean;
	selectedBoardGame: string;
	setInputValue: (value: string) => void;
	onMessageSend: (message: string) => void;
	knownBoardGames: string[];
	onSelectBoardGame: (selectedBoardGame: string) => void;
	variant?: "default" | "bottomFixed";
}

export const ChatInput: FC<ChatInputProps> = ({
	inputValue,
	isLoading,
	knownBoardGames,
	selectedBoardGame,
	setInputValue,
	onMessageSend,
	onSelectBoardGame,
	variant = "default",
}) => {
	const handleSend = async () => {
		const message = inputValue.trim();
		if (!message) return;
		setInputValue("");
		onMessageSend(message);
	};

	const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		e.target.style.height = "auto";
		e.target.style.height = `${e.target.scrollHeight}px`;
		setInputValue(e.target.value);
	};

	const containerStyle = variant === "bottomFixed" 
		? { ...theme.components.ChatInput.baseStyle.container, ...theme.components.ChatInput.variants.bottomFixed.container }
		: theme.components.ChatInput.baseStyle.container;

	return (
		<Container {...containerStyle}>
			<Input
				as="textarea"
				value={inputValue}
				onChange={handleChange}
				onKeyDown={handleKeyPress}
				placeholder={`Ask about the rules for ${selectedBoardGame || "any board game"}`}
				disabled={isLoading}
				{...theme.components.ChatInput.baseStyle.input}
			/>
			<Flex {...theme.components.ChatInput.baseStyle.controls}>
				<BoardGameSelect
					selectedBoardGame={selectedBoardGame}
					knownBoardGames={knownBoardGames}
					onSelectBoardGame={onSelectBoardGame}
				/>
				<IconButton
					icon={isLoading ? <Spinner /> : <FaArrowUp />}
					onClick={handleSend}
					disabled={!inputValue.trim() || isLoading}
					aria-label="Send message"
				/>
			</Flex>
		</Container>
	);
};
