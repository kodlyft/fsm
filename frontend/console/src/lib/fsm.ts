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
	estimated_hours?: number;
	actual_hours?: number;
	labor_rate?: number;
	labor_cost?: number;
	materials_cost?: number;
	overhead_cost?: number;
	total_cost?: number;
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

export function updateJob(name: string, patch: Partial<JobDoc>): Promise<JobDoc> {
	return client.updateDoc<JobDoc>("Service Job", name, patch);
}

export interface JobCostSummary {
	estimated_hours: number | null;
	labor_rate: number | null;
	overhead_cost: number | null;
	actual_hours: number;
	materials_cost: number;
	labor_cost: number;
	total_cost: number;
}

export function getJobCostSummary(job: string): Promise<JobCostSummary> {
	return client.call<JobCostSummary>("fsm.costing.get_job_cost_summary", { job }, "GET");
}

export interface JobEstimate {
	service_type: string;
	sample_size: number;
	avg_hours: number | null;
	basis?: string;
}

export function estimateJob(service_type: string, technician?: string): Promise<JobEstimate> {
	return client.call<JobEstimate>(
		"fsm.costing.estimate_job",
		{ service_type, technician },
		"GET",
	);
}

export interface SubcontractorRow {
	name: string;
	subcontractor_name: string;
	status: string;
	territory: string | null;
	hourly_rate: number | null;
	phone: string | null;
	email: string | null;
}

export interface SubcontractorWork {
	technicians: { name: string; technician_name: string; status: string; active: number }[];
	jobs: {
		name: string;
		customer_name: string;
		status: string;
		scheduled_date: string | null;
		primary_technician: string;
		actual_hours: number;
		total_cost: number;
	}[];
	summary: {
		technicians: number;
		total_jobs: number;
		completed_jobs: number;
		total_hours: number;
		total_cost: number;
	};
}

export function listSubcontractors(status?: string): Promise<SubcontractorRow[]> {
	return client.call<SubcontractorRow[]>(
		"fsm.contractors.list_subcontractors",
		{ status },
		"GET",
	);
}

export function getSubcontractorWork(subcontractor: string): Promise<SubcontractorWork> {
	return client.call<SubcontractorWork>(
		"fsm.contractors.get_subcontractor_work",
		{ subcontractor },
		"GET",
	);
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

export interface StockRow {
	item_code: string;
	item_name: string | null;
	warehouse: string;
	actual_qty: number;
	reserved_qty: number;
	projected_qty: number;
	reorder_level: number | null;
	low: boolean;
}

export function getStockLevels(
	params: { warehouse?: string; technician?: string; item?: string; low_only?: number } = {},
): Promise<StockRow[]> {
	return client.call<StockRow[]>("fsm.inventory.get_stock_levels", params, "GET");
}

export interface JobLogistics {
	material_requests: {
		name: string;
		status: string;
		material_request_type: string;
		transaction_date: string;
		schedule_date: string;
		per_ordered: number;
		per_received: number;
	}[];
	delivery_notes: { name: string; status: string; posting_date: string; per_billed: number }[];
}

export function getJobLogistics(job: string): Promise<JobLogistics> {
	return client.call<JobLogistics>("fsm.logistics.get_job_logistics", { job }, "GET");
}

export function requestParts(
	job: string,
	items: { item_code: string; qty: number }[],
	warehouse?: string,
): Promise<{ name: string; warehouse: string }> {
	return client.call("fsm.logistics.request_parts", { job, items, warehouse });
}

export interface ServiceReturnRow {
	name: string;
	service_job: string;
	customer: string;
	status: string;
	return_date: string;
	warehouse: string | null;
	stock_entry: string | null;
}

export interface ReturnItemInput {
	item_code: string;
	qty: number;
	disposition: "Restock" | "Refurbish" | "Scrap";
	note?: string;
}

export function listReturns(
	params: { status?: string; job?: string } = {},
): Promise<ServiceReturnRow[]> {
	return client.call<ServiceReturnRow[]>("fsm.returns.list_returns", params, "GET");
}

export function createReturn(
	service_job: string,
	items: ReturnItemInput[],
	warehouse?: string,
	reason?: string,
): Promise<{ name: string; status: string }> {
	return client.call("fsm.returns.create_return", { service_job, items, warehouse, reason });
}

export function processReturn(
	name: string,
	action: "approve" | "receive" | "close",
): Promise<{ name: string; status: string; stock_entry: string | null }> {
	return client.call("fsm.returns.process_return", { name, action });
}

export interface JobMessage {
	name: string;
	author_role: string;
	author_name: string | null;
	message: string;
	creation: string;
}

export function getMessages(job: string): Promise<JobMessage[]> {
	return client.call<JobMessage[]>("fsm.messaging.get_messages", { job }, "GET");
}

export function postMessage(
	job: string,
	message: string,
): Promise<{ name: string; creation: string }> {
	return client.call("fsm.messaging.post_message", { job, message });
}

export interface JobFeedback {
	name: string;
	rating: number;
	nps_score: number | null;
	comments: string | null;
	submitted_on: string;
}

export interface CsatSummary {
	responses: number;
	avg_rating: number | null;
	nps: number | null;
}

export function getFeedback(job: string): Promise<JobFeedback | null> {
	return client.call<JobFeedback | null>("fsm.feedback.get_feedback", { job }, "GET");
}

export function getCsatSummary(days = 90): Promise<CsatSummary> {
	return client.call<CsatSummary>("fsm.feedback.get_csat_summary", { days }, "GET");
}

export interface FieldNote {
	name: string;
	note: string;
	service_job: string | null;
	technician: string | null;
	visit_date: string | null;
	creation: string;
}

export interface CustomerProfile {
	customer: {
		customer_name: string;
		customer_group: string | null;
		territory: string | null;
		mobile_no: string | null;
		email_id: string | null;
	};
	jobs: {
		name: string;
		status: string;
		service_type: string | null;
		scheduled_date: string | null;
		completed_on: string | null;
		total_amount: number;
	}[];
	stats: {
		total_jobs: number;
		completed_jobs: number;
		total_billed: number;
		last_service: string | null;
	};
	field_notes: FieldNote[];
}

export function getCustomerProfile(customer: string): Promise<CustomerProfile> {
	return client.call<CustomerProfile>("fsm.customers.get_customer_profile", { customer }, "GET");
}

export function addFieldNote(
	customer: string,
	note: string,
	service_job?: string,
): Promise<{ name: string }> {
	return client.call("fsm.customers.add_field_note", { customer, note, service_job });
}

export function listFieldNotes(customer: string): Promise<FieldNote[]> {
	return client.call<FieldNote[]>("fsm.customers.list_field_notes", { customer }, "GET");
}

export interface ServicePerformance {
	window_days: number;
	total_jobs: number;
	completed_jobs: number;
	completion_rate: number | null;
	first_time_fix_rate: number | null;
	mttr_hours: number | null;
	avg_completion_hours: number | null;
	punctuality_pct: number | null;
	sla_breaches: number;
}

export interface WorkorderVolume {
	window_days: number;
	total: number;
	open: number;
	completed: number;
	by_status: Record<string, number>;
	by_service_type: Record<string, number>;
	trend: { date: string; count: number }[];
}

export interface InventoryUsage {
	window_days: number;
	items: { item_code: string; item_name: string | null; qty: number; amount: number }[];
}

export interface TechUtilization {
	window_days: number;
	technicians: {
		technician: string;
		jobs: number;
		completed: number;
		hours: number;
		avg_hours_per_job: number;
		completion_rate: number;
	}[];
}

export function getServicePerformance(days = 90): Promise<ServicePerformance> {
	return client.call<ServicePerformance>("fsm.analytics.service_performance", { days }, "GET");
}
export function getWorkorderVolume(days = 90): Promise<WorkorderVolume> {
	return client.call<WorkorderVolume>("fsm.analytics.workorder_volume", { days }, "GET");
}
export function getInventoryUsage(days = 90): Promise<InventoryUsage> {
	return client.call<InventoryUsage>("fsm.analytics.inventory_usage", { days }, "GET");
}
export function getTechnicianUtilization(days = 90): Promise<TechUtilization> {
	return client.call<TechUtilization>("fsm.analytics.technician_utilization", { days }, "GET");
}

export interface ApiKeys {
	user: string;
	api_key: string;
	api_secret: string;
	usage: string;
}

export interface WebhookRow {
	name: string;
	webhook_docevent: string;
	request_url: string;
	enabled: number;
}

export function generateApiKeys(user?: string): Promise<ApiKeys> {
	return client.call<ApiKeys>("fsm.integrations.generate_api_keys", { user });
}
export function listWebhooks(): Promise<WebhookRow[]> {
	return client.call<WebhookRow[]>("fsm.integrations.list_webhooks", {}, "GET");
}
export function registerWebhook(
	request_url: string,
	docevent = "on_update",
): Promise<{ name: string }> {
	return client.call("fsm.integrations.register_webhook", { request_url, docevent });
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
