<script setup lang="ts">
import { ref, onMounted } from "vue";
import { StatusPill } from "@kodlyft/ui";
import {
	getJobMessages,
	postJobMessage,
	getJobFeedback,
	submitJobFeedback,
	type JobMessage,
	type JobFeedback,
} from "@/lib/api";

const props = defineProps<{ job: string }>();

const timeline = [
	{ label: "Request received", done: true },
	{ label: "Appointment confirmed", done: true },
	{ label: "Technician on the way", done: true, active: true },
	{ label: "Job completed", done: false },
];

const messages = ref<JobMessage[]>([]);
const newMessage = ref("");
const sending = ref(false);

async function loadMessages() {
	try {
		messages.value = await getJobMessages(props.job);
	} catch {
		messages.value = [];
	}
}

async function send() {
	const text = newMessage.value.trim();
	if (!text) return;
	sending.value = true;
	try {
		await postJobMessage(props.job, text);
		newMessage.value = "";
		await loadMessages();
	} finally {
		sending.value = false;
	}
}

const datetime = (iso: string) =>
	new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const feedback = ref<JobFeedback | null>(null);
const stars = ref(0);
const comments = ref("");
const submitting = ref(false);
const feedbackError = ref("");

async function loadFeedback() {
	try {
		feedback.value = await getJobFeedback(props.job);
	} catch {
		feedback.value = null;
	}
}

async function rate() {
	if (!stars.value) return;
	submitting.value = true;
	feedbackError.value = "";
	try {
		await submitJobFeedback(props.job, stars.value, comments.value || undefined);
		await loadFeedback();
	} catch (e) {
		feedbackError.value =
			(e as { message?: string })?.message || "Couldn't submit your rating.";
	} finally {
		submitting.value = false;
	}
}

onMounted(() => {
	loadMessages();
	loadFeedback();
});
</script>

<template>
	<div class="space-y-6">
		<div class="flex items-center justify-between gap-3">
			<div>
				<h1 class="text-2xl font-bold text-cmd-fg">Your technician is on the way</h1>
				<p class="mt-0.5 font-mono text-sm text-cmd-fg-muted">{{ job }}</p>
			</div>
			<StatusPill status="In Progress" />
		</div>

		<div
			class="flex h-48 items-center justify-center rounded-2xl border border-cmd-border bg-white/3 text-cmd-fg-muted"
		>
			Live map (Leaflet)
		</div>

		<ol class="relative ml-2 space-y-5 border-l border-cmd-border pl-6">
			<li v-for="(step, i) in timeline" :key="i" class="relative">
				<span
					class="absolute -left-7.75 flex size-4 items-center justify-center rounded-full"
					:class="step.done ? 'bg-brand' : 'border border-cmd-border bg-cmd-bg'"
				>
					<span
						v-if="step.active"
						class="absolute size-4 animate-ping rounded-full bg-brand/40"
					/>
				</span>
				<p
					class="text-sm"
					:class="step.active ? 'font-medium text-cmd-fg' : 'text-cmd-fg-muted'"
				>
					{{ step.label }}
				</p>
			</li>
		</ol>
		<section class="kl-glass rounded-2xl p-4">
			<h2 class="mb-3 text-lg font-bold text-cmd-fg">Messages</h2>
			<div class="max-h-64 space-y-3 overflow-y-auto">
				<p v-if="messages.length === 0" class="text-sm text-cmd-fg-muted">
					No messages yet. Send a note to your technician or our team.
				</p>
				<div v-for="m in messages" :key="m.name" class="text-sm">
					<p class="text-xs text-cmd-fg-muted">
						{{ m.author_role
						}}<span v-if="m.author_name"> · {{ m.author_name }}</span> ·
						{{ datetime(m.creation) }}
					</p>
					<p class="mt-0.5 whitespace-pre-line text-cmd-fg">{{ m.message }}</p>
				</div>
			</div>
			<div class="mt-3 flex gap-2">
				<input
					v-model="newMessage"
					placeholder="Write a message…"
					class="flex-1 rounded-lg border border-cmd-border bg-white/5 px-3 py-2 text-sm text-cmd-fg"
					@keydown.enter="send"
				/>
				<button
					type="button"
					:disabled="sending || !newMessage.trim()"
					class="kl-grad-brand rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
					@click="send"
				>
					Send
				</button>
			</div>
		</section>
		<section class="kl-glass rounded-2xl p-4">
			<h2 class="mb-3 text-lg font-bold text-cmd-fg">Rate your service</h2>
			<div v-if="feedback">
				<p class="text-2xl text-warning">
					{{ "★".repeat(feedback.rating)
					}}<span class="text-cmd-fg-muted">{{ "★".repeat(5 - feedback.rating) }}</span>
				</p>
				<p v-if="feedback.comments" class="mt-1 text-sm text-cmd-fg">
					“{{ feedback.comments }}”
				</p>
				<p class="mt-1 text-xs text-cmd-fg-muted">Thanks for your feedback!</p>
			</div>
			<div v-else>
				<div class="flex gap-1" role="radiogroup" aria-label="rating">
					<button
						v-for="n in 5"
						:key="n"
						type="button"
						class="text-3xl transition-transform hover:scale-110"
						:class="n <= stars ? 'text-warning' : 'text-cmd-fg-muted'"
						:aria-label="`${n} star`"
						@click="stars = n"
					>
						★
					</button>
				</div>
				<textarea
					v-model="comments"
					rows="2"
					placeholder="Tell us about your experience (optional)"
					class="mt-3 w-full rounded-lg border border-cmd-border bg-white/5 px-3 py-2 text-sm text-cmd-fg"
				/>
				<p v-if="feedbackError" class="mt-1 text-xs text-danger">{{ feedbackError }}</p>
				<button
					type="button"
					:disabled="submitting || !stars"
					class="kl-grad-brand mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
					@click="rate"
				>
					Submit rating
				</button>
			</div>
		</section>
	</div>
</template>
