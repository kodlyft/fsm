<script setup lang="ts">
import { ref } from "vue";
import { KlButton } from "@kodlyft/ui";

const services = ["HVAC repair", "Plumbing", "Electrical", "Appliance repair", "Pest control"];

const form = ref({ name: "", phone: "", address: "", service: services[0], notes: "" });
const submitted = ref(false);

function submit() {
	// Wired to the FSM Appointment doctype in the P0 backend phase.
	submitted.value = true;
}
</script>

<template>
	<div v-if="!submitted">
		<h1 class="text-3xl font-bold">Book a service</h1>
		<p class="mt-1 text-fg-muted">
			Tell us what you need — we'll confirm a time and send a tracking link.
		</p>

		<form class="mt-6 space-y-4" @submit.prevent="submit">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<label class="block">
					<span class="mb-1 block text-sm font-medium">Name</span>
					<input
						v-model="form.name"
						required
						class="w-full rounded-md border border-border bg-bg px-3 py-2 focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
					/>
				</label>
				<label class="block">
					<span class="mb-1 block text-sm font-medium">Phone</span>
					<input
						v-model="form.phone"
						type="tel"
						required
						class="w-full rounded-md border border-border bg-bg px-3 py-2 focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
					/>
				</label>
			</div>
			<label class="block">
				<span class="mb-1 block text-sm font-medium">Service address</span>
				<input
					v-model="form.address"
					required
					class="w-full rounded-md border border-border bg-bg px-3 py-2 focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
				/>
			</label>
			<label class="block">
				<span class="mb-1 block text-sm font-medium">Service</span>
				<select
					v-model="form.service"
					class="w-full rounded-md border border-border bg-bg px-3 py-2 focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
				>
					<option v-for="s in services" :key="s">{{ s }}</option>
				</select>
			</label>
			<label class="block">
				<span class="mb-1 block text-sm font-medium">Notes</span>
				<textarea
					v-model="form.notes"
					rows="3"
					class="w-full rounded-md border border-border bg-bg px-3 py-2 focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
				></textarea>
			</label>
			<KlButton type="submit" block>Request appointment</KlButton>
		</form>
	</div>

	<div v-else class="rounded-lg border border-border bg-bg p-6 text-center shadow-card">
		<div
			class="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-success/15"
		>
			<span class="text-2xl text-success">✓</span>
		</div>
		<h2 class="text-2xl font-bold">Request received</h2>
		<p class="mt-1 text-fg-muted">We'll text {{ form.phone }} to confirm your appointment.</p>
	</div>
</template>
