import { client } from "./api";
import type { JobSummary, JobStatus } from "@kodlyft/ui";

interface DispatchRow {
	name: string;
	customer_name: string;
	status: JobStatus;
	scheduled_date: string | null;
	primary_technician: string | null;
	address_display: string | null;
	total_amount: number;
}

export async function getDispatchJobs(
	params: { status?: string; technician?: string; limit?: number } = {},
): Promise<JobSummary[]> {
	const rows = await client.call<DispatchRow[]>("fsm.api.get_dispatch_jobs", params, "GET");
	return rows.map((r) => ({
		name: r.name,
		customer: r.customer_name,
		address: r.address_display ?? undefined,
		scheduledAt: r.scheduled_date ?? undefined,
		status: r.status,
		technician: r.primary_technician ?? undefined,
		total: r.total_amount,
	}));
}

export function clockIn(): Promise<{ technician: string; clocked_in: boolean }> {
	return client.call("fsm.tracking.clock_in", {});
}

export function clockOut(): Promise<{ technician: string; clocked_in: boolean }> {
	return client.call("fsm.tracking.clock_out", {});
}

export function updateLocation(
	latitude: number,
	longitude: number,
	accuracy?: number,
	job?: string,
): Promise<{ technician: string }> {
	return client.call("fsm.tracking.update_location", { latitude, longitude, accuracy, job });
}
