import "./App.css";
import React from "react";
import ChatInterface from "./components/ChatInterface.tsx";
import { useAuth0 } from "@auth0/auth0-react";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "./theme/index.ts";
import { LoadingScreen } from "./components/LoadingScreen.tsx";
import { PDFViewerModal } from "./components/PDFViewerModal.tsx";
import { PDFViewerProvider } from "./contexts/PDFViewerContext.tsx";

function App() {
	const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

	if (isLoading) {
		return <LoadingScreen />;
	}

	if (!isAuthenticated) {
		loginWithRedirect();
		return <LoadingScreen />;
	}

	return (
		<ChakraProvider theme={theme}>
			<PDFViewerProvider>
				<ChatInterface />
				<PDFViewerModal />
			</PDFViewerProvider>
		</ChakraProvider>
	);
}

export default App;
