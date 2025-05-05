import { useAuth0 } from "@auth0/auth0-react";

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  getAccessTokenSilently: ReturnType<typeof useAuth0>["getAccessTokenSilently"],
) {
    const token = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: "openid profile email",
    });
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    return fetch(url, { ...options, headers });
};
