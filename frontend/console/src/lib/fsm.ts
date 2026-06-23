import { client } from "./api";
import type { JobSummary, JobStatus, LinkOption } from "@kodlyft/ui";

export interface DashboardStats {
	open_jobs: number;
	in_progress: number;
	completed_today: number;
	revenue_today: number;
	sla_breached: number;
}

interface DispatchRow {
	name: string;
	customer_name: string;
	status: JobStatus;
	priority: string;
	scheduled_date: string | null;
	primary_technician: string | null;
	total_amount: number;
	address_display: string | null;
	sla_breached: number;
	promised_response_by: string | null;
}

export interface TechnicianSuggestion {
	technician: string;
	technician_name: string;
	status: string;
	territory: string | null;
	score: number;
	reasons: string[];
}

export interface JobDoc {
	name: string;
	customer: string;
	customer_name?: string;
	contact?: string;
	status: JobStatus;
	priority?: string;
	service_type?: string;
	scheduled_date?: string;
	scheduled_end?: string;
	primary_technician?: string;
	territory?: string;
	service_address?: string;
	address_display?: string;
	checklist_template?: string;
	total_amount?: number;
	completed_on?: string;
	sales_invoice?: string;
	notes?: string;
	promised_response_by?: string;
	responded_on?: string;
	sla_breached?: number;
	tasks?: JobTask[];
	items?: { item_code: string; item_name?: string; qty: number; rate: number; amount?: number }[];
}

export type TaskStatus = "Pending" | "In Progress" | "Done";

export interface JobTask {
	name?: string;
	idx: number;
	task: string;
	status: TaskStatus;
	completed: number;
	note?: string;
	started_on?: string;
	completed_on?: string;
}

export function getDashboardStats(): Promise<DashboardStats> {
	return client.call<DashboardStats>("fsm.api.get_dashboard_stats", {}, "GET");
}

export type DispatchJob = JobSummary & {
	slaBreached: boolean;
	promisedResponseBy?: string;
};

export async function getDispatchJobs(
	params: { status?: string; technician?: string; limit?: number } = {},
): Promise<DispatchJob[]> {
	const rows = await client.call<DispatchRow[]>("fsm.api.get_dispatch_jobs", params, "GET");
	return rows.map((r) => ({
		name: r.name,
		customer: r.customer_name,
		address: r.address_display ?? undefined,
		scheduledAt: r.scheduled_date ?? undefined,
		status: r.status,
		technician: r.primary_technician ?? undefined,
		total: r.total_amount,
		slaBreached: !!r.sla_breached,
		promisedResponseBy: r.promised_response_by ?? undefined,
	}));
}

export function suggestTechnicians(job: string, limit = 8): Promise<TechnicianSuggestion[]> {
	return client.call<TechnicianSuggestion[]>(
		"fsm.scheduling.suggest_technicians",
		{ job, limit },
		"GET",
	);
}

export function assignTechnician(job: string, technician: string): Promise<JobDoc> {
	return client.call<JobDoc>("fsm.scheduling.assign_technician", { job, technician });
}

export function getJob(name: string): Promise<JobDoc> {
	return client.getDoc<JobDoc>("Service Job", name);
}

export function createJob(payload: Partial<JobDoc>): Promise<JobDoc> {
	return client.createDoc<JobDoc>("Service Job", payload);
}

export function createInvoiceFromJob(job: string): Promise<{ name: string }> {
	return client.call<{ name: string }>("fsm.api.create_invoice_from_job", { job });
}

export function startJobTask(job: string, idx: number): Promise<JobDoc> {
	return client.call<JobDoc>("fsm.api.start_job_task", { job, idx });
}

export function completeJobTask(job: string, idx: number, note?: string): Promise<JobDoc> {
	return client.call<JobDoc>("fsm.api.complete_job_task", { job, idx, note });
}

export function completeJob(job: string): Promise<JobDoc> {
	return client.call<JobDoc>("fsm.api.complete_job", { job });
}

export async function searchLink(
	doctype: string,
	query: string,
	labelField = "name",
	searchField?: string,
): Promise<LinkOption[]> {
	const fields = labelField === "name" ? ["name"] : ["name", labelField];
	const sf = searchField ?? labelField;
	const filters = query
		? ([[sf, "like", `%${query}%`]] as [string, string, unknown][])
		: undefined;
	const rows = await client.getList<Record<string, unknown>>(doctype, {
		fields,
		filters,
		limit: 10,
	});
	return rows.map((r) => ({
		value: String(r.name),
		label: String(r[labelField] ?? r.name),
	}));
}
