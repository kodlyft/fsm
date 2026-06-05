<script setup lang="ts">
import { ref } from "vue";
import { KlButton, Spinner } from "@kodlyft/ui";
import { bookAppointment } from "@/lib/api";

const services = [
	{ key: "HVAC repair", icon: "❄️" },
	{ key: "Plumbing", icon: "🔧" },
	{ key: "Electrical", icon: "⚡" },
	{ key: "Appliance repair", icon: "🧰" },
	{ key: "Pest control", icon: "🐜" },
	{ key: "Other", icon: "🛠️" },
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
		<h1 class="text-3xl font-bold">Book a service</h1>
		<p class="mt-1 text-fg-muted">
			Tell us what you need, we'll confirm a time and text you a live tracking link.
		</p>

		<form class="mt-8 space-y-6" @submit.prevent="submit">
			<fieldset>
				<legend class="mb-2 text-sm font-medium">What do you need help with?</legend>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
					<button
						v-for="s in services"
						:key="s.key"
						type="button"
						class="flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors cursor-pointer"
						:class="
							form.service_type === s.key
								? 'border-brand bg-brand-50 text-brand-700'
								: 'border-border bg-bg hover:bg-bg-subtle'
						"
						@click="form.service_type = s.key"
					>
						<span class="text-2xl">{{ s.icon }}</span>
						<span class="text-sm font-medium">{{ s.key }}</span>
					</button>
				</div>
			</fieldset>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<label class="block">
					<span class="mb-1 block text-sm font-medium">Your name</span>
					<input
						v-model="form.customer_name"
						required
						class="w-full rounded-md border border-border bg-bg px-3 py-2 focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
					/>
				</label>
				<label class="block">
					<span class="mb-1 block text-sm font-medium">Phone</span>
					<input
						v-model="form.contact_phone"
						type="tel"
						required
						class="w-full rounded-md border border-border bg-bg px-3 py-2 focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
					/>
				</label>
			</div>

			<label class="block">
				<span class="mb-1 block text-sm font-medium">Service address</span>
				<input
					v-model="form.service_address"
					required
					class="w-full rounded-md border border-border bg-bg px-3 py-2 focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
				/>
			</label>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<label class="block">
					<span class="mb-1 block text-sm font-medium">Preferred date &amp; time</span>
					<input
						v-model="form.preferred_date"
						type="datetime-local"
						class="w-full rounded-md border border-border bg-bg px-3 py-2 focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
					/>
				</label>
			</div>

			<label class="block">
				<span class="mb-1 block text-sm font-medium">Anything else?</span>
				<textarea
					v-model="form.notes"
					rows="3"
					class="w-full rounded-md border border-border bg-bg px-3 py-2 focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
				></textarea>
			</label>

			<p v-if="error" class="text-sm text-danger">{{ error }}</p>

			<KlButton type="submit" :disabled="busy" block>
				<Spinner v-if="busy" :size="18" /> {{ busy ? "Sending…" : "Request appointment" }}
			</KlButton>
		</form>
	</div>

	<div v-else class="rounded-lg border border-border bg-bg p-8 text-center shadow-card">
		<div
			class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-success/15"
		>
			<span class="text-3xl text-success">✓</span>
		</div>
		<h2 class="text-2xl font-bold">Request received</h2>
		<p class="mt-2 text-fg-muted">
			Thanks {{ form.customer_name }}! We'll text {{ form.contact_phone }} to confirm your
			appointment.
		</p>
		<p class="mt-1 font-mono text-sm text-fg-muted">Ref: {{ booked }}</p>
	</div>
</template>
