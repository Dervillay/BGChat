import React, { FC, ChangeEvent, KeyboardEvent } from "react";
import { Input, InputGroup, InputRightElement, IconButton, Spinner, Flex } from "@chakra-ui/react";
import { FaArrowUp } from "react-icons/fa";
import { BoardGameSelect } from "./BoardGameSelect.tsx";

interface ChatInputProps {
	inputValue: string;
	isLoading: boolean;
	selectedBoardGame: string;
	setInputValue: (value: string) => void;
	onMessageSend: (message: string) => void;
	knownBoardGames: string[];
	onSelectBoardGame: (selectedBoardGame: string) => void;
}

export const ChatInput: FC<ChatInputProps> = ({
	inputValue,
	isLoading,
	knownBoardGames,
	selectedBoardGame,
	setInputValue,
	onMessageSend,
	onSelectBoardGame,
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

	return (
		<InputGroup>
			<Input
				as="textarea"
				value={inputValue}
				onChange={handleChange}
				onKeyDown={handleKeyPress}
				placeholder={`Ask about the rules for ${selectedBoardGame || "any board game"}`}
				disabled={isLoading}
				pt="1rem"
				pl="1rem"
				pr="8rem"
				pb="1rem"
				variant="chat"
				minH="6rem"
			/>
			<InputRightElement h="100%" position="absolute">
				<Flex align="center" gap={2} position="absolute" minWidth="15rem" bottom="1rem" right="1rem" justify="flex-end">
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
						variant="send"
					/>
				</Flex>
			</InputRightElement>
		</InputGroup>
	);
};
