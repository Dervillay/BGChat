import React, { useEffect, useRef } from "react";
import { Link } from "@chakra-ui/react";
import { theme } from "../theme/index.ts";
import { useFetchWithAuth } from "../utils/fetchWithAuth.ts";
import { withError } from "../utils/withError.ts";

interface ShimmeringLinkProps {
	href?: string;
	children: React.ReactNode;
}

export const ShimmeringLink: React.FC<ShimmeringLinkProps> = ({ href, children }) => {
	const fetchWithAuth = useFetchWithAuth();
	const linkRef = useRef<HTMLAnchorElement>(null);

	const handleOnClick = async (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
		e.preventDefault();

		const response = await withError(() => fetchWithAuth(href));
		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);
		
		window.open(url, '_blank');
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
		<Link ref={linkRef} href={href} onClick={(e) => href && handleOnClick(e, href)} isExternal variant="shimmeringLink">
			{children} ↗
		</Link>
	);
};
