import React, { FC, ChangeEvent, KeyboardEvent } from "react";
import { Input, InputGroup, InputRightElement, IconButton, Spinner, Container } from "@chakra-ui/react";
import { FaArrowUp } from "react-icons/fa";

interface ChatInputProps {
	value: string;
	isLoading: boolean;
	selectedBoardGame: string;
	onSend: () => void;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

const adjustTextareaHeight = (e: ChangeEvent<HTMLInputElement>) => {
	const textarea = e.target;
	textarea.style.height = "auto";
	textarea.style.height = `${textarea.scrollHeight}px`;
};

export const ChatInput: FC<ChatInputProps> = ({ value, isLoading, selectedBoardGame, onSend, onChange, onKeyDown }) => {
	return (
		<Container maxW="48rem" position="fixed" bottom="1rem" left="50%" transform="translateX(-50%)">
			<InputGroup alignItems="flex-end">
				<Input
					value={value}
					onChange={onChange}
					onKeyDown={onKeyDown}
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
						onClick={onSend}
						bg="black"
						color="white"
						_hover={{ bg: value.trim() ? "blackAlpha.600" : "black" }}
						disabled={!value.trim() || isLoading}
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
