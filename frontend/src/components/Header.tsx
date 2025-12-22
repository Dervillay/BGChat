import React from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { DarkModeToggle } from "./DarkModeToggle.tsx";
import { UserProfileMenu } from "./UserProfileMenu.tsx";
import { useCurrentGradient } from "../hooks/useCurrentGradient.ts";

interface HeaderProps {
	onOpenFeedbackModal: () => void;
	isUsingMobile: boolean | undefined;
	onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFeedbackModal, isUsingMobile, onLogoClick }) => {
	const currentGradient = useCurrentGradient();
	
	return (
		<Box
			position="fixed"
			top={0}
			left={0}
			right={0}
			transform="none"
			h={{ base: "3.5rem", md: "4rem" }}
			bgGradient={`linear(to bottom, var(--chakra-colors-chakra-body-bg) 50%, transparent 100%)`}
			display="flex"
			alignItems="center"
			justifyContent="space-between"
			px={{ base: 3, md: 5 }}
			zIndex={10}
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				transform: 'none'
			}}
			sx={{
				// Mobile-specific header handling
				"@media (max-width: 768px)": {
					height: "3.5rem",
					minHeight: "3.5rem",
					maxHeight: "3.5rem",
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					// Ensure header stays visible when keyboard appears
					"&:focus-within": {
						height: "3.5rem",
						minHeight: "3.5rem",
						maxHeight: "3.5rem"
					}
				}
			}}
		>
		<Text 
			bgGradient={currentGradient} 
			bgClip="text" 
			fontSize={{ base: "2xl", md: "3xl" }} 
			fontWeight="regular"
			cursor="pointer"
			onClick={onLogoClick}
			_hover={{
				opacity: 0.8,
			}}
			transition="opacity 0.2s"
		>
			BGChat
		</Text>
			<Flex align="center" gap={2}>
				<DarkModeToggle />
				<UserProfileMenu 
					onOpenFeedbackModal={onOpenFeedbackModal}
					isUsingMobile={isUsingMobile}
				/>
			</Flex>
		</Box>
	);
};
