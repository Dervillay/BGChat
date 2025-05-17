import React, { useEffect, useRef, useState } from "react";
import { Link } from "@chakra-ui/react";
import { theme } from "../theme/index.ts";
import { useFetchWithAuth } from "../utils/fetchWithAuth.ts";
import { withError } from "../utils/withError.ts";
import { PDFViewerModal } from "./PDFViewerModal.tsx";

interface RulebookLinkProps {
	href?: string;
	children: React.ReactNode;
}

export const RulebookLink: React.FC<RulebookLinkProps> = ({ href, children }) => {
	const fetchWithAuth = useFetchWithAuth();
	const linkRef = useRef<HTMLAnchorElement>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);
	const [pageNumber, setPageNumber] = useState<string | undefined>();

	const handleOnClick = async (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
		e.preventDefault();
		try {
			const pageMatch = href.match(/#page=(\d+)$/);
			const page = pageMatch ? pageMatch[1] : undefined;
			setPageNumber(page);

			const response = await withError(() => fetchWithAuth(href));
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			setPdfUrl(url);
			setIsModalOpen(true);
		} catch (error) {
			// TODO: add better error handling
			console.error('Error fetching PDF:', error);
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		if (pdfUrl) {
			window.URL.revokeObjectURL(pdfUrl);
			setPdfUrl(null);
		}
		setPageNumber(undefined);
	};

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

	return (
		<>
			<Link ref={linkRef} href={href} onClick={(e) => href && handleOnClick(e, href)} isExternal variant="rulebookLink">
				{children} ↗
			</Link>
			{pdfUrl && (
				<PDFViewerModal
					isOpen={isModalOpen}
					onClose={handleCloseModal}
					pdfUrl={pdfUrl}
					pageNumber={pageNumber}
				/>
			)}
		</>
	);
};
