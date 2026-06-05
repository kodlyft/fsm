<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { StatusPill, Spinner, KlButton, STATUS_LABEL, type JobStatus } from "@kodlyft/ui";
import { getJob, updateJobStatus, createInvoiceFromJob, type JobDoc } from "@/lib/fsm";

const props = defineProps<{ name: string }>();

const job = ref<JobDoc | null>(null);
const loading = ref(true);
const error = ref("");
const saving = ref(false);
const invoicing = ref(false);

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

const STATUSES: JobStatus[] = [
	"Draft",
	"Scheduled",
	"Assigned",
	"In Progress",
	"On Hold",
	"Completed",
	"Cancelled",
];

const currency = (n?: number) =>
	new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n ?? 0);

const datetime = (iso?: string) =>
	iso
		? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
		: "—";

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

async function changeStatus(status: JobStatus) {
	if (!job.value) return;
	saving.value = true;
	try {
		job.value = await updateJobStatus(job.value.name, status);
	} catch {
		error.value = "Couldn't update status.";
	} finally {
		saving.value = false;
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
			v-else-if="error"
			class="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
		>
			{{ error }}
		</div>

		<div v-else-if="job" class="space-y-6">
			<div class="flex flex-wrap items-start justify-between gap-3">
				<div>
					<div class="flex items-center gap-3">
						<h1 class="text-2xl font-bold text-fg">
							{{ job.customer_name || job.customer }}
						</h1>
						<StatusPill :status="job.status" />
					</div>
					<p class="mt-0.5 font-mono text-sm text-fg-muted">{{ job.name }}</p>
				</div>
				<div class="flex items-center gap-2">
					<Spinner v-if="saving" :size="18" />
					<select
						:value="job.status"
						class="rounded-md border border-border bg-bg px-3 py-2 text-sm focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
						@change="
							changeStatus(($event.target as HTMLSelectElement).value as JobStatus)
						"
					>
						<option v-for="s in STATUSES" :key="s" :value="s">
							{{ STATUS_LABEL[s] }}
						</option>
					</select>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div class="space-y-6 lg:col-span-2">
					<!-- Checklist -->
					<section class="rounded-lg border border-border bg-bg shadow-card">
						<h2 class="border-b border-border px-4 py-3 text-lg font-bold">
							Checklist
						</h2>
						<ul v-if="job.tasks?.length" class="divide-y divide-border">
							<li
								v-for="(t, i) in job.tasks"
								:key="i"
								class="flex items-start gap-3 px-4 py-3"
							>
								<span
									class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border"
									:class="
										t.completed
											? 'border-brand bg-brand text-white'
											: 'border-border'
									"
								>
									<span v-if="t.completed" class="text-xs">✓</span>
								</span>
								<div>
									<p
										class="text-base"
										:class="{ 'text-fg-muted line-through': t.completed }"
									>
										{{ t.task }}
									</p>
									<p v-if="t.note" class="text-sm text-fg-muted">{{ t.note }}</p>
								</div>
							</li>
						</ul>
						<p v-else class="px-4 py-6 text-sm text-fg-muted">No checklist tasks.</p>
					</section>

					<!-- Items -->
					<section class="rounded-lg border border-border bg-bg shadow-card">
						<h2 class="border-b border-border px-4 py-3 text-lg font-bold">
							Parts &amp; services
						</h2>
						<table v-if="job.items?.length" class="w-full text-left text-sm">
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
									<td class="px-4 py-2">{{ it.item_name || it.item_code }}</td>
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
						<p v-else class="px-4 py-6 text-sm text-fg-muted">No items added.</p>
					</section>

					<section
						v-if="job.notes"
						class="rounded-lg border border-border bg-bg p-4 shadow-card"
					>
						<h2 class="mb-2 text-lg font-bold">Notes</h2>
						<p class="whitespace-pre-line text-sm text-fg">{{ job.notes }}</p>
					</section>
				</div>

				<!-- Sidebar -->
				<aside class="space-y-3 rounded-lg border border-border bg-bg p-4 shadow-card">
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
					<KlButton
						v-if="job.status !== 'Completed'"
						block
						@click="changeStatus('Completed')"
					>
						Mark completed
					</KlButton>

					<div class="border-t border-border pt-3">
						<p class="mb-1 text-fg-muted">Invoice</p>
						<p v-if="job.sales_invoice" class="font-mono text-sm text-brand-700">
							{{ job.sales_invoice }}
						</p>
						<KlButton
							v-else
							variant="secondary"
							block
							:disabled="invoicing || !job.items?.length"
							@click="generateInvoice"
						>
							<Spinner v-if="invoicing" :size="16" />
							{{ invoicing ? "Creating…" : "Create invoice" }}
						</KlButton>
					</div>
				</aside>
			</div>
		</div>
	</div>
</template>
