import React from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { DarkModeToggle } from "./DarkModeToggle.tsx";
import { UserProfileMenu } from "./UserProfileMenu.tsx";
import { theme } from "../theme/index.ts";

export const Header: React.FC = () => {
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
			zIndex={9999}
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				transform: 'none'
			}}
		>
			<Text 
				bgGradient={theme.gradients.cosmic} 
				bgClip="text" 
				fontSize={{ base: "2xl", md: "3xl" }} 
				fontWeight="regular"
			>
				BGChat
			</Text>
			<Flex align="center" gap={2}>
				<DarkModeToggle />
				<UserProfileMenu />
			</Flex>
		</Box>
	);
};
