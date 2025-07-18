import React from "react";
import ReactMarkdown from "react-markdown";
import { Text, Box, Container, Flex } from "@chakra-ui/react";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { RulebookLink } from "./RulebookLink.tsx";
import { theme } from "../theme/index.ts";

interface AssistantMessageProps {
	content: string;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({ content }) => {
	const markdown = {
		p: (props: { children: React.ReactNode }) => (
			<Text 
				mt={4}
				lineHeight={1.7}
				fontSize={{ base: "sm", md: "md" }}
				_first={{ mt: 0 }}
			>
				{props.children}
			</Text>
		),
		a: (props: { href?: string; children: React.ReactNode }) => (
			<RulebookLink href={props.href} text={props.children?.toString()}>
				{props.children}
			</RulebookLink>
		),
		blockquote: (props: { children: React.ReactNode }) => (
			<Box 
				bg="transparent" 
				mt={4}
				pl={{ base: 3, md: 5 }}
				borderRadius="md"
				position="relative"
				_before={{
					content: '""',
					position: "absolute",
					left: 0,
					top: 0,
					bottom: 0,
					height: "100%",
					width: "3px",
					background: theme.gradients.cosmic,
				}}
			>
				{props.children}
			</Box>
		),
	};

	const processMarkdown = (text: string) => {
		const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
		const processedText = text.replace(markdownLinkRegex, (match, displayText, link) => {
			return `[${displayText}](${process.env.REACT_APP_BACKEND_URL}/pdfs/${link})`;
		});

		return processedText;
	};

	return (
		<Container maxW="48rem" p={0}>
			<Flex justifyContent="flex-start">
				<Box maxW="100%" px={{ base: 2, md: 0 }}>
					<ReactMarkdown components={ChakraUIRenderer(markdown)}>
						{processMarkdown(content)}
					</ReactMarkdown>
				</Box>
			</Flex>
		</Container>
	);
};
