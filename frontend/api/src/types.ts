export interface ClientOptions {
	/** Base URL of the Frappe site. "" (same origin) for the web surfaces; full URL for mobile. */
	baseUrl?: string;
	/** Token auth ("api_key:api_secret") — used by the mobile app. */
	token?: string;
	/** Lazily resolve a token (e.g. from Capacitor Preferences). Takes precedence over `token`. */
	getToken?: () => string | undefined | Promise<string | undefined>;
	/** CSRF token for cookie-based POSTs (Frappe injects window.csrf_token on served pages). */
	csrfToken?: string;
	/** Called on 401/403 so the app can redirect to login. */
	onAuthError?: (status: number) => void;
}

export interface ListParams<T = Record<string, unknown>> {
	fields?: (keyof T & string)[] | string[];
	filters?: Array<[string, string, unknown]> | Record<string, unknown>;
	orderBy?: string;
	limit?: number;
	start?: number;
	asDict?: boolean;
}

export class FrappeError extends Error {
	status: number;
	data: unknown;
	constructor(message: string, status: number, data: unknown) {
		super(message);
		this.name = "FrappeError";
		this.status = status;
		this.data = data;
	}
}
