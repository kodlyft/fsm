import { createClient, Auth } from "@kodlyft/api";

// Same-origin: in dev the Vite proxy forwards /api to the bench; in prod the SPA is
// served by Frappe so cookies + CSRF are already present.
export const client = createClient({
	baseUrl: "",
	onAuthError: () => {
		// Let the router-level guard handle redirects; clearing here avoids loops.
	},
});

export const auth = new Auth(client);
