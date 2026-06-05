<script setup lang="ts">
import { StatusPill, type JobStatus } from "@kodlyft/ui";

const rows: { name: string; customer: string; status: JobStatus; total: string }[] = [
	{ name: "JOB-0001", customer: "Acme Cooling Co.", status: "scheduled", total: "$420.00" },
	{ name: "JOB-0002", customer: "Bluewater Plumbing", status: "in_progress", total: "$1,150.00" },
	{ name: "JOB-0003", customer: "Greenfield Pest", status: "overdue", total: "$260.00" },
	{ name: "JOB-0004", customer: "Northside HVAC", status: "completed", total: "$980.00" },
];
</script>

<template>
	<div class="overflow-hidden rounded-lg border border-border bg-bg shadow-card">
		<table class="w-full text-left text-sm">
			<thead class="border-b border-border text-fg-muted">
				<tr>
					<th class="px-4 py-3 font-medium">Job</th>
					<th class="px-4 py-3 font-medium">Customer</th>
					<th class="px-4 py-3 font-medium">Status</th>
					<th class="px-4 py-3 text-right font-medium">Total</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="row in rows"
					:key="row.name"
					class="border-b border-border last:border-0"
				>
					<td class="px-4 py-3 font-mono">{{ row.name }}</td>
					<td class="px-4 py-3">{{ row.customer }}</td>
					<td class="px-4 py-3"><StatusPill :status="row.status" /></td>
					<td class="px-4 py-3 text-right font-mono tabular-nums">{{ row.total }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
