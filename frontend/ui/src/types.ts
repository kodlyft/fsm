// Shared FSM domain types + status → color mapping used across all surfaces.

export type JobStatus =
	| "draft"
	| "scheduled"
	| "assigned"
	| "in_progress"
	| "on_hold"
	| "completed"
	| "cancelled"
	| "overdue";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

/** Maps a job status to a design-system status tone (status colors mean status). */
export const STATUS_TONE: Record<JobStatus, StatusTone> = {
	draft: "neutral",
	scheduled: "warning",
	assigned: "warning",
	in_progress: "info",
	on_hold: "warning",
	completed: "success",
	cancelled: "neutral",
	overdue: "danger",
};

/** Sentence-case labels — never Title Case or ALL CAPS. */
export const STATUS_LABEL: Record<JobStatus, string> = {
	draft: "Draft",
	scheduled: "Scheduled",
	assigned: "Assigned",
	in_progress: "In progress",
	on_hold: "On hold",
	completed: "Completed",
	cancelled: "Cancelled",
	overdue: "Overdue",
};

export interface JobSummary {
	name: string;
	customer: string;
	address?: string;
	scheduledAt?: string;
	status: JobStatus;
	technician?: string;
	total?: number;
}
