// Shared FSM domain types + status → color mapping used across all surfaces.

// Values match the Service Job `status` doctype options exactly.
export type JobStatus =
	| "Draft"
	| "Scheduled"
	| "Assigned"
	| "In Progress"
	| "On Hold"
	| "Completed"
	| "Cancelled"
	| "Overdue";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

/** Maps a job status to a design-system status tone (status colors mean status). */
export const STATUS_TONE: Record<JobStatus, StatusTone> = {
	Draft: "neutral",
	Scheduled: "warning",
	Assigned: "warning",
	"In Progress": "info",
	"On Hold": "warning",
	Completed: "success",
	Cancelled: "neutral",
	Overdue: "danger",
};

/** Sentence-case display labels — never Title Case or ALL CAPS. */
export const STATUS_LABEL: Record<JobStatus, string> = {
	Draft: "Draft",
	Scheduled: "Scheduled",
	Assigned: "Assigned",
	"In Progress": "In progress",
	"On Hold": "On hold",
	Completed: "Completed",
	Cancelled: "Cancelled",
	Overdue: "Overdue",
};

export interface LinkOption {
	value: string;
	label: string;
}

export interface JobSummary {
	name: string;
	customer: string;
	address?: string;
	scheduledAt?: string;
	status: JobStatus;
	technician?: string;
	total?: number;
}
