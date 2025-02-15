import React from "react";
import ReactMarkdown from "react-markdown";
import { Box, Container, Flex } from "@chakra-ui/react";

interface ChatMessageProps {
	message: string;
	isUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser }) => {
	return (
		<Container maxW="48rem">
			<Flex justifyContent={isUser ? "flex-end" : "flex-start"}>
				<Box
					maxW={isUser ? "70%" : "100%"}
					bg={isUser ? "gray.800" : "gray.100"}
					color={isUser ? "white" : "black"}
					px={5}
					py={2.5}
					borderRadius="1.5rem"
				>
					<ReactMarkdown>{message}</ReactMarkdown>
				</Box>
			</Flex>
		</Container>
	);
};
