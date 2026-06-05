<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
	defineProps<{
		label: string;
		value: string | number;
		/** Optional positive/negative delta, e.g. "+12%". */
		delta?: string;
		tone?: "neutral" | "brand" | "success" | "warning" | "danger";
		mono?: boolean;
	}>(),
	{ tone: "brand", mono: true },
);

const CHIP: Record<NonNullable<typeof props.tone>, string> = {
	neutral: "bg-fg-muted/15 text-fg-muted ring-fg-muted/20",
	brand: "bg-brand/15 text-brand ring-brand/25",
	success: "bg-success/15 text-success ring-success/25",
	warning: "bg-warning/15 text-warning ring-warning/25",
	danger: "bg-danger/15 text-danger ring-danger/25",
};

const DELTA: Record<NonNullable<typeof props.tone>, string> = {
	neutral: "text-fg-muted",
	brand: "text-brand",
	success: "text-success",
	warning: "text-warning",
	danger: "text-danger",
};

const chipClass = computed(() => CHIP[props.tone]);
const deltaClass = computed(() => DELTA[props.tone]);
</script>

<template>
	<div
		class="group rounded-2xl border border-border bg-bg p-4 shadow-card backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-glass-lg"
	>
		<div class="flex items-start justify-between gap-3">
			<p class="text-sm text-fg-muted">{{ label }}</p>
			<span
				class="flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset"
				:class="chipClass"
			>
				<slot name="icon">
					<svg
						viewBox="0 0 24 24"
						class="size-4.5"
						fill="none"
						stroke="currentColor"
						stroke-width="1.9"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M3 3v18h18" />
						<path d="m19 9-5 5-4-4-3 3" />
					</svg>
				</slot>
			</span>
		</div>
		<div class="mt-2 flex items-baseline gap-2">
			<span class="text-3xl text-fg" :class="mono ? 'font-mono tabular-nums' : 'font-bold'">
				{{ value }}
			</span>
			<span v-if="delta" class="text-sm font-medium" :class="deltaClass">{{ delta }}</span>
		</div>
	</div>
</template>
