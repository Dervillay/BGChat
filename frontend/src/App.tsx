import "./App.css";
import React from "react";
import ChatInterface from "./components/ChatInterface.tsx";
import { useAuth0 } from '@auth0/auth0-react';
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "./theme/index.ts";
import { LoadingScreen } from "./components/LoadingScreen.tsx";
import { RedirectingScreen } from "./components/RedirectingScreen.tsx";

function App() {
	const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

	if (isLoading) {
		return <LoadingScreen />;
	}

	if (!isAuthenticated) {
		loginWithRedirect();
		return <RedirectingScreen />;
	}

	return (
		<ChakraProvider theme={theme}>
			<ChatInterface />
		</ChakraProvider>
	);
}

export default App;
