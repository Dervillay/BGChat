import React from "react";
import ReactMarkdown from "react-markdown";
import { Text, Box, Container, Flex, Circle, Link } from "@chakra-ui/react";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";

interface ChatMessageProps {
	content: string;
	role: "user" | "assistant";
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ content, role }) => {
	const renderTextWithCitations = (text: string) => {
		if (role === "user") return text;

		const urlPattern = /(file:\/\/\/(?:[^"\s<>]*[^"\s<>.])?)/g;
		const urls: string[] = text.match(urlPattern) || [];
		const parts: string[] = text.split(urlPattern);

		return parts.map((part, index) => {
			if (urls.includes(part)) {
				return (
					<Link key={index} href={part} isExternal display="inline-flex" alignItems="center" mx="1">
						<Circle
							size="20px"
							fontSize="xs"
							bg="blackAlpha.900"
							color="white"
							_hover={{ bg: "blackAlpha.700" }}
						>
							{urls.indexOf(part) + 1}
						</Circle>
					</Link>
				);
			}
			return part;
		});
	};

	const markdown = {
		p: () => {
			return (
				<Text my={role === "assistant" ? 3 : 0} lineHeight={1.7}>
					{renderTextWithCitations(content)}
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
