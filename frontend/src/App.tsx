import React from "react";
import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import { Spinner, Center } from "@chakra-ui/react";
import ChatInterface from "./components/ChatInterface.tsx";
import { theme } from "./theme/index.ts";
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { Login } from './components/Login.tsx';

function AppContent() {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<ChakraProvider theme={theme}>
				<Center h="100vh">
					<Spinner
						thickness="4px"
						speed="0.65s"
						emptyColor="gray.200"
						color="blue.500"
						size="xl"
					/>
				</Center>
			</ChakraProvider>
		);
	}

	return (
		<ChakraProvider theme={theme}>
			{isAuthenticated ? <ChatInterface /> : <Login />}
		</ChakraProvider>
	);
}

function App() {
	return (
		<AuthProvider>
			<AppContent />
		</AuthProvider>
	);
}

export default App;
