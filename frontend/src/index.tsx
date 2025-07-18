import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Auth0Provider } from "@auth0/auth0-react";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "./theme/index.ts";
import App from "./App.tsx";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
	<React.StrictMode>
		<Auth0Provider
			domain={process.env.REACT_APP_AUTH0_DOMAIN}
			clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
			authorizationParams={{
				redirect_uri: window.location.origin,
				audience: process.env.REACT_APP_AUTH0_AUDIENCE,
			}}
			useRefreshTokens={true}
			cacheLocation="memory"
		>
			<ChakraProvider theme={theme}>
				<App />
			</ChakraProvider>
		</Auth0Provider>
	</React.StrictMode>
);
