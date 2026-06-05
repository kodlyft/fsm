<script setup lang="ts">
// Checkbox + label + optional note. Honors the 44px minimum touch target on mobile.
const props = defineProps<{
	modelValue: boolean;
	label: string;
	note?: string;
}>();

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

function toggle() {
	emit("update:modelValue", !props.modelValue);
}
</script>

<template>
	<button
		type="button"
		class="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-bg-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
		style="min-height: var(--kl-touch-min)"
		role="checkbox"
		:aria-checked="modelValue"
		@click="toggle"
	>
		<span
			class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border"
			:class="modelValue ? 'border-brand bg-brand text-white' : 'border-border bg-bg'"
		>
			<svg v-if="modelValue" viewBox="0 0 20 20" fill="currentColor" class="size-3.5">
				<path
					fill-rule="evenodd"
					d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.3 3.3 6.8-6.8a1 1 0 0 1 1.4 0Z"
					clip-rule="evenodd"
				/>
			</svg>
		</span>
		<span class="min-w-0">
			<span
				class="block text-base text-fg"
				:class="{ 'line-through text-fg-muted': modelValue }"
			>
				{{ label }}
			</span>
			<span v-if="note" class="block text-sm text-fg-muted">{{ note }}</span>
		</span>
	</button>
</template>
