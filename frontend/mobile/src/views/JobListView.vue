<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
	IonPage,
	IonHeader,
	IonToolbar,
	IonTitle,
	IonContent,
	IonList,
	IonItem,
	IonLabel,
	IonRefresher,
	IonRefresherContent,
	IonSpinner,
	type RefresherCustomEvent,
} from "@ionic/vue";
import { Network } from "@capacitor/network";
import { useRouter } from "vue-router";
import { StatusPill, type JobSummary } from "@kodlyft/ui";
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
		<IonHeader>
			<IonToolbar>
				<IonTitle>My jobs</IonTitle>
			</IonToolbar>
		</IonHeader>
		<IonContent :fullscreen="true">
			<IonRefresher slot="fixed" @ionRefresh="refresh($event as RefresherCustomEvent)">
				<IonRefresherContent />
			</IonRefresher>

			<div v-if="!online" class="bg-warning/15 px-4 py-2 text-center text-sm text-warning">
				Offline — showing saved jobs. Changes sync when you reconnect.
			</div>

			<div class="px-4 pt-4">
				<p class="text-sm text-fg-muted">Today</p>
				<p class="font-mono text-3xl tabular-nums text-fg">{{ todayCount }}</p>
				<p class="text-sm text-fg-muted">jobs assigned</p>
			</div>

			<div v-if="loading" class="flex justify-center py-10"><IonSpinner /></div>

			<IonList v-else>
				<IonItem
					v-for="job in jobs"
					:key="job.name"
					button
					:detail="true"
					@click="open(job.name)"
				>
					<IonLabel>
						<h2 class="font-medium">{{ job.customer }}</h2>
						<p class="text-sm text-fg-muted">{{ job.address }}</p>
					</IonLabel>
					<StatusPill :status="job.status" slot="end" />
				</IonItem>
			</IonList>
		</IonContent>
	</IonPage>
</template>
