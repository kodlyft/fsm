<script setup lang="ts">
import { RouterView, RouterLink } from "vue-router";
</script>

<template>
	<div class="min-h-screen">
		<header class="border-b border-border">
			<div class="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
				<RouterLink to="/" class="flex items-center gap-2">
					<span class="size-7 rounded-md bg-brand"></span>
					<span class="text-lg font-bold">KodLyft</span>
				</RouterLink>
				<a href="tel:+10000000000" class="text-sm font-medium text-brand-700">Call us</a>
			</div>
		</header>
		<main class="mx-auto max-w-3xl px-4 py-8">
			<RouterView />
		</main>
	</div>
</template>
