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

const adjustTextareaHeight = (e: ChangeEvent<HTMLInputElement>) => {
	const textarea = e.target;
	textarea.style.height = "auto";
	textarea.style.height = `${textarea.scrollHeight}px`;
};

export const ChatInput: FC<ChatInputProps> = ({
	inputValue,
	isLoading,
	selectedBoardGame,
	setInputValue,
	setIsLoading,
	onMessageSend,
}) => {
	const handleSend = async () => {
		if (!inputValue.trim()) return;

		const message = inputValue.trim();
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
		setInputValue(e.target.value);
		adjustTextareaHeight(e);
	};

	return (
		<Container maxW="48rem" position="fixed" bottom="1rem" left="50%" transform="translateX(-50%)">
			<InputGroup>
				<Input
					as="textarea"
					value={inputValue}
					onChange={handleChange}
					onKeyDown={handleKeyPress}
					onInput={adjustTextareaHeight}
					placeholder={`Ask about the rules for ${selectedBoardGame || "a board game"}`}
					disabled={isLoading}
					variant="chat"
					position="relative"
				/>
				<InputRightElement h="100%" position="absolute">
					<IconButton
						icon={isLoading ? <Spinner /> : <FaArrowUp />}
						onClick={handleSend}
						bg="black"
						color="white"
						_hover={{ bg: inputValue.trim() ? "blackAlpha.600" : "black" }}
						disabled={!inputValue.trim() || isLoading}
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
	);
};
