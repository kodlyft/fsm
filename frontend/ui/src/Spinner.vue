<script setup lang="ts">
withDefaults(defineProps<{ size?: number; label?: string }>(), { size: 20, label: "Loading" });
</script>

<template>
	<span
		class="inline-block animate-spin rounded-full border-2 border-border border-t-brand"
		:style="{ width: `${size}px`, height: `${size}px` }"
		role="status"
		:aria-label="label"
	/>
</template>
