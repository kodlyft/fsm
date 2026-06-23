<script setup lang="ts">
import { ref, onMounted } from "vue";
import { PageHeader, EmptyState, Spinner } from "@kodlyft/ui";
import {
	listSubcontractors,
	getSubcontractorWork,
	type SubcontractorRow,
	type SubcontractorWork,
} from "@/lib/fsm";

const rows = ref<SubcontractorRow[]>([]);
const loading = ref(true);
const error = ref("");

const selected = ref<string | null>(null);
const work = ref<SubcontractorWork | null>(null);
const loadingWork = ref(false);

const currency = (n?: number | null) =>
	new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n ?? 0);

async function load() {
	loading.value = true;
	error.value = "";
	try {
		rows.value = await listSubcontractors();
	} catch {
		error.value = "Couldn't load subcontractors.";
	} finally {
		loading.value = false;
	}
}

async function open(name: string) {
	selected.value = name;
	work.value = null;
	loadingWork.value = true;
	try {
		work.value = await getSubcontractorWork(name);
	} catch {
		work.value = null;
	} finally {
		loadingWork.value = false;
	}
}

onMounted(load);
</script>

<template>
	<div>
		<PageHeader
			eyebrow="Workforce"
			title="Subcontractors"
			subtitle="External firms and their field workers"
		/>

		<p
			v-if="error"
			class="mb-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger"
		>
			{{ error }}
		</p>

		<div v-if="loading" class="space-y-3">
			<div
				v-for="n in 3"
				:key="n"
				class="h-14 animate-pulse rounded-xl border border-border bg-white/5"
			/>
		</div>

		<EmptyState
			v-else-if="rows.length === 0"
			title="No subcontractors yet"
			description="Add a Subcontractor, then create Technicians with worker type ‘Contractor’ linked to it."
		/>

		<div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="space-y-2 lg:col-span-1">
				<button
					v-for="s in rows"
					:key="s.name"
					type="button"
					class="w-full rounded-xl border px-4 py-3 text-left transition-colors"
					:class="
						selected === s.name
							? 'border-brand bg-brand/5'
							: 'border-border bg-bg hover:bg-surface'
					"
					@click="open(s.name)"
				>
					<div class="flex items-center justify-between gap-2">
						<span class="font-medium text-fg">{{ s.subcontractor_name }}</span>
						<span
							class="rounded-full px-2 py-0.5 text-xs font-medium"
							:class="
								s.status === 'Active'
									? 'bg-success/15 text-success'
									: 'bg-fg-muted/15 text-fg-muted'
							"
						>
							{{ s.status }}
						</span>
					</div>
					<p class="mt-0.5 text-xs text-fg-muted">
						{{ s.territory || "Any territory" }}
						<span v-if="s.hourly_rate"> · {{ currency(s.hourly_rate) }}/hr</span>
					</p>
				</button>
			</div>

			<div class="lg:col-span-2">
				<div
					v-if="loadingWork"
					class="flex justify-center rounded-2xl border border-border bg-bg py-16"
				>
					<Spinner :size="24" />
				</div>
				<div
					v-else-if="work"
					class="space-y-4 rounded-2xl border border-border bg-bg p-4 shadow-card backdrop-blur-xl"
				>
					<div
						class="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-4"
					>
						<div class="bg-bg px-3 py-2.5">
							<p class="text-xs text-fg-muted">Workers</p>
							<p class="font-mono text-lg tabular-nums">
								{{ work.summary.technicians }}
							</p>
						</div>
						<div class="bg-bg px-3 py-2.5">
							<p class="text-xs text-fg-muted">Jobs</p>
							<p class="font-mono text-lg tabular-nums">
								{{ work.summary.completed_jobs }}/{{ work.summary.total_jobs }}
							</p>
						</div>
						<div class="bg-bg px-3 py-2.5">
							<p class="text-xs text-fg-muted">Hours</p>
							<p class="font-mono text-lg tabular-nums">
								{{ work.summary.total_hours }}
							</p>
						</div>
						<div class="bg-bg px-3 py-2.5">
							<p class="text-xs text-fg-muted">Cost</p>
							<p class="font-mono text-lg tabular-nums text-brand">
								{{ currency(work.summary.total_cost) }}
							</p>
						</div>
					</div>

					<div>
						<h3 class="mb-2 text-sm font-bold text-fg">Recent jobs</h3>
						<div v-if="work.jobs.length" class="overflow-x-auto">
							<table class="w-full text-left text-sm">
								<thead class="border-b border-border text-fg-muted">
									<tr>
										<th class="py-2 pr-3 font-medium">Job</th>
										<th class="py-2 pr-3 font-medium">Customer</th>
										<th class="py-2 pr-3 font-medium">Status</th>
										<th class="py-2 text-right font-medium">Cost</th>
									</tr>
								</thead>
								<tbody>
									<tr
										v-for="j in work.jobs"
										:key="j.name"
										class="border-b border-border last:border-0"
									>
										<td class="py-2 pr-3 font-mono text-xs">{{ j.name }}</td>
										<td class="py-2 pr-3">{{ j.customer_name }}</td>
										<td class="py-2 pr-3 text-fg-muted">{{ j.status }}</td>
										<td class="py-2 text-right font-mono tabular-nums">
											{{ currency(j.total_cost) }}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
						<p v-else class="text-sm text-fg-muted">No jobs assigned yet.</p>
					</div>
				</div>
				<EmptyState
					v-else
					title="Select a subcontractor"
					description="Pick a firm on the left to see its workers, jobs and performance."
				/>
			</div>
		</div>
	</div>
</template>
