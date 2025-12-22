import React from "react";
import { Link } from "@chakra-ui/react";
import { usePDFViewer } from "../contexts/PDFViewerContext.tsx";
import { useCurrentGradient } from "../hooks/useCurrentGradient.ts";

interface CitationLinkProps {
	href?: string;
	text?: string;
	children: React.ReactNode;
}

export const CitationLink: React.FC<CitationLinkProps> = ({ href, text, children }) => {
	const { openViewer } = usePDFViewer();
	const currentGradient = useCurrentGradient();
	const title = text?.split(",").at(0);
	const pageMatch = href?.match(/#page=(\d+)$/);
	const pageNumber = pageMatch ? pageMatch[1] : undefined;
	const isExternalLink = !href?.includes('/pdfs/')

	const handleOnClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (!isExternalLink && href) {
			e.preventDefault();
			openViewer(href, title ?? "Rulebook", pageNumber);
		}
	};

	return (
		<Link 
			href={href} 
			onClick={handleOnClick} 
			isExternal={isExternalLink}
			target={isExternalLink ? "_blank" : undefined}
			rel={isExternalLink ? "noopener noreferrer" : undefined}
			aria-label={isExternalLink ? `Open webpage in new tab` : `Open ${title ?? 'rulebook'} in viewer`}
			fontWeight="semibold"
			backgroundImage={currentGradient}
			backgroundSize="300% 300%"
			backgroundPosition="0% 50%"
			backgroundClip="text"
			transition="all 0.4s ease"
			sx={{
				WebkitBackgroundClip: "text",
				WebkitTextFillColor: "transparent",
			}}
			_hover={{
				backgroundPosition: "100% 50%",
				transform: "translateY(-1px)",
				filter: "brightness(1.1)",
			}}
		>
			{children} ↗
		</Link>
	);
};
