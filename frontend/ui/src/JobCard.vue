<script setup lang="ts">
import StatusPill from "./StatusPill.vue";
import type { JobSummary } from "./types";

defineProps<{ job: JobSummary }>();
defineEmits<{ open: [name: string] }>();

function formatTime(iso?: string): string {
	if (!iso) return "Unscheduled";
	const d = new Date(iso);
	return d.toLocaleString(undefined, {
		weekday: "short",
		hour: "numeric",
		minute: "2-digit",
	});
}
</script>

<template>
	<button
		type="button"
		class="flex w-full flex-col gap-2 rounded-lg border border-border bg-bg p-4 text-left shadow-card transition-colors hover:bg-bg-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
		@click="$emit('open', job.name)"
	>
		<div class="flex items-start justify-between gap-3">
			<div class="min-w-0">
				<p class="truncate text-base font-medium text-fg">{{ job.customer }}</p>
				<p v-if="job.address" class="truncate text-sm text-fg-muted">{{ job.address }}</p>
			</div>
			<StatusPill :status="job.status" />
		</div>
		<div class="flex items-center justify-between text-sm text-fg-muted">
			<span class="font-mono tabular-nums">{{ formatTime(job.scheduledAt) }}</span>
			<span v-if="job.technician" class="truncate">{{ job.technician }}</span>
		</div>
	</button>
</template>
