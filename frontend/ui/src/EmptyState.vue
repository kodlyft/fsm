<script setup lang="ts">
defineProps<{ title: string; description?: string; icon?: string }>();
</script>

<template>
	<div
		class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-bg/50 px-6 py-14 text-center backdrop-blur-xl"
	>
		<div
			class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand/12 text-brand ring-1 ring-inset ring-brand/20"
		>
			<slot name="icon">
				<svg
					viewBox="0 0 24 24"
					class="size-6"
					fill="none"
					stroke="currentColor"
					stroke-width="1.7"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<rect x="3" y="4" width="18" height="16" rx="2" />
					<path d="M3 9h18M8 4v5" />
				</svg>
			</slot>
		</div>
		<p class="text-lg font-semibold text-fg">{{ title }}</p>
		<p v-if="description" class="mt-1 max-w-sm text-sm text-fg-muted">{{ description }}</p>
		<div class="mt-5"><slot name="action" /></div>
	</div>
</template>
