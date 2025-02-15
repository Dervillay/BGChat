import React, { FC, ChangeEvent, KeyboardEvent } from "react";
import { Input, InputGroup, InputRightElement, IconButton, Spinner, Container } from "@chakra-ui/react";
import { FaArrowUp } from "react-icons/fa";

interface ChatInputProps {
	inputValue: string;
	isLoading: boolean;
	selectedBoardGame: string;
	setInputValue: (value: string) => void;
	setIsLoading: (loading: boolean) => void;
	onMessageSend: (message: string) => void;
}

export const ChatInput: FC<ChatInputProps> = ({
	inputValue,
	isLoading,
	selectedBoardGame,
	setInputValue,
	setIsLoading,
	onMessageSend,
}) => {
	const handleSend = async () => {
		const message = inputValue.trim();

		if (!message) return;

		setInputValue("");
		setIsLoading(true);
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
		<Container maxW="48rem" position="fixed" bottom="1rem" left="50%" transform="translateX(-50%)">
			<InputGroup>
				<Input
					as="textarea"
					value={inputValue}
					onChange={handleChange}
					onKeyDown={handleKeyPress}
					placeholder={`Ask about the rules for ${selectedBoardGame || "a board game"}`}
					disabled={isLoading}
					pt="1rem"
					pl="1rem"
					pr="3.5rem"
					pb="1rem"
					variant="chat"
				/>
				<InputRightElement h="100%" position="absolute">
					<IconButton
						icon={isLoading ? <Spinner /> : <FaArrowUp />}
						onClick={handleSend}
						disabled={!inputValue.trim() || isLoading}
						aria-label="Send message"
						position="absolute"
						bottom="1rem"
						right="1rem"
						variant="send"
					/>
				</InputRightElement>
			</InputGroup>
		</Container>
	);
};
