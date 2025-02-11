import React from "react";
import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import ChatBot from "./components/ChatBot.tsx";
import { theme } from "./theme/index.ts";

function App() {
	return (
		<ChakraProvider theme={theme}>
			<ChatBot />
		</ChakraProvider>
	);
}

export default App;
