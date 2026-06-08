import { createClient } from "@kodlyft/api";
import type { JobStatus } from "@kodlyft/ui";

export const client = createClient({ baseUrl: "" });

export interface BookingPayload {
	customer_name: string;
	contact_phone: string;
	service_address?: string;
	service_type?: string;
	preferred_date?: string;
	notes?: string;
}

export interface PortalSession {
	authenticated: boolean;
	user?: string;
	full_name?: string;
	customer?: string | null;
}

export type AppointmentStatus = "Open" | "Scheduled" | "Converted" | "Cancelled";

export interface MyAppointment {
	name: string;
	status: AppointmentStatus;
	service_type?: string;
	preferred_date?: string;
	service_job?: string;
	creation: string;
}

export interface MyJob {
	name: string;
	status: JobStatus;
	priority?: string;
	service_type?: string;
	scheduled_date?: string;
	completed_on?: string;
	primary_technician?: string;
	total_amount?: number;
	sales_invoice?: string;
	address_display?: string;
}

export interface SignupPayload {
	full_name: string;
	email: string;
	password: string;
	phone?: string;
}

export function bookAppointment(payload: BookingPayload): Promise<{ name: string }> {
	return client.call<{ name: string }>("fsm.api.book_appointment", { ...payload });
}

export function getSession(): Promise<PortalSession> {
	return client.call<PortalSession>("fsm.api.get_portal_session", {}, "GET");
}

export function registerCustomer(
	payload: SignupPayload,
): Promise<{ customer: string; user: string; full_name: string }> {
	return client.call("fsm.api.register_customer", { ...payload });
}

export function login(usr: string, pwd: string): Promise<unknown> {
	return client.call("login", { usr, pwd });
}

export function logout(): Promise<unknown> {
	return client.call("logout", {});
}

export function getMyAppointments(): Promise<MyAppointment[]> {
	return client.call<MyAppointment[]>("fsm.api.get_my_appointments", {}, "GET");
}

export function getMyJobs(): Promise<MyJob[]> {
	return client.call<MyJob[]>("fsm.api.get_my_jobs", {}, "GET");
}
