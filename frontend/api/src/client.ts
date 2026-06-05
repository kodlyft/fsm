import { type ClientOptions, type ListParams, FrappeError } from "./types";

/**
 * Minimal typed Frappe client built on fetch.
 * - Web (console/portal): same-origin, cookie session + CSRF token.
 * - Mobile: full baseUrl + `Authorization: token key:secret`.
 */
export class FrappeClient {
	private baseUrl: string;
	private opts: ClientOptions;

	constructor(opts: ClientOptions = {}) {
		this.baseUrl = (opts.baseUrl ?? "").replace(/\/$/, "");
		this.opts = opts;
	}

	private async authHeaders(method: string): Promise<Record<string, string>> {
		const headers: Record<string, string> = {};
		const token = (await this.opts.getToken?.()) ?? this.opts.token;
		if (token) headers["Authorization"] = `token ${token}`;
		// CSRF is required for state-changing cookie-auth requests.
		const csrf =
			this.opts.csrfToken ??
			(typeof window !== "undefined"
				? ((window as unknown as { csrf_token?: string }).csrf_token ?? "")
				: "");
		if (csrf && method !== "GET") headers["X-Frappe-CSRF-Token"] = csrf;
		return headers;
	}

	private async request<T>(path: string, init: RequestInit & { method: string }): Promise<T> {
		const res = await fetch(`${this.baseUrl}${path}`, {
			credentials: "include",
			...init,
			headers: {
				Accept: "application/json",
				...(init.body ? { "Content-Type": "application/json" } : {}),
				...(await this.authHeaders(init.method)),
				...(init.headers as Record<string, string>),
			},
		});

		if (res.status === 401 || res.status === 403) this.opts.onAuthError?.(res.status);

		const text = await res.text();
		const data = text ? safeParse(text) : null;
		if (!res.ok) {
			const message =
				(data as { exception?: string; _server_messages?: string })?.exception ||
				`Request failed (${res.status})`;
			throw new FrappeError(message, res.status, data);
		}
		return data as T;
	}

	/** Call a whitelisted method: fsm.api.<...>. Returns the unwrapped `message`. */
	async call<T = unknown>(
		method: string,
		args: Record<string, unknown> = {},
		httpMethod: "GET" | "POST" = "POST",
	): Promise<T> {
		if (httpMethod === "GET") {
			const qs = new URLSearchParams();
			for (const [k, v] of Object.entries(args))
				qs.set(k, typeof v === "string" ? v : JSON.stringify(v));
			const res = await this.request<{ message: T }>(
				`/api/method/${method}?${qs.toString()}`,
				{ method: "GET" },
			);
			return res.message;
		}
		const res = await this.request<{ message: T }>(`/api/method/${method}`, {
			method: "POST",
			body: JSON.stringify(args),
		});
		return res.message;
	}

	async getList<T = Record<string, unknown>>(
		doctype: string,
		params: ListParams<T> = {},
	): Promise<T[]> {
		const qs = new URLSearchParams();
		if (params.fields) qs.set("fields", JSON.stringify(params.fields));
		if (params.filters) qs.set("filters", JSON.stringify(params.filters));
		if (params.orderBy) qs.set("order_by", params.orderBy);
		qs.set("limit_page_length", String(params.limit ?? 20));
		qs.set("limit_start", String(params.start ?? 0));
		const res = await this.request<{ data: T[] }>(
			`/api/resource/${encodeURIComponent(doctype)}?${qs.toString()}`,
			{ method: "GET" },
		);
		return res.data;
	}

	async getDoc<T = Record<string, unknown>>(doctype: string, name: string): Promise<T> {
		const res = await this.request<{ data: T }>(
			`/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
			{ method: "GET" },
		);
		return res.data;
	}

	async createDoc<T = Record<string, unknown>>(doctype: string, doc: Partial<T>): Promise<T> {
		const res = await this.request<{ data: T }>(
			`/api/resource/${encodeURIComponent(doctype)}`,
			{
				method: "POST",
				body: JSON.stringify(doc),
			},
		);
		return res.data;
	}

	async updateDoc<T = Record<string, unknown>>(
		doctype: string,
		name: string,
		patch: Partial<T>,
	): Promise<T> {
		const res = await this.request<{ data: T }>(
			`/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
			{ method: "PUT", body: JSON.stringify(patch) },
		);
		return res.data;
	}

	async deleteDoc(doctype: string, name: string): Promise<void> {
		await this.request(
			`/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
			{ method: "DELETE" },
		);
	}

	async uploadFile(
		file: File | Blob,
		options: {
			doctype?: string;
			docname?: string;
			isPrivate?: boolean;
			fileName?: string;
		} = {},
	): Promise<{ file_url: string; name: string }> {
		const form = new FormData();
		form.append("file", file, options.fileName ?? (file as File).name ?? "upload");
		if (options.doctype) form.append("doctype", options.doctype);
		if (options.docname) form.append("docname", options.docname);
		form.append("is_private", options.isPrivate ? "1" : "0");
		const res = await this.request<{ message: { file_url: string; name: string } }>(
			`/api/method/upload_file`,
			{ method: "POST", body: form as unknown as BodyInit },
		);
		return res.message;
	}
}

function safeParse(text: string): unknown {
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

export function createClient(opts?: ClientOptions): FrappeClient {
	return new FrappeClient(opts);
}
