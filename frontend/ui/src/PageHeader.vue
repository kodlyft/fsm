<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>();
</script>

<template>
	<div class="mb-6 flex flex-wrap items-end justify-between gap-3">
		<div class="min-w-0">
			<h1 class="text-2xl font-bold text-fg">{{ title }}</h1>
			<p v-if="subtitle" class="mt-0.5 text-sm text-fg-muted">{{ subtitle }}</p>
		</div>
		<div class="flex items-center gap-2">
			<slot name="actions" />
		</div>
	</div>
</template>
