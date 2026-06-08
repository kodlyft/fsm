<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; eyebrow?: string }>();
</script>

<template>
	<div class="mb-6 flex flex-wrap items-end justify-between gap-3">
		<div class="min-w-0">
			<p
				v-if="eyebrow"
				class="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand"
			>
				{{ eyebrow }}
			</p>
			<h1 class="text-2xl font-bold tracking-tight text-fg sm:text-3xl">{{ title }}</h1>
			<p v-if="subtitle" class="mt-1 text-sm text-fg-muted">{{ subtitle }}</p>
		</div>
		<div class="flex items-center gap-2">
			<slot name="actions" />
		</div>
	</div>
</template>
