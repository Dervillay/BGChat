import React, { useEffect } from "react";
import "./App.css";
import ChatInterface from "./components/ChatInterface.tsx";
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "./theme/index.ts";
import { LoadingScreen } from "./components/LoadingScreen.tsx";

function AppContent() {
	const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			loginWithRedirect();
		}
	}, [isLoading, isAuthenticated, loginWithRedirect]);

	return (
		<ChakraProvider theme={theme}>
			{
				isLoading ? <LoadingScreen /> 
				: isAuthenticated ? <ChatInterface />
				: null
			}
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
			cacheLocation="localstorage"
		>
			<AppContent />
		</Auth0Provider>
	);
}

export default App;
