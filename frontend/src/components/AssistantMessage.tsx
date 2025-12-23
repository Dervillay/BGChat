import React from "react";
import ReactMarkdown from "react-markdown";
import { Text, Box, Container, Flex } from "@chakra-ui/react";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { CitationLink } from "./CitationLink.tsx";
import { useCurrentGradient } from "../hooks/useCurrentGradient.ts";

interface AssistantMessageProps {
	content: string;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({ content }) => {
	const currentGradient = useCurrentGradient();
	
	const markdown = {
		p: (props: { children: React.ReactNode }) => (
			<Text 
				mt={4}
				lineHeight={1.7}
				fontSize="md"
				_first={{ mt: 0 }}
			>
				{props.children}
			</Text>
		),
		a: (props: { href?: string; children: React.ReactNode }) => (
			<CitationLink href={props.href} text={props.children?.toString()}>
				{props.children}
			</CitationLink>
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
					background: currentGradient,
				}}
			>
				{props.children}
			</Box>
		),
	};

	const processMarkdown = (text: string) => {
		const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
		const processedText = text.replace(markdownLinkRegex, (match, displayText, link) => {
			if (!link.startsWith("https://")) {
				return `[${displayText}](${process.env.REACT_APP_BACKEND_URL}/pdfs/${link})`;
			}

			// If link isn't using HTTPS, return only the display text
			try {
				const url = new URL(link);
				if (url.protocol !== "https:") {
					return displayText;
				}
			} catch {
				return displayText;
			}

			return `[${displayText}](${link})`;
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
