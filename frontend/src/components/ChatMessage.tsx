import React from "react";
import ReactMarkdown from "react-markdown";
import { Box, Container, Flex } from "@chakra-ui/react";

interface ChatMessageProps {
	content: string;
	role: "user" | "assistant";
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ content, role }) => {
	return (
		<Container maxW="48rem">
			<Flex justifyContent={role === "user" ? "flex-end" : "flex-start"}>
				<Box
					maxW={role === "user" ? "70%" : "100%"}
					bg={role === "user" ? "gray.800" : "gray.100"}
					color={role === "user" ? "white" : "black"}
					px={5}
					py={2.5}
					borderRadius="1.5rem"
				>
					<ReactMarkdown>{content}</ReactMarkdown>
				</Box>
			</Flex>
		</Container>
	);
};
