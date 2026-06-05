<script setup lang="ts">
import { computed } from "vue";
import { RouterView, RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const store = useAuthStore();
const router = useRouter();

const nav = [
	{ name: "dispatch", label: "Dispatch", to: "/", exact: true },
	{ name: "jobs", label: "Jobs", to: "/jobs", exact: false },
];

const displayName = computed(() => store.user?.full_name ?? store.user?.name ?? "");
const initials = computed(() =>
	displayName.value
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0]?.toUpperCase())
		.join(""),
);

async function signOut() {
	await store.logout();
	router.push({ name: "login" });
}
</script>

<template>
	<div class="kl-command flex min-h-screen">
		<aside class="sticky top-0 hidden h-screen w-64 shrink-0 flex-col p-4 md:flex">
			<div class="kl-glass flex h-full flex-col rounded-2xl p-4">
				<div class="mb-7 flex items-center gap-3 px-1">
					<span
						class="kl-grad-brand flex size-9 items-center justify-center rounded-xl shadow-glass"
					>
						<svg
							viewBox="0 0 24 24"
							class="size-5 text-white"
							fill="none"
							stroke="currentColor"
							stroke-width="2.2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M13 2 3 14h8l-1 8 10-12h-8z" />
						</svg>
					</span>
					<div class="leading-tight">
						<p class="text-base font-bold tracking-tight text-cmd-fg">KodLyft</p>
						<p class="text-xs text-cmd-fg-muted">Field service</p>
					</div>
				</div>

				<nav class="flex flex-col gap-1.5">
					<RouterLink
						v-for="item in nav"
						:key="item.name"
						:to="item.to"
						class="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-cmd-fg-muted transition-colors duration-200 hover:bg-white/5 hover:text-cmd-fg"
						:active-class="item.exact ? '' : 'nav-active'"
						:exact-active-class="item.exact ? 'nav-active' : ''"
					>
						<svg
							viewBox="0 0 24 24"
							class="size-5 shrink-0"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<template v-if="item.name === 'dispatch'">
								<rect x="3" y="3" width="7" height="9" rx="1.5" />
								<rect x="14" y="3" width="7" height="5" rx="1.5" />
								<rect x="14" y="12" width="7" height="9" rx="1.5" />
								<rect x="3" y="16" width="7" height="5" rx="1.5" />
							</template>
							<template v-else>
								<rect x="8" y="2" width="8" height="4" rx="1" />
								<path
									d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
								/>
								<path d="M9 12h6M9 16h6" />
							</template>
						</svg>
						<span>{{ item.label }}</span>
					</RouterLink>
				</nav>

				<div class="mt-auto rounded-xl border border-cmd-border bg-white/3 p-3">
					<div class="flex items-center gap-3">
						<span
							class="kl-grad-brand flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
						>
							{{ initials || "·" }}
						</span>
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-medium text-cmd-fg">
								{{ displayName }}
							</p>
							<button
								type="button"
								class="text-xs text-cmd-fg-muted transition-colors hover:text-cmd-fg"
								@click="signOut"
							>
								Sign out
							</button>
						</div>
					</div>
				</div>
			</div>
		</aside>

		<div class="flex min-w-0 flex-1 flex-col">
			<header
				class="kl-glass sticky top-0 z-20 flex items-center justify-between px-4 py-3 md:hidden"
			>
				<div class="flex items-center gap-2.5">
					<span class="kl-grad-brand flex size-8 items-center justify-center rounded-lg">
						<svg
							viewBox="0 0 24 24"
							class="size-4 text-white"
							fill="none"
							stroke="currentColor"
							stroke-width="2.2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M13 2 3 14h8l-1 8 10-12h-8z" />
						</svg>
					</span>
					<span class="text-base font-bold text-cmd-fg">KodLyft</span>
				</div>
				<button
					type="button"
					class="flex size-9 items-center justify-center rounded-full bg-white/5 text-sm font-bold text-cmd-fg"
					aria-label="Sign out"
					@click="signOut"
				>
					{{ initials || "·" }}
				</button>
			</header>

			<main class="flex-1 overflow-auto p-4 pb-28 sm:p-6 md:pb-6">
				<RouterView />
			</main>

			<nav
				class="kl-glass fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-2xl px-2 py-2 md:hidden"
				style="padding-bottom: calc(0.5rem + env(safe-area-inset-bottom))"
			>
				<RouterLink
					v-for="item in nav"
					:key="item.name"
					:to="item.to"
					class="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-xs font-medium text-cmd-fg-muted transition-colors"
					:active-class="item.exact ? '' : 'tab-active'"
					:exact-active-class="item.exact ? 'tab-active' : ''"
				>
					<svg
						viewBox="0 0 24 24"
						class="size-5"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<template v-if="item.name === 'dispatch'">
							<rect x="3" y="3" width="7" height="9" rx="1.5" />
							<rect x="14" y="3" width="7" height="5" rx="1.5" />
							<rect x="14" y="12" width="7" height="9" rx="1.5" />
							<rect x="3" y="16" width="7" height="5" rx="1.5" />
						</template>
						<template v-else>
							<rect x="8" y="2" width="8" height="4" rx="1" />
							<path
								d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
							/>
							<path d="M9 12h6M9 16h6" />
						</template>
					</svg>
					<span>{{ item.label }}</span>
				</RouterLink>
			</nav>
		</div>
	</div>
</template>

<style scoped>
.nav-active {
	background-image: var(--kl-grad-brand);
	color: #fff;
	box-shadow: var(--kl-elevation-e2);
}
.tab-active {
	color: var(--kl-cmd-brand);
}
</style>
