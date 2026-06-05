<script setup lang="ts">
import { computed } from "vue";
import { STATUS_TONE, STATUS_LABEL, type JobStatus, type StatusTone } from "./types";

const props = defineProps<{
	status: JobStatus;
	/** Override the auto-derived tone if needed. */
	tone?: StatusTone;
	label?: string;
}>();

// Full literal class strings so Tailwind's scanner detects them.
const TONE_CLASS: Record<StatusTone, string> = {
	success: "bg-success/15 text-success",
	warning: "bg-warning/15 text-warning",
	danger: "bg-danger/15 text-danger",
	info: "bg-info/15 text-info",
	neutral: "bg-fg-muted/15 text-fg-muted",
};

const tone = computed(() => props.tone ?? STATUS_TONE[props.status]);
const classes = computed(() => TONE_CLASS[tone.value]);
const text = computed(() => props.label ?? STATUS_LABEL[props.status]);
</script>

<template>
	<span
		class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
		:class="classes"
	>
		{{ text }}
	</span>
</template>
