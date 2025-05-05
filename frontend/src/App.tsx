import "./App.css";
import React from "react";
import ChatInterface from "./components/ChatInterface.tsx";
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "./theme/index.ts";
import { LoadingScreen } from "./components/LoadingScreen.tsx";
import { RedirectingScreen } from "./components/RedirectingScreen.tsx";

function AppContent() {
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

function App() {
	return (
		<Auth0Provider
			domain={process.env.REACT_APP_AUTH0_DOMAIN}
			clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
			authorizationParams={{
				redirect_uri: window.location.origin
			}}
			useRefreshTokens={true}
			cacheLocation="memory"
		>
			<AppContent />
		</Auth0Provider>
	);
}

export default App;
