<script setup lang="ts">
import { StatusPill } from "@kodlyft/ui";

// Uber-like live tracking — fed by Technician Location over realtime in the P1 phase.
defineProps<{ job: string }>();

const timeline = [
	{ label: "Request received", done: true },
	{ label: "Appointment confirmed", done: true },
	{ label: "Technician on the way", done: true, active: true },
	{ label: "Job completed", done: false },
];
</script>

<template>
	<div class="space-y-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold">Your technician is on the way</h1>
				<p class="mt-0.5 font-mono text-sm text-fg-muted">{{ job }}</p>
			</div>
			<StatusPill status="In Progress" />
		</div>

		<div
			class="flex h-64 items-center justify-center rounded-lg border border-border bg-bg-subtle text-fg-muted"
		>
			Live map (Leaflet)
		</div>

		<div class="flex items-center gap-3 rounded-lg border border-border bg-bg p-4 shadow-card">
			<span class="flex size-12 items-center justify-center rounded-full bg-brand-50 text-xl"
				>👷</span
			>
			<div class="flex-1">
				<p class="font-medium">Dana R.</p>
				<p class="text-sm text-fg-muted">Your HVAC technician</p>
			</div>
			<div class="text-right">
				<p class="font-mono text-lg tabular-nums text-brand-700">~15 min</p>
				<p class="text-xs text-fg-muted">estimated arrival</p>
			</div>
		</div>

		<ol class="relative ml-2 space-y-5 border-l border-border pl-6">
			<li v-for="(step, i) in timeline" :key="i" class="relative">
				<span
					class="absolute -left-7.75 flex size-4 items-center justify-center rounded-full"
					:class="step.done ? 'bg-brand' : 'border border-border bg-bg'"
				>
					<span
						v-if="step.active"
						class="absolute size-4 animate-ping rounded-full bg-brand/40"
					/>
				</span>
				<p class="text-sm" :class="step.active ? 'font-medium text-fg' : 'text-fg-muted'">
					{{ step.label }}
				</p>
			</li>
		</ol>
	</div>
</template>
