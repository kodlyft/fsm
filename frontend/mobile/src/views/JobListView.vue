<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
	IonPage,
	IonHeader,
	IonToolbar,
	IonTitle,
	IonContent,
	IonRefresher,
	IonRefresherContent,
	IonSpinner,
	type RefresherCustomEvent,
} from "@ionic/vue";
import { Network } from "@capacitor/network";
import { useRouter } from "vue-router";
import { JobCard, type JobSummary } from "@kodlyft/ui";
import { getDispatchJobs } from "@/lib/fsm";

const router = useRouter();
const online = ref(true);
const loading = ref(true);
const jobs = ref<JobSummary[]>([]);
let stop: (() => void) | undefined;

const SAMPLE: JobSummary[] = [
	{ name: "JOB-0001", customer: "Acme Cooling Co.", address: "120 Main St", status: "Scheduled" },
	{
		name: "JOB-0002",
		customer: "Bluewater Plumbing",
		address: "44 Oak Ave",
		status: "In Progress",
	},
];

const todayCount = computed(() => jobs.value.length);
const activeCount = computed(() => jobs.value.filter((j) => j.status === "In Progress").length);

async function load() {
	loading.value = true;
	try {
		jobs.value = await getDispatchJobs({ limit: 100 });
	} catch {
		jobs.value = SAMPLE;
	} finally {
		loading.value = false;
	}
}

onMounted(async () => {
	online.value = (await Network.getStatus()).connected;
	const handle = await Network.addListener("networkStatusChange", (s) => {
		online.value = s.connected;
	});
	stop = () => handle.remove();
	await load();
});

onUnmounted(() => stop?.());

function open(name: string) {
	router.push(`/jobs/${name}`);
}

async function refresh(event: RefresherCustomEvent) {
	await load();
	event.target.complete();
}
</script>

<template>
	<IonPage>
		<IonHeader class="ion-no-border">
			<IonToolbar>
				<IonTitle>My jobs</IonTitle>
			</IonToolbar>
		</IonHeader>
		<IonContent :fullscreen="true">
			<IonRefresher slot="fixed" @ionRefresh="refresh($event as RefresherCustomEvent)">
				<IonRefresherContent />
			</IonRefresher>

			<div class="kl-command min-h-full px-4 pb-8">
				<div
					v-if="!online"
					class="mt-2 flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/15 px-3 py-2 text-sm text-warning"
				>
					<svg
						viewBox="0 0 24 24"
						class="size-4 shrink-0"
						fill="none"
						stroke="currentColor"
						stroke-width="1.9"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v4M12 16h.01" />
					</svg>
					Offline — showing saved jobs. Changes sync when you reconnect.
				</div>

				<!-- Hero stat -->
				<div class="kl-glass mt-3 flex items-center justify-between rounded-2xl p-5">
					<div>
						<p class="text-sm text-cmd-fg-muted">Assigned today</p>
						<p class="mt-1 font-mono text-4xl tabular-nums text-cmd-fg">
							{{ todayCount }}
						</p>
					</div>
					<div class="text-right">
						<p class="text-sm text-cmd-fg-muted">In progress</p>
						<p class="mt-1 font-mono text-4xl tabular-nums text-brand">
							{{ activeCount }}
						</p>
					</div>
				</div>

				<div v-if="loading" class="flex justify-center py-12">
					<IonSpinner />
				</div>

				<div v-else class="mt-4 flex flex-col gap-3">
					<JobCard v-for="job in jobs" :key="job.name" :job="job" @open="open" />
				</div>
			</div>
		</IonContent>
	</IonPage>
</template>
