<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView, RouterLink, useRouter } from "vue-router";
import { session, loadSession, signOut } from "@/lib/session";
import { theme, toggleTheme } from "@/lib/theme";

const router = useRouter();

onMounted(() => loadSession());

async function handleSignOut() {
	await signOut();
	router.push({ name: "book" });
}
</script>

<template>
	<div class="kl-command flex min-h-screen flex-col">
		<header class="sticky top-0 z-20">
			<div
				class="kl-glass mx-auto mt-3 flex max-w-3xl items-center justify-between rounded-2xl px-4 py-3"
			>
				<RouterLink to="/" class="flex items-center gap-2.5">
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
					<span class="text-lg font-bold text-cmd-fg">KodLyft</span>
				</RouterLink>

				<nav class="flex items-center gap-1 text-sm sm:gap-2">
					<button
						type="button"
						class="flex size-9 items-center justify-center rounded-lg text-cmd-fg-muted transition-colors hover:bg-white/5 hover:text-cmd-fg"
						:aria-label="
							theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
						"
						@click="toggleTheme"
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
							<template v-if="theme === 'dark'">
								<circle cx="12" cy="12" r="4" />
								<path
									d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"
								/>
							</template>
							<template v-else>
								<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
							</template>
						</svg>
					</button>
					<template v-if="session.session.authenticated">
						<RouterLink
							to="/account"
							class="rounded-lg px-3 py-1.5 font-medium text-cmd-fg-muted transition-colors hover:text-cmd-fg"
							active-class="text-cmd-fg"
						>
							My account
						</RouterLink>
						<button
							type="button"
							class="rounded-lg px-3 py-1.5 font-medium text-cmd-fg-muted transition-colors hover:text-cmd-fg"
							@click="handleSignOut"
						>
							Sign out
						</button>
					</template>
					<template v-else>
						<RouterLink
							to="/login"
							class="rounded-lg px-3 py-1.5 font-medium text-cmd-fg-muted transition-colors hover:text-cmd-fg"
						>
							Sign in
						</RouterLink>
						<RouterLink
							to="/signup"
							class="kl-grad-brand rounded-lg px-3.5 py-1.5 font-semibold text-white shadow-e2 transition-[filter] hover:brightness-110"
						>
							Sign up
						</RouterLink>
					</template>
				</nav>
			</div>
		</header>

		<main class="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
			<RouterView />
		</main>

		<footer
			class="mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-cmd-fg-muted sm:flex-row"
		>
			<span>© KodLyft</span>
			<span>Fast, friendly field service.</span>
		</footer>
	</div>
</template>
