import React, { useEffect, useRef } from "react";
import { Link } from "@chakra-ui/react";
import { theme } from "../theme/index.ts";
import { usePDFViewer } from "../contexts/PDFViewerContext.tsx";

interface RulebookLinkProps {
	href?: string;
	text?: string;
	children: React.ReactNode;
}

export const RulebookLink: React.FC<RulebookLinkProps> = ({ href, text, children }) => {
	const linkRef = useRef<HTMLAnchorElement>(null);
	const { openViewer } = usePDFViewer();
	const title = text?.split(",").at(0);
	const pageMatch = href?.match(/#page=(\d+)$/);
	const pageNumber = pageMatch ? pageMatch[1] : undefined;

	useEffect(() => {
		const link = linkRef.current;
		if (!link) return;

		const handleMouseMove = (e: MouseEvent) => {
			const rect = link.getBoundingClientRect();
			const x = ((e.clientX - rect.left) / rect.width) * 50;
			const y = ((e.clientY - rect.top) / rect.height) * 100;

			requestAnimationFrame(() => {
				link.style.backgroundImage = theme.gradients.purpleToRed;
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
		e.preventDefault();
		if (href) {
			openViewer(href, title ?? "Rulebook", pageNumber);
		}
	};

	return (
		<Link 
			ref={linkRef} 
			href={href} 
			onClick={handleOnClick} 
			isExternal 
			variant="rulebookLink"
			aria-label={`Open ${title ?? 'rulebook'} in viewer`}
		>
			{children} ↗
		</Link>
	);
};
