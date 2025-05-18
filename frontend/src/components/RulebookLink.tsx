import React, { useEffect, useRef, useState } from "react";
import { Link } from "@chakra-ui/react";
import { theme } from "../theme/index.ts";
import { useFetchWithAuth } from "../utils/fetchWithAuth.ts";
import { withError } from "../utils/withError.ts";
import { PDFViewerModal } from "./PDFViewerModal.tsx";

interface RulebookLinkProps {
	href?: string;
	text?: string;
	children: React.ReactNode;
}

export const RulebookLink: React.FC<RulebookLinkProps> = ({ href, text, children }) => {
	const fetchWithAuth = useFetchWithAuth();
	const linkRef = useRef<HTMLAnchorElement>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);
	const [pageNumber, setPageNumber] = useState<string | undefined>();
	const [rulebookTitle, setRulebookTitle] = useState<string | undefined>();

	useEffect(() => {
		const title = text?.split(",").at(0);
		setRulebookTitle(title);
	}, [text]);

	useEffect(() => {
		if (!href) return;

		const pageMatch = href.match(/#page=(\d+)$/);
		const page = pageMatch ? pageMatch[1] : undefined;
		setPageNumber(page);

		handleUpdatePdfUrl(href);
	}, [href]);

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
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
	};

	const handleUpdatePdfUrl = async (href: string) => {
		try {
			const response = await withError(() => fetchWithAuth(href));
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);

			if (pdfUrl) {
				window.URL.revokeObjectURL(pdfUrl);
				setPdfUrl(null);
			}

			setPdfUrl(url);
		} catch (error) {
			// TODO: add better error handling
			console.error('Error fetching PDF:', error);
		}
	};


	return (
		<>
			<Link ref={linkRef} href={href} onClick={(e) => href && handleOnClick(e)} isExternal variant="rulebookLink">
				{children} ↗
			</Link>
			{pdfUrl && (
				<PDFViewerModal
					isOpen={isModalOpen}
					onClose={handleCloseModal}
					pdfUrl={pdfUrl}
					pageNumber={pageNumber}
					title={rulebookTitle ?? "Rulebook"}
				/>
			)}
		</>
	);
};
