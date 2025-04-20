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
		blockquote: (props: { children: React.ReactNode }) => (
			<Box 
				bg="white" 
				p={4} 
				borderRadius="md"
				position="relative"
				pl={6}
				_before={{
					content: '""',
					position: "absolute",
					left: 0,
					top: 0,
					bottom: 0,
					width: "3px",
					background: "linear-gradient(to bottom, #7928CA, #FF0080)",
				}}
			>
				{props.children}
			</Box>
		),
	};

	const processMarkdown = (text: string) => {
		if (role === "user") return text;

		const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
		
		const processedText = text.replace(markdownLinkRegex, (match, displayText, link) => {
			return `[${displayText}](${process.env.REACT_APP_BACKEND_URL}/pdfs/${link})`;
		});

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
