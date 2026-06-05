<script setup lang="ts">
import { ref } from "vue";
import {
	IonPage,
	IonHeader,
	IonToolbar,
	IonTitle,
	IonButtons,
	IonBackButton,
	IonContent,
} from "@ionic/vue";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { ChecklistItem, KlButton } from "@kodlyft/ui";

defineProps<{ id: string }>();

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
