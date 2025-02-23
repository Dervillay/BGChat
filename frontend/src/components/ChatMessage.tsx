import React from "react";
import ReactMarkdown from "react-markdown";
import { Text, Box, Container, Flex } from "@chakra-ui/react";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { ShimmeringLink } from "./ShimmeringLink.tsx";

interface ChatMessageProps {
	content: string;
	role: "user" | "assistant";
}

interface Citation {
	rulebook_name: string;
	page_num: number;
	link: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ content, role }) => {
	const markdown = {
		p: (props: { children: React.ReactNode }) => (
			<Text my={role === "assistant" ? 3 : 0} lineHeight={1.7}>
				{props.children}
			</Text>
		),
		a: (props: { href?: string; children: React.ReactNode }) => (
			<ShimmeringLink href={props.href}>{props.children}</ShimmeringLink>
		),
	};

	const processMarkdown = (text: string) => {
		if (role === "user") return text;

		const citationPattern = /{[^}]*"link":[^}]*}/g;
		const citations = text.match(citationPattern) || [];
		const parts = text.split(citationPattern);

		let processedText = parts.reduce((acc, part, index) => {
			const citation = citations[index - 1];
			if (citation) {
				const citationObj: Citation = JSON.parse(citation);
				const displayText = `${citationObj.rulebook_name}, Page ${citationObj.page_num}`;
				const link = `${process.env.REACT_APP_BACKEND_URL}/pdfs/${citationObj.link}`;
				return acc + `[${displayText}](${link})` + part;
			}
			return acc + part;
		}, "");

		return processedText;
	};

	return (
		<Container maxW="48rem">
			<Flex justifyContent={role === "user" ? "flex-end" : "flex-start"}>
				{role === "user" ? (
					<Box maxW="70%" bg="gray.800" color="white" px={5} py={2.5} borderRadius="1.5rem">
						<ReactMarkdown components={ChakraUIRenderer(markdown)}>{content}</ReactMarkdown>
					</Box>
				) : (
					<Box maxW="100%">
						<ReactMarkdown components={ChakraUIRenderer(markdown)}>
							{processMarkdown(content)}
						</ReactMarkdown>
					</Box>
				)}
			</Flex>
		</Container>
	);
};
