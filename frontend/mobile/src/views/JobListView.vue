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
import { useDuty } from "@/lib/duty";

const router = useRouter();
const { onDuty, busy: dutyBusy, error: dutyError, toggle } = useDuty();
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

				<div class="kl-glass mt-3 flex items-center justify-between gap-3 rounded-2xl p-4">
					<div class="flex items-center gap-2.5">
						<span
							class="size-2.5 rounded-full"
							:class="onDuty ? 'animate-pulse bg-success' : 'bg-cmd-fg-muted'"
							aria-hidden="true"
						/>
						<div>
							<p class="text-sm font-medium text-cmd-fg">
								{{ onDuty ? "On duty" : "Off duty" }}
							</p>
							<p class="text-xs text-cmd-fg-muted">
								{{ onDuty ? "Sharing your location" : "Clock in to take jobs" }}
							</p>
						</div>
					</div>
					<button
						type="button"
						:disabled="dutyBusy"
						class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-[filter] disabled:opacity-60"
						:class="
							onDuty
								? 'border border-border bg-transparent text-cmd-fg'
								: 'kl-grad-brand text-white shadow-e2 hover:brightness-110'
						"
						@click="toggle"
					>
						<IonSpinner v-if="dutyBusy" name="crescent" class="size-4" />
						{{ onDuty ? "Clock out" : "Clock in" }}
					</button>
				</div>
				<p v-if="dutyError" class="mt-2 text-xs text-danger">{{ dutyError }}</p>

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
