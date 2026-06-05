import { io, type Socket } from "socket.io-client";

export interface RealtimeOptions {
	/** Frappe site origin. "" for same-origin (web); full URL for mobile. */
	url?: string;
	/** Site name, sent so Frappe routes events to the right namespace. */
	siteName?: string;
}

/**
 * Thin wrapper over Frappe's socket.io realtime — used for the live dispatch board
 * and Uber-like technician tracking.
 */
export class Realtime {
	private socket: Socket;

	constructor(opts: RealtimeOptions = {}) {
		this.socket = io(opts.url || "/", {
			path: "/socket.io",
			withCredentials: true,
			transports: ["websocket", "polling"],
			query: opts.siteName ? { site_name: opts.siteName } : undefined,
			autoConnect: true,
		});
	}

	on<T = unknown>(event: string, handler: (data: T) => void): () => void {
		this.socket.on(event, handler as (data: unknown) => void);
		return () => this.socket.off(event, handler as (data: unknown) => void);
	}

	/** Subscribe to realtime updates for a specific document. */
	subscribeDoc(doctype: string, name: string): void {
		this.socket.emit("doc_subscribe", doctype, name);
	}

	unsubscribeDoc(doctype: string, name: string): void {
		this.socket.emit("doc_unsubscribe", doctype, name);
	}

	emit(event: string, ...args: unknown[]): void {
		this.socket.emit(event, ...args);
	}

	close(): void {
		this.socket.close();
	}
}
