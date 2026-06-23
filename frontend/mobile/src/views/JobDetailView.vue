<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import {
	IonPage,
	IonHeader,
	IonToolbar,
	IonTitle,
	IonButtons,
	IonBackButton,
	IonContent,
	IonSpinner,
} from "@ionic/vue";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { ChecklistItem, KlButton } from "@kodlyft/ui";
import { startTimer, stopTimer } from "@/lib/fsm";

const props = defineProps<{ id: string }>();

const timerRunning = ref(false);
const timerBusy = ref(false);
const elapsed = ref(0);
const lastHours = ref<number | null>(null);
const timerError = ref("");
let startedAt = 0;
let tick: ReturnType<typeof setInterval> | undefined;

const clock = (s: number) => {
	const h = Math.floor(s / 3600)
		.toString()
		.padStart(2, "0");
	const m = Math.floor((s % 3600) / 60)
		.toString()
		.padStart(2, "0");
	const sec = Math.floor(s % 60)
		.toString()
		.padStart(2, "0");
	return `${h}:${m}:${sec}`;
};

async function toggleTimer() {
	timerBusy.value = true;
	timerError.value = "";
	try {
		if (timerRunning.value) {
			const res = await stopTimer(props.id);
			lastHours.value = res.actual_hours;
			timerRunning.value = false;
			clearInterval(tick);
			elapsed.value = 0;
		} else {
			await startTimer(props.id);
			timerRunning.value = true;
			startedAt = Date.now();
			tick = setInterval(() => (elapsed.value = (Date.now() - startedAt) / 1000), 1000);
		}
	} catch {
		timerError.value = "Couldn't update the timer. Check your connection.";
	} finally {
		timerBusy.value = false;
	}
}

onUnmounted(() => clearInterval(tick));

const checklist = ref([
	{ label: "Confirm equipment model", note: "Photograph the rating plate", done: false },
	{ label: "Inspect and test unit", done: false },
	{ label: "Replace consumables", done: false },
	{ label: "Customer walkthrough", done: false },
]);

const photos = ref<string[]>([]);

async function addPhoto() {
	try {
		const photo = await Camera.getPhoto({
			quality: 70,
			resultType: CameraResultType.DataUrl,
			source: CameraSource.Camera,
		});
		if (photo.dataUrl) photos.value.push(photo.dataUrl);
	} catch {
		// User cancelled or no camera (e.g. browser dev) — ignore.
	}
}
</script>

<template>
	<IonPage>
		<IonHeader>
			<IonToolbar>
				<IonButtons slot="start">
					<IonBackButton default-href="/jobs" />
				</IonButtons>
				<IonTitle>{{ id }}</IonTitle>
			</IonToolbar>
		</IonHeader>
		<IonContent :fullscreen="true">
			<div class="space-y-6 p-4">
				<section class="rounded-lg border border-border bg-bg p-4">
					<div class="flex items-center justify-between">
						<div>
							<h2 class="text-lg font-bold">Labour timer</h2>
							<p
								class="font-mono text-2xl tabular-nums"
								:class="timerRunning ? 'text-brand' : 'text-fg-muted'"
							>
								{{
									timerRunning
										? clock(elapsed)
										: lastHours != null
											? `${lastHours.toFixed(2)} h logged`
											: "00:00:00"
								}}
							</p>
						</div>
						<button
							type="button"
							:disabled="timerBusy"
							class="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-[filter] disabled:opacity-60"
							:class="
								timerRunning
									? 'border border-danger/40 text-danger'
									: 'kl-grad-brand text-white shadow-e2 hover:brightness-110'
							"
							@click="toggleTimer"
						>
							<IonSpinner v-if="timerBusy" name="crescent" class="size-4" />
							{{ timerRunning ? "Stop" : "Start" }}
						</button>
					</div>
					<p v-if="timerError" class="mt-2 text-xs text-danger">{{ timerError }}</p>
				</section>

				<section>
					<h2 class="mb-2 text-lg font-bold">Checklist</h2>
					<div class="rounded-lg border border-border bg-bg">
						<ChecklistItem
							v-for="(item, i) in checklist"
							:key="i"
							v-model="checklist[i].done"
							:label="item.label"
							:note="item.note"
						/>
					</div>
				</section>

				<section>
					<h2 class="mb-2 text-lg font-bold">Photos</h2>
					<div class="grid grid-cols-3 gap-2">
						<img
							v-for="(src, i) in photos"
							:key="i"
							:src="src"
							class="aspect-square w-full rounded-md object-cover"
						/>
						<button
							type="button"
							class="flex aspect-square items-center justify-center rounded-md border border-dashed border-border text-fg-muted"
							@click="addPhoto"
						>
							+ Add
						</button>
					</div>
				</section>

				<section>
					<h2 class="mb-2 text-lg font-bold">Signature</h2>
					<div
						class="flex h-32 items-center justify-center rounded-lg border border-dashed border-border text-fg-muted"
					>
						Tap to capture customer signature
					</div>
				</section>

				<KlButton block>Complete job</KlButton>
			</div>
		</IonContent>
	</IonPage>
</template>
