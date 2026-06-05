<script setup lang="ts">
import { computed } from "vue";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const props = withDefaults(
	defineProps<{
		variant?: Variant;
		size?: Size;
		block?: boolean;
		disabled?: boolean;
		type?: "button" | "submit" | "reset";
	}>(),
	{ variant: "primary", size: "md", block: false, disabled: false, type: "button" },
);

const VARIANT: Record<Variant, string> = {
	primary: "bg-brand text-white hover:bg-brand-500",
	secondary: "bg-surface text-fg hover:bg-bg-subtle border border-border",
	ghost: "bg-transparent text-fg hover:bg-bg-subtle",
	danger: "bg-danger text-white hover:opacity-90",
};

const SIZE: Record<Size, string> = {
	sm: "text-sm px-3 py-1.5",
	md: "text-base px-4 py-2",
	lg: "text-lg px-5 py-2.5",
};

const classes = computed(() => [
	"inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
	"focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]",
	"disabled:opacity-50 disabled:pointer-events-none",
	VARIANT[props.variant],
	SIZE[props.size],
	props.block ? "w-full" : "",
]);
</script>

<template>
	<button
		:type="type"
		:disabled="disabled"
		:class="classes"
		style="min-height: var(--kl-touch-min)"
	>
		<slot />
	</button>
</template>
