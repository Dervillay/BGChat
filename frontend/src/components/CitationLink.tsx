import React, { useEffect, useRef } from "react";
import { Link } from "@chakra-ui/react";
import { theme } from "../theme/index.ts";
import { usePDFViewer } from "../contexts/PDFViewerContext.tsx";

interface CitationLinkProps {
	href?: string;
	text?: string;
	children: React.ReactNode;
}

export const CitationLink: React.FC<CitationLinkProps> = ({ href, text, children }) => {
	const linkRef = useRef<HTMLAnchorElement>(null);
	const { openViewer } = usePDFViewer();
	const title = text?.split(",").at(0);
	const pageMatch = href?.match(/#page=(\d+)$/);
	const pageNumber = pageMatch ? pageMatch[1] : undefined;
	const isExternalLink = !href?.includes('/pdfs/')

	useEffect(() => {
		const link = linkRef.current;
		if (!link) return;

		const handleMouseMove = (e: MouseEvent) => {
			const rect = link.getBoundingClientRect();
			const x = ((e.clientX - rect.left) / rect.width) * 50;
			const y = ((e.clientY - rect.top) / rect.height) * 100;

			requestAnimationFrame(() => {
				link.style.backgroundImage = theme.gradients.cosmic;
				link.style.backgroundPosition = `${x}% ${y}%`;
			});
		};

		const handleMouseLeave = () => {
			requestAnimationFrame(() => {
				link.style.backgroundPosition = "30% 80%";
			});
		};

		link.addEventListener("mousemove", handleMouseMove);
		link.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			link.removeEventListener("mousemove", handleMouseMove);
			link.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, []);

	const handleOnClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (!isExternalLink && href) {
			e.preventDefault();
			openViewer(href, title ?? "Rulebook", pageNumber);
		}
	};

	return (
		<Link 
			ref={linkRef} 
			href={href} 
			onClick={handleOnClick} 
			isExternal={isExternalLink}
			target={isExternalLink ? "_blank" : undefined}
			rel={isExternalLink ? "noopener noreferrer" : undefined}
			variant="citationLink"
			aria-label={isExternalLink ? `Open webpage in new tab` : `Open ${title ?? 'rulebook'} in viewer`}
		>
			{children} ↗
		</Link>
	);
};
