<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { Spinner } from "@kodlyft/ui";
import { bookAppointment } from "@/lib/api";
import { session } from "@/lib/session";

type ServiceId = "hvac" | "plumbing" | "electrical" | "appliance" | "pest" | "other";
const services: { id: ServiceId; key: string }[] = [
	{ id: "hvac", key: "HVAC repair" },
	{ id: "plumbing", key: "Plumbing" },
	{ id: "electrical", key: "Electrical" },
	{ id: "appliance", key: "Appliance repair" },
	{ id: "pest", key: "Pest control" },
	{ id: "other", key: "Other" },
];

const form = ref({
	customer_name: "",
	contact_phone: "",
	service_address: "",
	service_type: services[0].key,
	preferred_date: "",
	notes: "",
});

const busy = ref(false);
const error = ref("");
const booked = ref<string | null>(null);

onMounted(() => {
	if (session.session.authenticated && session.session.full_name) {
		form.value.customer_name = session.session.full_name;
	}
});

async function submit() {
	error.value = "";
	busy.value = true;
	try {
		const res = await bookAppointment({ ...form.value });
		booked.value = res.name;
	} catch {
		error.value = "Something went wrong. Please call us or try again.";
	} finally {
		busy.value = false;
	}
}
</script>

<template>
	<div v-if="!booked">
		<p class="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Book a visit</p>
		<h1 class="mt-1 text-3xl font-bold text-cmd-fg">Request a service</h1>
		<p class="mt-1 text-cmd-fg-muted">
			Tell us what you need — we'll confirm a time and send a live tracking link.
		</p>

		<form class="mt-8 space-y-6" @submit.prevent="submit">
			<fieldset>
				<legend class="mb-2 text-sm font-medium text-cmd-fg">
					What do you need help with?
				</legend>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
					<button
						v-for="s in services"
						:key="s.id"
						type="button"
						class="flex cursor-pointer flex-col items-start gap-2 rounded-2xl border p-4 text-left transition duration-200"
						:class="
							form.service_type === s.key
								? 'kl-glass-strong border-transparent text-cmd-fg shadow-glass'
								: 'border-cmd-border bg-white/3 text-cmd-fg-muted hover:bg-white/6'
						"
						@click="form.service_type = s.key"
					>
						<span
							class="flex size-9 items-center justify-center rounded-xl"
							:class="
								form.service_type === s.key
									? 'kl-grad-brand text-white'
									: 'bg-white/5 text-cmd-fg'
							"
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
								<template v-if="s.id === 'hvac'">
									<path d="M12 2v20M4 7l16 10M20 7 4 17" />
								</template>
								<template v-else-if="s.id === 'plumbing'">
									<path
										d="M14.7 6.3a4 4 0 0 1 0 5.6l-1.4 1.4-5.6-5.6 1.4-1.4a4 4 0 0 1 5.6 0zM7.7 7.7 3 12.4V18h5.6l4.7-4.7"
									/>
								</template>
								<template v-else-if="s.id === 'electrical'">
									<path d="M13 2 3 14h8l-1 8 10-12h-8z" />
								</template>
								<template v-else-if="s.id === 'appliance'">
									<rect x="5" y="3" width="14" height="18" rx="2" />
									<path d="M9 7h.01M9 11h.01" />
								</template>
								<template v-else-if="s.id === 'pest'">
									<path
										d="M12 8a4 4 0 0 1 4 4v3a4 4 0 0 1-8 0v-3a4 4 0 0 1 4-4zM9 4l1.5 2M15 4l-1.5 2M4 12h2M18 12h2M5 17l2-1M19 17l-2-1"
									/>
								</template>
								<template v-else>
									<path
										d="M14 7a3.5 3.5 0 0 0-5 4.5l-6 6 2 2 6-6A3.5 3.5 0 0 0 17 8l-2 2-2-2z"
									/>
								</template>
							</svg>
						</span>
						<span class="text-sm font-medium">{{ s.key }}</span>
					</button>
				</div>
			</fieldset>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<label class="block">
					<span class="mb-1.5 block text-sm font-medium text-cmd-fg">Your name</span>
					<input
						v-model="form.customer_name"
						required
						class="w-full rounded-xl border border-cmd-border bg-white/5 px-3.5 py-2.5 text-cmd-fg focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
					/>
				</label>
				<label class="block">
					<span class="mb-1.5 block text-sm font-medium text-cmd-fg">Phone</span>
					<input
						v-model="form.contact_phone"
						type="tel"
						required
						class="w-full rounded-xl border border-cmd-border bg-white/5 px-3.5 py-2.5 text-cmd-fg focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
					/>
				</label>
			</div>

			<label class="block">
				<span class="mb-1.5 block text-sm font-medium text-cmd-fg">Service address</span>
				<input
					v-model="form.service_address"
					required
					class="w-full rounded-xl border border-cmd-border bg-white/5 px-3.5 py-2.5 text-cmd-fg focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
				/>
			</label>

			<label class="block">
				<span class="mb-1.5 block text-sm font-medium text-cmd-fg">
					Preferred date &amp; time
				</span>
				<input
					v-model="form.preferred_date"
					type="datetime-local"
					class="w-full rounded-xl border border-cmd-border bg-white/5 px-3.5 py-2.5 text-cmd-fg focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)] sm:w-auto"
				/>
			</label>

			<label class="block">
				<span class="mb-1.5 block text-sm font-medium text-cmd-fg">Anything else?</span>
				<textarea
					v-model="form.notes"
					rows="3"
					class="w-full rounded-xl border border-cmd-border bg-white/5 px-3.5 py-2.5 text-cmd-fg focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
				></textarea>
			</label>

			<p v-if="error" class="text-sm text-danger">{{ error }}</p>

			<button
				type="submit"
				:disabled="busy"
				class="kl-grad-brand flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-semibold text-white shadow-e2 transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)] disabled:opacity-60"
			>
				<Spinner v-if="busy" :size="18" /> {{ busy ? "Sending…" : "Request appointment" }}
			</button>

			<p v-if="!session.session.authenticated" class="text-center text-sm text-cmd-fg-muted">
				Want to track and rebook easily?
				<RouterLink to="/signup" class="font-semibold text-brand"
					>Create an account</RouterLink
				>
			</p>
		</form>
	</div>

	<div v-else class="kl-glass rounded-2xl p-8 text-center">
		<div
			class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-success/15"
		>
			<svg
				viewBox="0 0 24 24"
				class="size-7 text-success"
				fill="none"
				stroke="currentColor"
				stroke-width="2.2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M20 6 9 17l-5-5" />
			</svg>
		</div>
		<h2 class="text-2xl font-bold text-cmd-fg">Request received</h2>
		<p class="mt-2 text-cmd-fg-muted">
			Thanks {{ form.customer_name }}! We'll text {{ form.contact_phone }} to confirm your
			appointment.
		</p>
		<p class="mt-1 font-mono text-sm text-cmd-fg-muted">Ref: {{ booked }}</p>
		<div class="mt-6">
			<RouterLink
				v-if="session.session.authenticated"
				to="/account"
				class="inline-flex items-center gap-2 rounded-xl border border-cmd-border bg-white/5 px-4 py-2 text-sm font-medium text-cmd-fg transition-colors hover:bg-white/10"
			>
				View my account
			</RouterLink>
			<RouterLink
				v-else
				to="/signup"
				class="kl-grad-brand inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-e2 transition-[filter] hover:brightness-110"
			>
				Create an account to track it
			</RouterLink>
		</div>
	</div>
</template>
