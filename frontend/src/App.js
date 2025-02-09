import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import ChatBot from "./components/ChatBot.tsx";

function App() {
	return (
		<ChakraProvider>
			<ChatBot />
		</ChakraProvider>
	);
}

export default App;
