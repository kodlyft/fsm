/**
 * Shared "on duty" state for the technician: clocking in starts a background GPS
 * watch that pings the backend (fsm.tracking.update_location) so the dispatcher
 * can see the nearest technician in real time. Clocking out stops the watch.
 */

import { ref } from "vue";
import { Geolocation } from "@capacitor/geolocation";
import { clockIn, clockOut, updateLocation } from "./fsm";

const onDuty = ref(false);
const busy = ref(false);
const error = ref("");

let watchId: string | null = null;

async function startWatch() {
	try {
		await Geolocation.requestPermissions();
	} catch {
		// Permission may already be granted, or denied. watchPosition reports the error.
	}
	watchId = await Geolocation.watchPosition(
		{ enableHighAccuracy: true, timeout: 30000 },
		(position, err) => {
			if (err || !position) return;
			const { latitude, longitude, accuracy } = position.coords;
			updateLocation(latitude, longitude, accuracy ?? undefined).catch(() => {});
		},
	);
}

async function stopWatch() {
	if (watchId) {
		await Geolocation.clearWatch({ id: watchId }).catch(() => {});
		watchId = null;
	}
}

export function useDuty() {
	async function clockOn() {
		busy.value = true;
		error.value = "";
		try {
			await clockIn();
			await startWatch();
			onDuty.value = true;
		} catch {
			error.value = "Couldn't clock in. Check your connection.";
		} finally {
			busy.value = false;
		}
	}

	async function clockOff() {
		busy.value = true;
		error.value = "";
		try {
			await stopWatch();
			await clockOut();
			onDuty.value = false;
		} catch {
			error.value = "Couldn't clock out. Check your connection.";
		} finally {
			busy.value = false;
		}
	}

	function toggle() {
		return onDuty.value ? clockOff() : clockOn();
	}

	return { onDuty, busy, error, clockOn, clockOff, toggle };
}
