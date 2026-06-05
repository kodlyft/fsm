<script setup lang="ts">
defineProps<{ title: string; description?: string; icon?: string }>();
</script>

<template>
	<div
		class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-bg-subtle px-6 py-12 text-center"
	>
		<div
			v-if="icon"
			class="mb-3 flex size-12 items-center justify-center rounded-full bg-brand-50 text-2xl"
		>
			{{ icon }}
		</div>
		<p class="text-lg font-medium text-fg">{{ title }}</p>
		<p v-if="description" class="mt-1 max-w-sm text-sm text-fg-muted">{{ description }}</p>
		<div class="mt-4"><slot name="action" /></div>
	</div>
</template>
