<script setup lang="ts">
import { RouterView, RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { KlButton } from "@kodlyft/ui";

const store = useAuthStore();
const router = useRouter();

const nav = [
	{ name: "dispatch", label: "Dispatch", to: "/" },
	{ name: "jobs", label: "Jobs", to: "/jobs" },
];

async function signOut() {
	await store.logout();
	router.push({ name: "login" });
}
</script>

<template>
	<div class="flex min-h-screen bg-bg-subtle text-fg">
		<aside class="hidden w-60 shrink-0 flex-col border-r border-border bg-bg p-4 md:flex">
			<div class="mb-6 flex items-center gap-2 px-2">
				<span class="size-7 rounded-md bg-brand"></span>
				<span class="text-lg font-bold">KodLyft</span>
			</div>
			<nav class="flex flex-col gap-1">
				<RouterLink
					v-for="item in nav"
					:key="item.name"
					:to="item.to"
					class="rounded-md px-3 py-2 text-base text-fg-muted hover:bg-bg-subtle"
					active-class="bg-brand-50 text-brand-700"
					exact-active-class="bg-brand-50 text-brand-700"
				>
					{{ item.label }}
				</RouterLink>
			</nav>
		</aside>

		<div class="flex min-w-0 flex-1 flex-col">
			<header
				class="flex items-center justify-between border-b border-border bg-bg px-6 py-3"
			>
				<h1 class="text-xl font-bold">Field service console</h1>
				<div class="flex items-center gap-3">
					<span class="text-sm text-fg-muted">{{
						store.user?.full_name ?? store.user?.name
					}}</span>
					<KlButton variant="ghost" size="sm" @click="signOut">Sign out</KlButton>
				</div>
			</header>
			<main class="flex-1 overflow-auto p-6">
				<RouterView />
			</main>
		</div>
	</div>
</template>
