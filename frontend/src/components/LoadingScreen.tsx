import React from "react";
import { Center, Spinner } from "@chakra-ui/react";

export const LoadingScreen = () => {
	return (
    <Center h="100vh">
			<Spinner size="xl" color="gray.300" speed="0.65s" />
		</Center>
	);
}; 