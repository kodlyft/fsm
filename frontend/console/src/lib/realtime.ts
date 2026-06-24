import { Realtime } from "@kodlyft/api";

export const SERVICE_JOB_EVENT = "fsm_service_job_update";
export const TECHNICIAN_EVENT = "fsm_technician_update";
export const JOB_MESSAGE_EVENT = "fsm_job_message";

export interface JobMessageEvent {
	service_job: string;
	author_role: string;
	author_name: string | null;
	message: string;
	creation: string;
}

export interface ServiceJobEvent {
	name: string;
	customer_name: string;
	status: string;
	priority: string;
	scheduled_date: string | null;
	primary_technician: string | null;
	sla_breached: number;
}

export interface TechnicianEvent {
	name: string;
	technician_name: string;
	status: string;
	clocked_in: number;
	last_seen_latitude: number | null;
	last_seen_longitude: number | null;
	last_seen_on: string | null;
}

let instance: Realtime | null = null;

export function realtime(): Realtime {
	if (!instance) instance = new Realtime({ url: "" });
	return instance;
}
