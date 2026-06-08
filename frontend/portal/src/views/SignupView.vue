<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Spinner } from "@kodlyft/ui";
import { signUp } from "@/lib/session";

const router = useRouter();

const form = ref({ full_name: "", email: "", phone: "", password: "" });
const busy = ref(false);
const error = ref("");

async function submit() {
	error.value = "";
	busy.value = true;
	try {
		await signUp({ ...form.value });
		router.push({ name: "account" });
	} catch (e) {
		error.value =
			(e as { message?: string })?.message ||
			"Couldn't create your account. Please try again.";
	} finally {
		busy.value = false;
	}
}
</script>

<template>
	<div class="mx-auto max-w-md">
		<div class="kl-glass rounded-2xl p-7">
			<h1 class="text-2xl font-bold text-cmd-fg">Create your account</h1>
			<p class="mt-1 text-sm text-cmd-fg-muted">
				Track your visits, see your history, and rebook in one tap.
			</p>

			<form class="mt-6 space-y-4" @submit.prevent="submit">
				<label class="block">
					<span class="mb-1.5 block text-sm font-medium text-cmd-fg">Full name</span>
					<input
						v-model="form.full_name"
						required
						autocomplete="name"
						class="w-full rounded-xl border border-cmd-border bg-white/5 px-3.5 py-2.5 text-cmd-fg placeholder:text-cmd-fg-muted focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
					/>
				</label>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<label class="block">
						<span class="mb-1.5 block text-sm font-medium text-cmd-fg">Email</span>
						<input
							v-model="form.email"
							type="email"
							required
							autocomplete="email"
							class="w-full rounded-xl border border-cmd-border bg-white/5 px-3.5 py-2.5 text-cmd-fg placeholder:text-cmd-fg-muted focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
						/>
					</label>
					<label class="block">
						<span class="mb-1.5 block text-sm font-medium text-cmd-fg">Phone</span>
						<input
							v-model="form.phone"
							type="tel"
							autocomplete="tel"
							class="w-full rounded-xl border border-cmd-border bg-white/5 px-3.5 py-2.5 text-cmd-fg placeholder:text-cmd-fg-muted focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
						/>
					</label>
				</div>
				<label class="block">
					<span class="mb-1.5 block text-sm font-medium text-cmd-fg">Password</span>
					<input
						v-model="form.password"
						type="password"
						required
						autocomplete="new-password"
						minlength="6"
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
					{{ busy ? "Creating…" : "Create account" }}
				</button>
			</form>

			<p class="mt-5 text-center text-sm text-cmd-fg-muted">
				Already have an account?
				<RouterLink to="/login" class="font-semibold text-brand">Sign in</RouterLink>
			</p>
		</div>
	</div>
</template>
