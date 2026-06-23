<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { theme, setTheme, type Theme } from "@/lib/theme";

const store = useAuthStore();
const router = useRouter();

const displayName = computed(() => store.user?.full_name ?? store.user?.name ?? "");
const initials = computed(() =>
	displayName.value
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0]?.toUpperCase())
		.join(""),
);

const themes: { id: Theme; label: string }[] = [
	{ id: "dark", label: "Dark" },
	{ id: "light", label: "Light" },
];

async function signOut() {
	await store.logout();
	router.push({ name: "login" });
}
</script>

<template>
	<div class="mx-auto max-w-2xl">
		<h1 class="mb-6 text-2xl font-bold text-fg sm:text-3xl">Account</h1>

		<!-- Profile -->
		<section class="kl-glass mb-4 rounded-2xl p-5">
			<div class="flex items-center gap-4">
				<span
					class="kl-grad-brand flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
				>
					{{ initials || "·" }}
				</span>
				<div class="min-w-0">
					<p class="truncate text-lg font-bold text-fg">{{ displayName }}</p>
					<p class="truncate text-sm text-fg-muted">{{ store.user?.email }}</p>
				</div>
			</div>
			<div v-if="store.user?.roles?.length" class="mt-4 flex flex-wrap gap-2">
				<span
					v-for="role in store.user.roles"
					:key="role"
					class="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-fg-muted"
				>
					{{ role }}
				</span>
			</div>
		</section>

		<!-- Appearance -->
		<section class="kl-glass mb-4 rounded-2xl p-5">
			<h2 class="text-lg font-bold text-fg">Appearance</h2>
			<p class="mt-0.5 text-sm text-fg-muted">Choose how the console looks.</p>
			<div
				class="mt-4 inline-flex rounded-xl border border-border bg-white/5 p-1"
				role="group"
				aria-label="Theme"
			>
				<button
					v-for="t in themes"
					:key="t.id"
					type="button"
					class="rounded-lg px-4 py-1.5 text-sm font-medium transition-colors"
					:class="
						theme === t.id
							? 'kl-grad-brand text-white shadow-e2'
							: 'text-fg-muted hover:text-fg'
					"
					:aria-pressed="theme === t.id"
					@click="setTheme(t.id)"
				>
					{{ t.label }}
				</button>
			</div>
		</section>

		<!-- Security & session -->
		<section class="kl-glass rounded-2xl p-5">
			<h2 class="text-lg font-bold text-fg">Account &amp; security</h2>
			<div class="mt-4 flex flex-col gap-2 sm:flex-row">
				<a
					href="/update-password"
					class="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-bg-subtle"
				>
					Change password
				</a>
				<button
					type="button"
					class="inline-flex items-center justify-center gap-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/20"
					@click="signOut"
				>
					Sign out
				</button>
			</div>
		</section>
	</div>
</template>
