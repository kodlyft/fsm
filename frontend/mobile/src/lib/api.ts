import { createClient, Auth } from "@kodlyft/api";
import { Preferences } from "@capacitor/preferences";

const TOKEN_KEY = "fsm_token";

// Mobile talks to a remote Frappe site over token auth. Configure via VITE_FSM_URL.
const BASE_URL = (import.meta.env.VITE_FSM_URL as string) ?? "http://localhost:8000";

export const client = createClient({
	baseUrl: BASE_URL,
	getToken: async () => (await Preferences.get({ key: TOKEN_KEY })).value ?? undefined,
});

export const auth = new Auth(client);

export async function setToken(token: string): Promise<void> {
	await Preferences.set({ key: TOKEN_KEY, value: token });
}

export async function clearToken(): Promise<void> {
	await Preferences.remove({ key: TOKEN_KEY });
}
