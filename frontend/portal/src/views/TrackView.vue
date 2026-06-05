<script setup lang="ts">
import { StatusPill } from "@kodlyft/ui";

// Uber-like live tracking — fed by FSM Technician Location over realtime in the P1 phase.
defineProps<{ job: string }>();
</script>

<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h1 class="text-2xl font-bold">Your technician is on the way</h1>
			<StatusPill status="in_progress" />
		</div>

		<div
			class="flex h-64 items-center justify-center rounded-lg border border-border bg-bg-subtle text-fg-muted"
		>
			Live map (Leaflet) — job {{ job }}
		</div>

		<div class="rounded-lg border border-border bg-bg p-4 shadow-card">
			<div class="flex items-center gap-3">
				<span class="size-10 rounded-full bg-brand-50"></span>
				<div>
					<p class="font-medium">Dana R.</p>
					<p class="text-sm text-fg-muted">Arriving in about 15 min</p>
				</div>
			</div>
		</div>
	</div>
</template>
