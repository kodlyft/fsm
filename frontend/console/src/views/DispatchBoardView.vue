<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
	PageHeader,
	KpiCard,
	JobCard,
	EmptyState,
	type JobSummary,
	type JobStatus,
} from "@kodlyft/ui";
import { getDispatchJobs, getDashboardStats, type DashboardStats } from "@/lib/fsm";

const router = useRouter();

const jobs = ref<JobSummary[]>([]);
const stats = ref<DashboardStats | null>(null);
const loading = ref(true);
const error = ref("");

const COLUMNS: { status: JobStatus; label: string; dot: string }[] = [
	{ status: "Scheduled", label: "Scheduled", dot: "bg-warning" },
	{ status: "Assigned", label: "Assigned", dot: "bg-info" },
	{ status: "In Progress", label: "In progress", dot: "bg-brand" },
	{ status: "On Hold", label: "On hold", dot: "bg-fg-muted" },
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
		<PageHeader eyebrow="Today" title="Dispatch board" :subtitle="today">
			<template #actions>
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-xl border border-border bg-bg px-3.5 py-2 text-sm font-medium text-fg backdrop-blur-xl transition-colors hover:bg-surface focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
					@click="load"
				>
					<svg
						viewBox="0 0 24 24"
						class="size-4"
						:class="{ 'animate-spin': loading }"
						fill="none"
						stroke="currentColor"
						stroke-width="1.9"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M21 12a9 9 0 1 1-2.64-6.36" />
						<path d="M21 4v5h-5" />
					</svg>
					Refresh
				</button>
				<button
					type="button"
					class="kl-grad-brand inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-e2 transition-[filter] duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
					@click="router.push({ name: 'job-new' })"
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
					New job
				</button>
			</template>
		</PageHeader>

		<!-- KPI row -->
		<div class="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
			<KpiCard label="Open jobs" :value="stats?.open_jobs ?? '—'" tone="brand">
				<template #icon>
					<svg
						viewBox="0 0 24 24"
						class="size-5"
						fill="none"
						stroke="currentColor"
						stroke-width="1.9"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path
							d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
						/>
					</svg>
				</template>
			</KpiCard>
			<KpiCard label="In progress" :value="stats?.in_progress ?? '—'" tone="warning">
				<template #icon>
					<svg
						viewBox="0 0 24 24"
						class="size-5"
						fill="none"
						stroke="currentColor"
						stroke-width="1.9"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="9" />
						<path d="M12 7v5l3 2" />
					</svg>
				</template>
			</KpiCard>
			<KpiCard label="Completed today" :value="stats?.completed_today ?? '—'" tone="success">
				<template #icon>
					<svg
						viewBox="0 0 24 24"
						class="size-5"
						fill="none"
						stroke="currentColor"
						stroke-width="1.9"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M20 6 9 17l-5-5" />
					</svg>
				</template>
			</KpiCard>
			<KpiCard
				label="Revenue today"
				:value="stats ? currency(stats.revenue_today) : '—'"
				tone="success"
			>
				<template #icon>
					<svg
						viewBox="0 0 24 24"
						class="size-5"
						fill="none"
						stroke="currentColor"
						stroke-width="1.9"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
					</svg>
				</template>
			</KpiCard>
		</div>

		<!-- Loading skeleton -->
		<div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
			<div v-for="c in 4" :key="c" class="flex flex-col gap-3">
				<div class="h-5 w-24 animate-pulse rounded-md bg-white/10" />
				<div
					v-for="n in 2"
					:key="n"
					class="h-24 animate-pulse rounded-2xl border border-border bg-white/5"
				/>
			</div>
		</div>

		<!-- Error -->
		<div
			v-else-if="error"
			class="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger backdrop-blur-xl"
		>
			{{ error }}
		</div>

		<!-- Empty -->
		<EmptyState
			v-else-if="jobs.length === 0"
			title="No active jobs"
			description="Scheduled and in-progress jobs will appear on the board here."
		>
			<template #icon>
				<svg
					viewBox="0 0 24 24"
					class="size-6"
					fill="none"
					stroke="currentColor"
					stroke-width="1.7"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<rect x="3" y="4" width="18" height="17" rx="2" />
					<path d="M3 9h18M8 2v4M16 2v4" />
				</svg>
			</template>
			<template #action>
				<button
					type="button"
					class="kl-grad-brand inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-e2 transition-[filter] hover:brightness-110"
					@click="router.push({ name: 'job-new' })"
				>
					Create the first job
				</button>
			</template>
		</EmptyState>

		<!-- Board -->
		<div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
			<section
				v-for="col in board"
				:key="col.status"
				class="flex flex-col rounded-2xl border border-border bg-white/2 p-3"
			>
				<div class="mb-3 flex items-center justify-between px-1">
					<h2 class="flex items-center gap-2 text-sm font-semibold text-fg">
						<span class="size-2 rounded-full" :class="col.dot" aria-hidden="true" />
						{{ col.label }}
					</h2>
					<span
						class="rounded-full bg-white/5 px-2 py-0.5 font-mono text-xs text-fg-muted tabular-nums"
					>
						{{ col.jobs.length }}
					</span>
				</div>
				<div class="flex flex-col gap-3">
					<JobCard v-for="job in col.jobs" :key="job.name" :job="job" @open="openJob" />
					<p
						v-if="col.jobs.length === 0"
						class="rounded-xl border border-dashed border-border px-3 py-8 text-center text-xs text-fg-muted"
					>
						Nothing here
					</p>
				</div>
			</section>
		</div>
	</div>
</template>
