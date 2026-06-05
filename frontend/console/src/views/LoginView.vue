<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { KlButton } from "@kodlyft/ui";

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
	<div class="flex min-h-screen items-center justify-center bg-bg-subtle p-4">
		<form
			class="w-full max-w-sm rounded-lg border border-border bg-bg p-6 shadow-card"
			@submit.prevent="submit"
		>
			<div class="mb-6 flex items-center gap-2">
				<span class="size-8 rounded-md bg-brand"></span>
				<span class="text-2xl font-bold">KodLyft</span>
			</div>
			<h1 class="mb-1 text-xl font-bold">Sign in</h1>
			<p class="mb-6 text-sm text-fg-muted">Field service console</p>

			<label class="mb-1 block text-sm font-medium" for="usr">Email</label>
			<input
				id="usr"
				v-model="usr"
				type="email"
				autocomplete="username"
				required
				class="mb-4 w-full rounded-md border border-border bg-bg px-3 py-2 text-base focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
			/>

			<label class="mb-1 block text-sm font-medium" for="pwd">Password</label>
			<input
				id="pwd"
				v-model="pwd"
				type="password"
				autocomplete="current-password"
				required
				class="mb-4 w-full rounded-md border border-border bg-bg px-3 py-2 text-base focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
			/>

			<p v-if="error" class="mb-4 text-sm text-danger">{{ error }}</p>

			<KlButton type="submit" :disabled="busy" block>
				{{ busy ? "Signing in…" : "Sign in" }}
			</KlButton>
		</form>
	</div>
</template>
