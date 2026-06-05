<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
	PageHeader,
	KpiCard,
	JobCard,
	EmptyState,
	Spinner,
	KlButton,
	type JobSummary,
	type JobStatus,
} from "@kodlyft/ui";
import { getDispatchJobs, getDashboardStats, type DashboardStats } from "@/lib/fsm";

const router = useRouter();

const jobs = ref<JobSummary[]>([]);
const stats = ref<DashboardStats | null>(null);
const loading = ref(true);
const error = ref("");

const COLUMNS: { status: JobStatus; label: string }[] = [
	{ status: "Scheduled", label: "Scheduled" },
	{ status: "Assigned", label: "Assigned" },
	{ status: "In Progress", label: "In progress" },
	{ status: "On Hold", label: "On hold" },
];

const board = computed(() =>
	COLUMNS.map((col) => ({
		...col,
		jobs: jobs.value.filter((j) => j.status === col.status),
	})),
);

const today = new Date().toLocaleDateString(undefined, {
	weekday: "long",
	month: "short",
	day: "numeric",
});

const currency = (n: number) =>
	new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

async function load() {
	loading.value = true;
	error.value = "";
	try {
		[jobs.value, stats.value] = await Promise.all([
			getDispatchJobs({ limit: 200 }),
			getDashboardStats(),
		]);
	} catch {
		error.value = "Couldn't load the dispatch board. Check your connection and try again.";
	} finally {
		loading.value = false;
	}
}

function openJob(name: string) {
	router.push({ name: "job-detail", params: { name } });
}

onMounted(load);
</script>

<template>
	<div>
		<PageHeader title="Dispatch" :subtitle="today">
			<template #actions>
				<KlButton variant="secondary" size="sm" @click="load">Refresh</KlButton>
				<KlButton size="sm" @click="router.push({ name: 'job-new' })">New job</KlButton>
			</template>
		</PageHeader>

		<div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
			<KpiCard label="Open jobs" :value="stats?.open_jobs ?? '—'" mono />
			<KpiCard label="In progress" :value="stats?.in_progress ?? '—'" mono />
			<KpiCard
				label="Completed today"
				:value="stats?.completed_today ?? '—'"
				mono
				tone="success"
			/>
			<KpiCard
				label="Revenue today"
				:value="stats ? currency(stats.revenue_today) : '—'"
				mono
				tone="success"
			/>
		</div>

		<div v-if="loading" class="flex justify-center py-16"><Spinner :size="28" /></div>

		<div
			v-else-if="error"
			class="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
		>
			{{ error }}
		</div>

		<EmptyState
			v-else-if="jobs.length === 0"
			icon="🗓️"
			title="No active jobs"
			description="Scheduled and in-progress jobs will appear on the board here."
		/>

		<div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
			<section v-for="col in board" :key="col.status" class="flex flex-col">
				<div class="mb-2 flex items-center justify-between px-1">
					<h2 class="text-sm font-medium text-fg-muted">{{ col.label }}</h2>
					<span class="font-mono text-xs text-fg-muted tabular-nums">{{
						col.jobs.length
					}}</span>
				</div>
				<div class="flex flex-col gap-3">
					<JobCard v-for="job in col.jobs" :key="job.name" :job="job" @open="openJob" />
					<p
						v-if="col.jobs.length === 0"
						class="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-fg-muted"
					>
						Nothing here
					</p>
				</div>
			</section>
		</div>
	</div>
</template>
