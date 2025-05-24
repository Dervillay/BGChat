import React from "react";
import { Box, Center, Spinner } from "@chakra-ui/react";

export const LoadingScreen = () => {
	return (
    <Center h="100vh">
			<Spinner size="xl" color="gray.200" thickness="4px" speed="0.65s" />
		</Center>
	);
}; 