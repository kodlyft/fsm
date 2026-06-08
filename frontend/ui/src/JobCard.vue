<script setup lang="ts">
import { computed } from "vue";
import StatusPill from "./StatusPill.vue";
import { STATUS_TONE, type JobSummary } from "./types";

const props = defineProps<{ job: JobSummary }>();
defineEmits<{ open: [name: string] }>();

const ACCENT: Record<string, string> = {
	success: "bg-success",
	warning: "bg-warning",
	danger: "bg-danger",
	info: "bg-info",
	neutral: "bg-fg-muted",
};
const accent = computed(() => ACCENT[STATUS_TONE[props.job.status]] ?? "bg-fg-muted");

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
		class="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-border bg-bg p-4 pl-5 text-left shadow-card backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-cmd-border-strong hover:shadow-glass-lg focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
		@click="$emit('open', job.name)"
	>
		<span
			class="absolute inset-y-3 left-0 w-1 rounded-full"
			:class="accent"
			aria-hidden="true"
		/>
		<div class="flex flex-col gap-2">
			<div class="flex items-start justify-between gap-3">
				<div class="min-w-0">
					<p class="truncate text-base font-semibold text-fg">{{ job.customer }}</p>
					<p v-if="job.address" class="truncate text-sm text-fg-muted">
						{{ job.address }}
					</p>
				</div>
				<StatusPill :status="job.status" />
			</div>
			<div class="flex items-center justify-between gap-2 text-sm text-fg-muted">
				<span class="inline-flex items-center gap-1.5">
					<svg
						viewBox="0 0 24 24"
						class="size-4 shrink-0"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="9" />
						<path d="M12 7v5l3 2" />
					</svg>
					<span class="font-mono tabular-nums">{{ formatTime(job.scheduledAt) }}</span>
				</span>
				<span v-if="job.technician" class="inline-flex min-w-0 items-center gap-1.5">
					<svg
						viewBox="0 0 24 24"
						class="size-4 shrink-0"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="8" r="3.5" />
						<path d="M5 20a7 7 0 0 1 14 0" />
					</svg>
					<span class="truncate">{{ job.technician }}</span>
				</span>
			</div>
		</div>
	</button>
</template>
