<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { StatusPill, Spinner } from "@kodlyft/ui";
import {
	getJob,
	startJobTask,
	completeJobTask,
	completeJob,
	createInvoiceFromJob,
	type JobDoc,
} from "@/lib/fsm";

const props = defineProps<{ name: string }>();

const job = ref<JobDoc | null>(null);
const loading = ref(true);
const error = ref("");
const busyTask = ref<number | null>(null);
const completing = ref(false);
const invoicing = ref(false);
const note = ref("");

const tasks = computed(() => [...(job.value?.tasks ?? [])].sort((a, b) => a.idx - b.idx));
const doneCount = computed(() => tasks.value.filter((t) => t.status === "Done").length);
// The first not-done step is the only actionable one (sequential).
const activeIdx = computed(() => tasks.value.find((t) => t.status !== "Done")?.idx ?? null);
const allDone = computed(() => tasks.value.length > 0 && activeIdx.value === null);

const currency = (n?: number) =>
	new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n ?? 0);

const datetime = (iso?: string) =>
	iso
		? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
		: "—";

const time = (iso?: string) =>
	iso ? new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "";

async function load() {
	loading.value = true;
	error.value = "";
	try {
		job.value = await getJob(props.name);
	} catch {
		error.value = "Couldn't load this job.";
	} finally {
		loading.value = false;
	}
}

async function start(idx: number) {
	if (!job.value) return;
	busyTask.value = idx;
	error.value = "";
	try {
		job.value = await startJobTask(job.value.name, idx);
	} catch {
		error.value = "Couldn't start this step.";
	} finally {
		busyTask.value = null;
	}
}

async function complete(idx: number) {
	if (!job.value) return;
	busyTask.value = idx;
	error.value = "";
	try {
		job.value = await completeJobTask(job.value.name, idx, note.value || undefined);
		note.value = "";
	} catch {
		error.value = "Couldn't complete this step.";
	} finally {
		busyTask.value = null;
	}
}

async function finishJob() {
	if (!job.value) return;
	completing.value = true;
	error.value = "";
	try {
		job.value = await completeJob(job.value.name);
	} catch {
		error.value = "Couldn't complete the job.";
	} finally {
		completing.value = false;
	}
}

async function generateInvoice() {
	if (!job.value) return;
	invoicing.value = true;
	error.value = "";
	try {
		const res = await createInvoiceFromJob(job.value.name);
		job.value = { ...job.value, sales_invoice: res.name };
	} catch {
		error.value =
			"Couldn't create the invoice. Ensure the job has items and a default company.";
	} finally {
		invoicing.value = false;
	}
}

onMounted(load);
</script>

<template>
	<div>
		<RouterLink
			to="/"
			class="mb-4 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
		>
			← Back to dispatch
		</RouterLink>

		<div v-if="loading" class="flex justify-center py-16"><Spinner :size="28" /></div>
		<div
			v-else-if="error && !job"
			class="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
		>
			{{ error }}
		</div>

		<div v-else-if="job" class="space-y-6">
			<div class="flex flex-wrap items-start justify-between gap-3">
				<div>
					<div class="flex flex-wrap items-center gap-3">
						<h1 class="text-2xl font-bold text-fg">
							{{ job.customer_name || job.customer }}
						</h1>
						<StatusPill :status="job.status" />
					</div>
					<p class="mt-0.5 font-mono text-sm text-fg-muted">{{ job.name }}</p>
				</div>
			</div>

			<p v-if="error" class="text-sm text-danger">{{ error }}</p>

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div class="space-y-6 lg:col-span-2">
					<!-- Checklist -->
					<section
						class="rounded-2xl border border-border bg-bg shadow-card backdrop-blur-xl"
					>
						<div
							class="flex items-center justify-between border-b border-border px-4 py-3"
						>
							<h2 class="text-lg font-bold">Checklist</h2>
							<span
								v-if="tasks.length"
								class="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-xs text-fg-muted tabular-nums"
							>
								{{ doneCount }}/{{ tasks.length }}
							</span>
						</div>

						<ul v-if="tasks.length" class="divide-y divide-border">
							<li
								v-for="t in tasks"
								:key="t.idx"
								class="flex items-start gap-3 px-4 py-3"
								:class="{
									'opacity-50': t.status !== 'Done' && t.idx !== activeIdx,
								}"
							>
								<!-- State icon -->
								<span
									class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border"
									:class="
										t.status === 'Done'
											? 'border-brand bg-brand text-white'
											: t.idx === activeIdx
												? 'border-brand text-brand'
												: 'border-border text-fg-muted'
									"
								>
									<svg
										v-if="t.status === 'Done'"
										viewBox="0 0 24 24"
										class="size-3.5"
										fill="none"
										stroke="currentColor"
										stroke-width="3"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<path d="M20 6 9 17l-5-5" />
									</svg>
									<span v-else class="font-mono text-xs">{{ t.idx }}</span>
								</span>

								<div class="min-w-0 flex-1">
									<p
										class="text-base"
										:class="{
											'text-fg-muted line-through': t.status === 'Done',
										}"
									>
										{{ t.task }}
									</p>
									<p
										v-if="t.note"
										class="text-sm text-fg-muted"
										:class="{ 'line-through': t.status === 'Done' }"
									>
										{{ t.note }}
									</p>
									<p
										v-if="t.status === 'Done' && t.completed_on"
										class="mt-0.5 text-xs text-fg-muted"
									>
										Done at {{ time(t.completed_on) }}
									</p>

									<!-- Active step controls -->
									<div v-if="t.idx === activeIdx" class="mt-2">
										<button
											v-if="t.status === 'Pending'"
											type="button"
											:disabled="busyTask === t.idx"
											class="kl-grad-brand inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-white shadow-e2 transition-[filter] hover:brightness-110 disabled:opacity-60"
											@click="start(t.idx)"
										>
											<Spinner v-if="busyTask === t.idx" :size="14" />
											Start step
										</button>
										<div v-else class="space-y-2">
											<input
												v-model="note"
												placeholder="Add a note (optional)"
												class="w-full rounded-lg border border-border bg-white/5 px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
											/>
											<button
												type="button"
												:disabled="busyTask === t.idx"
												class="kl-grad-brand inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-white shadow-e2 transition-[filter] hover:brightness-110 disabled:opacity-60"
												@click="complete(t.idx)"
											>
												<Spinner v-if="busyTask === t.idx" :size="14" />
												Complete step
											</button>
										</div>
									</div>
									<p
										v-else-if="t.status !== 'Done'"
										class="mt-1 inline-flex items-center gap-1 text-xs text-fg-muted"
									>
										<svg
											viewBox="0 0 24 24"
											class="size-3.5"
											fill="none"
											stroke="currentColor"
											stroke-width="1.8"
											aria-hidden="true"
										>
											<rect x="5" y="11" width="14" height="9" rx="2" />
											<path d="M8 11V8a4 4 0 0 1 8 0v3" />
										</svg>
										Locked
									</p>
								</div>
							</li>
						</ul>

						<div v-else class="px-4 py-6">
							<p class="text-sm text-fg-muted">
								No checklist on this job. Mark it complete when the work is done.
							</p>
							<button
								v-if="job.status !== 'Completed'"
								type="button"
								:disabled="completing"
								class="kl-grad-brand mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-white shadow-e2 transition-[filter] hover:brightness-110 disabled:opacity-60"
								@click="finishJob"
							>
								<Spinner v-if="completing" :size="14" />
								Mark visit complete
							</button>
						</div>

						<p
							v-if="allDone"
							class="border-t border-border px-4 py-3 text-sm font-medium text-success"
						>
							All steps complete — job marked completed.
						</p>
					</section>

					<!-- Items -->
					<section
						class="rounded-2xl border border-border bg-bg shadow-card backdrop-blur-xl"
					>
						<h2 class="border-b border-border px-4 py-3 text-lg font-bold">
							Parts &amp; services
						</h2>
						<div class="overflow-x-auto">
							<table
								v-if="job.items?.length"
								class="w-full min-w-md text-left text-sm"
							>
								<thead class="border-b border-border text-fg-muted">
									<tr>
										<th class="px-4 py-2 font-medium">Item</th>
										<th class="px-4 py-2 text-right font-medium">Qty</th>
										<th class="px-4 py-2 text-right font-medium">Rate</th>
										<th class="px-4 py-2 text-right font-medium">Amount</th>
									</tr>
								</thead>
								<tbody>
									<tr
										v-for="(it, i) in job.items"
										:key="i"
										class="border-b border-border last:border-0"
									>
										<td class="px-4 py-2">
											{{ it.item_name || it.item_code }}
										</td>
										<td class="px-4 py-2 text-right font-mono tabular-nums">
											{{ it.qty }}
										</td>
										<td class="px-4 py-2 text-right font-mono tabular-nums">
											{{ currency(it.rate) }}
										</td>
										<td class="px-4 py-2 text-right font-mono tabular-nums">
											{{ currency(it.amount) }}
										</td>
									</tr>
								</tbody>
								<tfoot>
									<tr class="border-t border-border">
										<td class="px-4 py-2 font-medium" colspan="3">Total</td>
										<td
											class="px-4 py-2 text-right font-mono font-medium tabular-nums"
										>
											{{ currency(job.total_amount) }}
										</td>
									</tr>
								</tfoot>
							</table>
						</div>
						<p v-if="!job.items?.length" class="px-4 py-6 text-sm text-fg-muted">
							No items added.
						</p>
					</section>

					<section
						v-if="job.notes"
						class="rounded-2xl border border-border bg-bg p-4 shadow-card backdrop-blur-xl"
					>
						<h2 class="mb-2 text-lg font-bold">Notes</h2>
						<p class="whitespace-pre-line text-sm text-fg">{{ job.notes }}</p>
					</section>
				</div>

				<!-- Sidebar -->
				<aside
					class="space-y-3 rounded-2xl border border-border bg-bg p-4 shadow-card backdrop-blur-xl"
				>
					<dl class="space-y-3 text-sm">
						<div>
							<dt class="text-fg-muted">Scheduled</dt>
							<dd class="text-fg">{{ datetime(job.scheduled_date) }}</dd>
						</div>
						<div>
							<dt class="text-fg-muted">Technician</dt>
							<dd class="text-fg">{{ job.primary_technician || "Unassigned" }}</dd>
						</div>
						<div>
							<dt class="text-fg-muted">Priority</dt>
							<dd class="text-fg">{{ job.priority || "—" }}</dd>
						</div>
						<div>
							<dt class="text-fg-muted">Service type</dt>
							<dd class="text-fg">{{ job.service_type || "—" }}</dd>
						</div>
						<div>
							<dt class="text-fg-muted">Address</dt>
							<dd class="whitespace-pre-line text-fg">
								{{ job.address_display || "—" }}
							</dd>
						</div>
					</dl>

					<div class="border-t border-border pt-3">
						<p class="mb-1 text-fg-muted">Invoice</p>
						<p v-if="job.sales_invoice" class="font-mono text-sm text-brand">
							{{ job.sales_invoice }}
						</p>
						<button
							v-else
							type="button"
							:disabled="invoicing || !job.items?.length"
							class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-bg-subtle disabled:opacity-50"
							@click="generateInvoice"
						>
							<Spinner v-if="invoicing" :size="16" />
							{{ invoicing ? "Creating…" : "Create invoice" }}
						</button>
					</div>
				</aside>
			</div>
		</div>
	</div>
</template>
