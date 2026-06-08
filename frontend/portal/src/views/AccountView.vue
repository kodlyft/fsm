<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { StatusPill, Spinner } from "@kodlyft/ui";
import { session } from "@/lib/session";
import { getMyJobs, getMyAppointments, type MyJob, type MyAppointment } from "@/lib/api";

const jobs = ref<MyJob[]>([]);
const appointments = ref<MyAppointment[]>([]);
const loading = ref(true);
const error = ref("");

const ACTIVE = ["Scheduled", "Assigned", "In Progress", "On Hold"];
const activeJobs = computed(() => jobs.value.filter((j) => ACTIVE.includes(j.status)));
const pastJobs = computed(() => jobs.value.filter((j) => !ACTIVE.includes(j.status)));

const APPT_TONE: Record<string, string> = {
	Open: "bg-warning/15 text-warning",
	Scheduled: "bg-info/15 text-info",
	Converted: "bg-success/15 text-success",
	Cancelled: "bg-fg-muted/15 text-fg-muted",
};

const currency = (n?: number) =>
	n == null
		? "—"
		: new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

const date = (iso?: string) =>
	iso
		? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
		: "—";

async function load() {
	loading.value = true;
	error.value = "";
	try {
		[jobs.value, appointments.value] = await Promise.all([getMyJobs(), getMyAppointments()]);
	} catch {
		error.value = "Couldn't load your history. Please try again.";
	} finally {
		loading.value = false;
	}
}

onMounted(load);
</script>

<template>
	<div class="space-y-6">
		<div class="flex flex-wrap items-end justify-between gap-3">
			<div>
				<p class="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
					My account
				</p>
				<h1 class="mt-1 text-2xl font-bold text-cmd-fg sm:text-3xl">
					Hi {{ session.session.full_name || "there" }}
				</h1>
			</div>
			<RouterLink
				to="/"
				class="kl-grad-brand inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-e2 transition-[filter] hover:brightness-110"
			>
				<svg
					viewBox="0 0 24 24"
					class="size-4"
					fill="none"
					stroke="currentColor"
					stroke-width="2.1"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M12 5v14M5 12h14" />
				</svg>
				Book a service
			</RouterLink>
		</div>

		<div v-if="loading" class="flex justify-center py-16"><Spinner :size="28" /></div>

		<div
			v-else-if="error"
			class="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
		>
			{{ error }}
		</div>

		<template v-else>
			<!-- Active jobs -->
			<section>
				<h2 class="mb-3 text-lg font-bold text-cmd-fg">Active visits</h2>
				<div v-if="activeJobs.length" class="space-y-3">
					<RouterLink
						v-for="job in activeJobs"
						:key="job.name"
						:to="{ name: 'track', params: { job: job.name } }"
						class="kl-glass flex items-center justify-between gap-3 rounded-2xl p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-glass-lg"
					>
						<div class="min-w-0">
							<p class="truncate font-semibold text-cmd-fg">
								{{ job.service_type || "Service visit" }}
							</p>
							<p class="truncate text-sm text-cmd-fg-muted">
								{{ date(job.scheduled_date) }}
							</p>
						</div>
						<StatusPill :status="job.status" />
					</RouterLink>
				</div>
				<p
					v-else
					class="rounded-2xl border border-dashed border-cmd-border px-4 py-8 text-center text-sm text-cmd-fg-muted"
				>
					No active visits. Book a service to get started.
				</p>
			</section>

			<!-- History -->
			<section v-if="pastJobs.length">
				<h2 class="mb-3 text-lg font-bold text-cmd-fg">Past visits</h2>
				<div class="kl-glass overflow-hidden rounded-2xl">
					<table class="w-full text-left text-sm">
						<thead class="border-b border-cmd-border text-cmd-fg-muted">
							<tr>
								<th class="px-4 py-3 font-medium">Service</th>
								<th class="px-4 py-3 font-medium">Date</th>
								<th class="px-4 py-3 font-medium">Status</th>
								<th class="px-4 py-3 text-right font-medium">Total</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="job in pastJobs"
								:key="job.name"
								class="border-b border-cmd-border/60 last:border-0"
							>
								<td class="px-4 py-3 text-cmd-fg">
									{{ job.service_type || "Service" }}
								</td>
								<td class="px-4 py-3 text-cmd-fg-muted">
									{{ date(job.completed_on || job.scheduled_date) }}
								</td>
								<td class="px-4 py-3"><StatusPill :status="job.status" /></td>
								<td class="px-4 py-3 text-right font-mono tabular-nums text-cmd-fg">
									{{ currency(job.total_amount) }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>

			<!-- Appointment requests -->
			<section v-if="appointments.length">
				<h2 class="mb-3 text-lg font-bold text-cmd-fg">Requests</h2>
				<div class="space-y-2">
					<div
						v-for="appt in appointments"
						:key="appt.name"
						class="flex items-center justify-between gap-3 rounded-xl border border-cmd-border bg-white/3 px-4 py-3"
					>
						<div class="min-w-0">
							<p class="truncate text-sm font-medium text-cmd-fg">
								{{ appt.service_type || "Service request" }}
							</p>
							<p class="truncate text-xs text-cmd-fg-muted">
								Requested {{ date(appt.preferred_date || appt.creation) }}
							</p>
						</div>
						<span
							class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
							:class="APPT_TONE[appt.status] || APPT_TONE.Open"
						>
							{{ appt.status }}
						</span>
					</div>
				</div>
			</section>
		</template>
	</div>
</template>
