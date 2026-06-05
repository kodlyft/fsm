<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
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
	type RefresherCustomEvent,
} from "@ionic/vue";
import { Network } from "@capacitor/network";
import { useRouter } from "vue-router";
import { StatusPill, type JobSummary } from "@kodlyft/ui";

const router = useRouter();
const online = ref(true);
let stop: (() => void) | undefined;

// Placeholder — replaced by cached FSM Job data (offline-first) in P0.
const jobs = ref<JobSummary[]>([
	{ name: "JOB-0001", customer: "Acme Cooling Co.", address: "120 Main St", status: "scheduled" },
	{
		name: "JOB-0002",
		customer: "Bluewater Plumbing",
		address: "44 Oak Ave",
		status: "in_progress",
	},
	{ name: "JOB-0003", customer: "Greenfield Pest", address: "7 Elm Rd", status: "overdue" },
]);

onMounted(async () => {
	online.value = (await Network.getStatus()).connected;
	const handle = await Network.addListener("networkStatusChange", (s) => {
		online.value = s.connected;
	});
	stop = () => handle.remove();
});

onUnmounted(() => stop?.());

function open(name: string) {
	router.push(`/jobs/${name}`);
}

function refresh(event: RefresherCustomEvent) {
	// Re-sync with the server when online; here we just complete the refresher.
	setTimeout(() => event.target.complete(), 600);
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

			<IonList>
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
