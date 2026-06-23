import { reactive, readonly } from "vue";
import {
	getSession,
	login as apiLogin,
	logout as apiLogout,
	registerCustomer,
	type PortalSession,
	type SignupPayload,
} from "./api";

// Lightweight module-level session store (no Pinia needed for the portal).
const state = reactive<{ ready: boolean; session: PortalSession }>({
	ready: false,
	session: { authenticated: false },
});

export const session = readonly(state);

export async function loadSession(force = false): Promise<void> {
	if (state.ready && !force) return;
	try {
		state.session = await getSession();
	} catch {
		state.session = { authenticated: false };
	} finally {
		state.ready = true;
	}
}

export async function signIn(usr: string, pwd: string): Promise<void> {
	await apiLogin(usr, pwd);
	await loadSession(true);
}

export async function signUp(payload: SignupPayload): Promise<void> {
	await registerCustomer(payload);
	await loadSession(true);
}

export async function signOut(): Promise<void> {
	await apiLogout();
	state.session = { authenticated: false };
}
