import "./App.css";
import React, { useEffect } from "react";
import ChatInterface from "./components/ChatInterface.tsx";
import { useAuth0 } from "@auth0/auth0-react";
import { LoadingScreen } from "./components/LoadingScreen.tsx";
import { PDFViewerModal } from "./components/PDFViewerModal.tsx";
import { PDFViewerProvider } from "./contexts/PDFViewerContext.tsx";
import { useColorMode, useToken } from "@chakra-ui/react";

function App() {
	const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
	const { colorMode } = useColorMode();

	const [lightBackground, darkBackground] = useToken("colors", ["white", "#101010"]);

	useEffect(() => {
		document.body.style.background = colorMode === "dark" ? darkBackground : lightBackground;
	}, [colorMode, darkBackground, lightBackground]);

	if (isLoading) {
		return <LoadingScreen />;
	}

	if (!isAuthenticated) {
		loginWithRedirect();
		return <LoadingScreen />;
	}

	return (	
		<PDFViewerProvider>
			<ChatInterface />
			<PDFViewerModal />
		</PDFViewerProvider>
	);
}

export default App;
