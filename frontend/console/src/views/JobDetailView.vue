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
	suggestTechnicians,
	assignTechnician,
	getJobLogistics,
	requestParts,
	type JobDoc,
	type TechnicianSuggestion,
	type JobLogistics,
} from "@/lib/fsm";

const props = defineProps<{ name: string }>();

const job = ref<JobDoc | null>(null);
const loading = ref(true);
const error = ref("");
const busyTask = ref<number | null>(null);
const completing = ref(false);
const invoicing = ref(false);
const note = ref("");

const suggestions = ref<TechnicianSuggestion[]>([]);
const loadingSuggestions = ref(false);
const assigningTo = ref<string | null>(null);
const assignError = ref("");

async function loadSuggestions() {
	if (!job.value) return;
	loadingSuggestions.value = true;
	assignError.value = "";
	try {
		suggestions.value = await suggestTechnicians(job.value.name);
	} catch {
		assignError.value = "Couldn't load technician suggestions.";
	} finally {
		loadingSuggestions.value = false;
	}
}

async function assign(technician: string) {
	if (!job.value) return;
	assigningTo.value = technician;
	assignError.value = "";
	try {
		job.value = await assignTechnician(job.value.name, technician);
		suggestions.value = [];
	} catch (e) {
		assignError.value =
			(e as { message?: string })?.message || "Couldn't assign this technician.";
	} finally {
		assigningTo.value = null;
	}
}

const tasks = computed(() => [...(job.value?.tasks ?? [])].sort((a, b) => a.idx - b.idx));
const doneCount = computed(() => tasks.value.filter((t) => t.status === "Done").length);
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

const logistics = ref<JobLogistics | null>(null);
const requesting = ref(false);

async function loadLogistics() {
	try {
		logistics.value = await getJobLogistics(props.name);
	} catch {
		logistics.value = null;
	}
}

async function requestJobParts() {
	if (!job.value?.items?.length) return;
	requesting.value = true;
	error.value = "";
	try {
		const items = job.value.items.map((i) => ({ item_code: i.item_code, qty: i.qty }));
		await requestParts(job.value.name, items);
		await loadLogistics();
	} catch (e) {
		error.value =
			(e as { message?: string })?.message ||
			"Couldn't request parts. Set a van/default warehouse first.";
	} finally {
		requesting.value = false;
	}
}

async function load() {
	loading.value = true;
	error.value = "";
	try {
		job.value = await getJob(props.name);
		loadLogistics();
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
						class="rounded-2xl border border-border bg-bg shadow-card backdrop-blur-xl"
					>
						<div
							class="flex items-center justify-between border-b border-border px-4 py-3"
						>
							<h2 class="text-lg font-bold">Parts &amp; logistics</h2>
							<button
								type="button"
								:disabled="requesting || !job.items?.length"
								class="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg hover:bg-bg-subtle disabled:opacity-50"
								@click="requestJobParts"
							>
								<Spinner v-if="requesting" :size="14" />
								Request parts
							</button>
						</div>

						<div
							v-if="
								logistics &&
								(logistics.material_requests.length ||
									logistics.delivery_notes.length)
							"
							class="divide-y divide-border"
						>
							<div
								v-for="mr in logistics.material_requests"
								:key="mr.name"
								class="flex items-center justify-between px-4 py-2.5 text-sm"
							>
								<div>
									<p class="font-mono text-xs text-fg">{{ mr.name }}</p>
									<p class="text-xs text-fg-muted">
										{{ mr.material_request_type }} · ordered
										{{ Math.round(mr.per_ordered) }}% · received
										{{ Math.round(mr.per_received) }}%
									</p>
								</div>
								<span
									class="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-fg-muted"
								>
									{{ mr.status }}
								</span>
							</div>
							<div
								v-for="dn in logistics.delivery_notes"
								:key="dn.name"
								class="flex items-center justify-between px-4 py-2.5 text-sm"
							>
								<div>
									<p class="font-mono text-xs text-fg">{{ dn.name }}</p>
									<p class="text-xs text-fg-muted">
										Delivery · {{ dn.posting_date }}
									</p>
								</div>
								<span
									class="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-fg-muted"
								>
									{{ dn.status }}
								</span>
							</div>
						</div>
						<p v-else class="px-4 py-6 text-sm text-fg-muted">
							No parts requests yet. Use “Request parts” to transfer this job's items
							to the technician's van.
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
							<dt class="text-fg-muted">Response SLA</dt>
							<dd class="text-fg">
								<span v-if="job.responded_on" class="text-success"
									>Responded {{ datetime(job.responded_on) }}</span
								>
								<span
									v-else-if="job.sla_breached"
									class="inline-flex items-center gap-1 font-medium text-danger"
								>
									<span
										class="size-1.5 rounded-full bg-danger"
										aria-hidden="true"
									/>
									Breached · due {{ datetime(job.promised_response_by) }}
								</span>
								<span v-else-if="job.promised_response_by"
									>Due {{ datetime(job.promised_response_by) }}</span
								>
								<span v-else class="text-fg-muted">—</span>
							</dd>
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

					<div
						v-if="job.status !== 'Completed' && job.status !== 'Cancelled'"
						class="border-t border-border pt-3"
					>
						<div class="mb-2 flex items-center justify-between">
							<p class="text-fg-muted">
								{{
									job.primary_technician
										? "Reassign technician"
										: "Assign technician"
								}}
							</p>
							<button
								type="button"
								:disabled="loadingSuggestions"
								class="text-xs font-medium text-brand hover:underline disabled:opacity-50"
								@click="loadSuggestions"
							>
								{{ loadingSuggestions ? "Finding…" : "Suggest" }}
							</button>
						</div>

						<p v-if="assignError" class="mb-2 text-xs text-danger">{{ assignError }}</p>

						<ul v-if="suggestions.length" class="space-y-2">
							<li
								v-for="s in suggestions"
								:key="s.technician"
								class="rounded-xl border border-border bg-white/2 p-2.5"
							>
								<div class="flex items-center justify-between gap-2">
									<div class="min-w-0">
										<p class="truncate text-sm font-medium text-fg">
											{{ s.technician_name }}
										</p>
										<p class="truncate text-xs text-fg-muted">
											{{ s.reasons.join(" · ") || s.status }}
										</p>
									</div>
									<button
										type="button"
										:disabled="assigningTo !== null"
										class="kl-grad-brand inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white shadow-e2 transition-[filter] hover:brightness-110 disabled:opacity-60"
										@click="assign(s.technician)"
									>
										<Spinner v-if="assigningTo === s.technician" :size="12" />
										Assign
									</button>
								</div>
							</li>
						</ul>
						<p v-else-if="!loadingSuggestions" class="text-xs text-fg-muted">
							Tap “Suggest” to rank available technicians by skill, territory and
							proximity.
						</p>
					</div>
				</aside>
			</div>
		</div>
	</div>
</template>
