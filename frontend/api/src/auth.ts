import type { FrappeClient } from "./client";

export interface SessionUser {
	name: string;
	email?: string;
	full_name?: string;
	roles?: string[];
}

interface UserDoc {
	name: string;
	email?: string;
	full_name?: string;
	roles?: { role: string }[];
}

export class Auth {
	constructor(private client: FrappeClient) {}

	/** Cookie-session login (web). For mobile, prefer token auth via ClientOptions. */
	async login(usr: string, pwd: string): Promise<void> {
		await this.client.call("login", { usr, pwd });
	}

	async logout(): Promise<void> {
		await this.client.call("logout");
	}

	async currentUser(): Promise<string> {
		return this.client.call<string>("frappe.auth.get_logged_user", {}, "GET");
	}

	/** Returns the logged-in user with roles, or null if a Guest. */
	async session(): Promise<SessionUser | null> {
		const user = await this.currentUser();
		if (!user || user === "Guest") return null;
		const doc = await this.client.getDoc<UserDoc>("User", user);
		return {
			name: doc.name,
			email: doc.email,
			full_name: doc.full_name,
			roles: (doc.roles ?? []).map((r) => r.role),
		};
	}
}
