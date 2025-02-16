import React from "react";
import ReactMarkdown from "react-markdown";
import { Text, Box, Container, Flex } from "@chakra-ui/react";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";

interface ChatMessageProps {
	content: string;
	role: "user" | "assistant";
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ content, role }) => {
	const markdown = {
		p: (props) => {
			const { children } = props;
			const isLastParagraph =
				props.node.position.end.offset === props.node.position.start.offset + content.length;
			return (
				<Text my={isLastParagraph ? 0 : 3} lineHeight={1.7}>
					{children}
				</Text>
			);
		},
	};

	return (
		<Container maxW="48rem">
			<Flex justifyContent={role === "user" ? "flex-end" : "flex-start"}>
				{role === "user" ? (
					<Box maxW="70%" bg="gray.800" color="white" px={5} py={2.5} borderRadius="1.5rem">
						<ReactMarkdown components={ChakraUIRenderer(markdown)} skipHtml>
							{content}
						</ReactMarkdown>
					</Box>
				) : (
					<Box maxW="100%">
						<ReactMarkdown components={ChakraUIRenderer(markdown)} skipHtml>
							{content}
						</ReactMarkdown>
					</Box>
				)}
			</Flex>
		</Container>
	);
};
