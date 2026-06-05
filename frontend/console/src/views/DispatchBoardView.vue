<script setup lang="ts">
import { ref } from "vue";
import { JobCard, MoneyCard, type JobSummary } from "@kodlyft/ui";

// Placeholder data — wired to the FSM Job doctype in the P0 backend phase.
const jobs = ref<JobSummary[]>([
	{
		name: "JOB-0001",
		customer: "Acme Cooling Co.",
		address: "120 Main St, Springfield",
		scheduledAt: new Date().toISOString(),
		status: "scheduled",
		technician: "Dana R.",
	},
	{
		name: "JOB-0002",
		customer: "Bluewater Plumbing",
		address: "44 Oak Ave, Riverton",
		scheduledAt: new Date(Date.now() + 3.6e6).toISOString(),
		status: "in_progress",
		technician: "Sam T.",
	},
	{
		name: "JOB-0003",
		customer: "Greenfield Pest",
		address: "7 Elm Rd, Lakeside",
		status: "overdue",
	},
]);

function openJob(name: string) {
	// Navigate to the job detail screen (P0).
	console.log("open", name);
}
</script>

<template>
	<div class="space-y-6">
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<MoneyCard label="Revenue today" :amount="4820" />
			<MoneyCard label="Outstanding" :amount="1290" />
			<div class="rounded-lg border border-border bg-bg p-4 shadow-card">
				<p class="text-sm text-fg-muted">Jobs today</p>
				<p class="mt-1 font-mono text-2xl tabular-nums">{{ jobs.length }}</p>
			</div>
		</div>

		<section>
			<h2 class="mb-3 text-lg font-bold">Today's schedule</h2>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
				<JobCard v-for="job in jobs" :key="job.name" :job="job" @open="openJob" />
			</div>
		</section>
	</div>
</template>
