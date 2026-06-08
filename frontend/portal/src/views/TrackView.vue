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
		<div class="flex items-center justify-between gap-3">
			<div>
				<h1 class="text-2xl font-bold text-cmd-fg">Your technician is on the way</h1>
				<p class="mt-0.5 font-mono text-sm text-cmd-fg-muted">{{ job }}</p>
			</div>
			<StatusPill status="In Progress" />
		</div>

		<div
			class="flex h-64 items-center justify-center rounded-2xl border border-cmd-border bg-white/3 text-cmd-fg-muted"
		>
			Live map (Leaflet)
		</div>

		<div class="kl-glass flex items-center gap-3 rounded-2xl p-4">
			<span
				class="kl-grad-brand flex size-12 items-center justify-center rounded-full text-white"
			>
				<svg
					viewBox="0 0 24 24"
					class="size-6"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<circle cx="12" cy="8" r="4" />
					<path d="M4 21a8 8 0 0 1 16 0" />
				</svg>
			</span>
			<div class="flex-1">
				<p class="font-medium text-cmd-fg">Dana R.</p>
				<p class="text-sm text-cmd-fg-muted">Your HVAC technician</p>
			</div>
			<div class="text-right">
				<p class="font-mono text-lg tabular-nums text-brand">~15 min</p>
				<p class="text-xs text-cmd-fg-muted">estimated arrival</p>
			</div>
		</div>

		<ol class="relative ml-2 space-y-5 border-l border-cmd-border pl-6">
			<li v-for="(step, i) in timeline" :key="i" class="relative">
				<span
					class="absolute -left-7.75 flex size-4 items-center justify-center rounded-full"
					:class="step.done ? 'bg-brand' : 'border border-cmd-border bg-cmd-bg'"
				>
					<span
						v-if="step.active"
						class="absolute size-4 animate-ping rounded-full bg-brand/40"
					/>
				</span>
				<p
					class="text-sm"
					:class="step.active ? 'font-medium text-cmd-fg' : 'text-cmd-fg-muted'"
				>
					{{ step.label }}
				</p>
			</li>
		</ol>
	</div>
</template>
