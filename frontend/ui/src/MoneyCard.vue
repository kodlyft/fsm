<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
	defineProps<{
		label: string;
		amount: number;
		currency?: string;
		locale?: string;
	}>(),
	{ currency: "USD", locale: "en-US" },
);

const formatted = computed(() =>
	new Intl.NumberFormat(props.locale, {
		style: "currency",
		currency: props.currency,
	}).format(props.amount),
);
</script>

<template>
	<div class="rounded-lg border border-border bg-bg p-4 shadow-card">
		<p class="text-sm text-fg-muted">{{ label }}</p>
		<p class="mt-1 font-mono text-2xl text-fg tabular-nums">{{ formatted }}</p>
	</div>
</template>
