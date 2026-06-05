<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Spinner } from "@kodlyft/ui";

const store = useAuthStore();
const router = useRouter();
const route = useRoute();

const usr = ref("");
const pwd = ref("");
const error = ref("");
const busy = ref(false);

async function submit() {
	error.value = "";
	busy.value = true;
	try {
		await store.login(usr.value, pwd.value);
		const redirect = (route.query.redirect as string) || "/";
		router.push(redirect);
	} catch {
		error.value = "Incorrect email or password.";
	} finally {
		busy.value = false;
	}
}
</script>

<template>
	<div class="kl-command flex min-h-screen items-center justify-center p-4">
		<form class="kl-glass w-full max-w-sm rounded-2xl p-7" @submit.prevent="submit">
			<div class="mb-7 flex items-center gap-3">
				<span
					class="kl-grad-brand flex size-10 items-center justify-center rounded-xl shadow-glass"
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
					<p class="text-lg font-bold text-cmd-fg">KodLyft</p>
					<p class="text-xs text-cmd-fg-muted">Field service console</p>
				</div>
			</div>

			<h1 class="mb-1 text-xl font-bold text-cmd-fg">Welcome back</h1>
			<p class="mb-6 text-sm text-cmd-fg-muted">Sign in to your dispatch console.</p>

			<label class="mb-1.5 block text-sm font-medium text-cmd-fg" for="usr">Email</label>
			<input
				id="usr"
				v-model="usr"
				type="text"
				autocomplete="username"
				required
				class="mb-4 w-full rounded-xl border border-cmd-border bg-white/5 px-3.5 py-2.5 text-base text-cmd-fg placeholder:text-cmd-fg-muted focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
			/>

			<label class="mb-1.5 block text-sm font-medium text-cmd-fg" for="pwd">Password</label>
			<input
				id="pwd"
				v-model="pwd"
				type="password"
				autocomplete="current-password"
				required
				class="mb-4 w-full rounded-xl border border-cmd-border bg-white/5 px-3.5 py-2.5 text-base text-cmd-fg placeholder:text-cmd-fg-muted focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
			/>

			<p v-if="error" class="mb-4 text-sm text-danger">{{ error }}</p>

			<button
				type="submit"
				:disabled="busy"
				class="kl-grad-brand flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold text-white shadow-e2 transition-[filter] duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)] disabled:opacity-60"
			>
				<Spinner v-if="busy" :size="18" />
				{{ busy ? "Signing in…" : "Sign in" }}
			</button>
		</form>
	</div>
</template>
