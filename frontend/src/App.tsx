import React from "react";
import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import ChatInterface from "./components/ChatInterface.tsx";
import { theme } from "./theme/index.ts";

function App() {
	return (
		<ChakraProvider theme={theme}>
			<ChatInterface />
		</ChakraProvider>
	);
}

export default App;
