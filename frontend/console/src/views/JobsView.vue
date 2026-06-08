<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
	PageHeader,
	StatusPill,
	JobCard,
	EmptyState,
	Spinner,
	STATUS_LABEL,
	type JobSummary,
	type JobStatus,
} from "@kodlyft/ui";
import { getDispatchJobs } from "@/lib/fsm";

const router = useRouter();

const jobs = ref<JobSummary[]>([]);
const loading = ref(true);
const error = ref("");
const search = ref("");
const statusFilter = ref<JobStatus | "">("");

const STATUSES: JobStatus[] = [
	"Draft",
	"Scheduled",
	"Assigned",
	"In Progress",
	"On Hold",
	"Completed",
	"Cancelled",
	"Overdue",
];

const filtered = computed(() =>
	jobs.value.filter((j) => {
		const matchesSearch =
			!search.value ||
			j.customer.toLowerCase().includes(search.value.toLowerCase()) ||
			j.name.toLowerCase().includes(search.value.toLowerCase());
		const matchesStatus = !statusFilter.value || j.status === statusFilter.value;
		return matchesSearch && matchesStatus;
	}),
);

const currency = (n?: number) =>
	n == null
		? "—"
		: new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

async function load() {
	loading.value = true;
	error.value = "";
	try {
		jobs.value = await getDispatchJobs({ limit: 200 });
	} catch {
		error.value = "Couldn't load jobs.";
	} finally {
		loading.value = false;
	}
}

function open(name: string) {
	router.push({ name: "job-detail", params: { name } });
}

onMounted(load);
</script>

<template>
	<div>
		<PageHeader
			eyebrow="All work"
			title="Jobs"
			:subtitle="`${filtered.length} of ${jobs.length}`"
		/>

		<div class="mb-4 flex flex-wrap gap-3">
			<input
				v-model="search"
				type="search"
				placeholder="Search customer or job no."
				class="min-w-56 flex-1 rounded-xl border border-border bg-bg px-3.5 py-2.5 text-base backdrop-blur-xl focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
			/>
			<select
				v-model="statusFilter"
				class="rounded-xl border border-border bg-bg px-3.5 py-2.5 text-base backdrop-blur-xl focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
			>
				<option value="">All statuses</option>
				<option v-for="s in STATUSES" :key="s" :value="s">{{ STATUS_LABEL[s] }}</option>
			</select>
		</div>

		<div v-if="loading" class="flex justify-center py-16"><Spinner :size="28" /></div>
		<div
			v-else-if="error"
			class="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger backdrop-blur-xl"
		>
			{{ error }}
		</div>
		<EmptyState
			v-else-if="filtered.length === 0"
			title="No matching jobs"
			description="Try adjusting your search or status filter."
		/>

		<template v-else>
			<!-- Mobile: cards -->
			<div class="flex flex-col gap-3 md:hidden">
				<JobCard v-for="row in filtered" :key="row.name" :job="row" @open="open" />
			</div>

			<!-- Desktop: table -->
			<div
				class="hidden overflow-hidden rounded-2xl border border-border bg-bg shadow-card backdrop-blur-xl md:block"
			>
				<table class="w-full text-left text-sm">
					<thead class="border-b border-border text-fg-muted">
						<tr>
							<th class="px-4 py-3 font-medium">Job</th>
							<th class="px-4 py-3 font-medium">Customer</th>
							<th class="px-4 py-3 font-medium">Technician</th>
							<th class="px-4 py-3 font-medium">Status</th>
							<th class="px-4 py-3 text-right font-medium">Total</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="row in filtered"
							:key="row.name"
							class="cursor-pointer border-b border-border last:border-0 hover:bg-white/5"
							@click="open(row.name)"
						>
							<td class="px-4 py-3 font-mono">{{ row.name }}</td>
							<td class="px-4 py-3">{{ row.customer }}</td>
							<td class="px-4 py-3 text-fg-muted">{{ row.technician ?? "—" }}</td>
							<td class="px-4 py-3"><StatusPill :status="row.status" /></td>
							<td class="px-4 py-3 text-right font-mono tabular-nums">
								{{ currency(row.total) }}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</template>
	</div>
</template>
