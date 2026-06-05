import { createClient } from "@kodlyft/api";

export const client = createClient({ baseUrl: "" });

export interface BookingPayload {
	customer_name: string;
	contact_phone: string;
	service_address?: string;
	service_type?: string;
	preferred_date?: string;
	notes?: string;
}

export function bookAppointment(payload: BookingPayload): Promise<{ name: string }> {
	return client.call<{ name: string }>("fsm.api.book_appointment", { ...payload });
}
