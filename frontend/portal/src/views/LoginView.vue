<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Spinner } from "@kodlyft/ui";
import { signIn } from "@/lib/session";

const router = useRouter();
const route = useRoute();

const usr = ref("");
const pwd = ref("");
const busy = ref(false);
const error = ref("");

async function submit() {
	error.value = "";
	busy.value = true;
	try {
		await signIn(usr.value, pwd.value);
		router.push((route.query.redirect as string) || { name: "account" });
	} catch {
		error.value = "Incorrect email or password.";
	} finally {
		busy.value = false;
	}
}
</script>

<template>
	<div class="mx-auto max-w-md">
		<div class="kl-glass rounded-2xl p-7">
			<h1 class="text-2xl font-bold text-cmd-fg">Welcome back</h1>
			<p class="mt-1 text-sm text-cmd-fg-muted">Sign in to see your service history.</p>

			<form class="mt-6 space-y-4" @submit.prevent="submit">
				<label class="block">
					<span class="mb-1.5 block text-sm font-medium text-cmd-fg">Email</span>
					<input
						v-model="usr"
						type="text"
						required
						autocomplete="username"
						class="w-full rounded-xl border border-cmd-border bg-white/5 px-3.5 py-2.5 text-cmd-fg placeholder:text-cmd-fg-muted focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
					/>
				</label>
				<label class="block">
					<span class="mb-1.5 block text-sm font-medium text-cmd-fg">Password</span>
					<input
						v-model="pwd"
						type="password"
						required
						autocomplete="current-password"
						class="w-full rounded-xl border border-cmd-border bg-white/5 px-3.5 py-2.5 text-cmd-fg placeholder:text-cmd-fg-muted focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
					/>
				</label>

				<p v-if="error" class="text-sm text-danger">{{ error }}</p>

				<button
					type="submit"
					:disabled="busy"
					class="kl-grad-brand flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold text-white shadow-e2 transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)] disabled:opacity-60"
				>
					<Spinner v-if="busy" :size="18" />
					{{ busy ? "Signing in…" : "Sign in" }}
				</button>
			</form>

			<p class="mt-5 text-center text-sm text-cmd-fg-muted">
				New here?
				<RouterLink to="/signup" class="font-semibold text-brand"
					>Create an account</RouterLink
				>
			</p>
		</div>
	</div>
</template>
