import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { SessionUser } from "@kodlyft/api";
import { auth } from "@/lib/api";

export const useAuthStore = defineStore("auth", () => {
	const user = ref<SessionUser | null>(null);
	const ready = ref(false);
	const loading = ref(false);

	const isAuthenticated = computed(() => user.value !== null);

	async function load() {
		loading.value = true;
		try {
			user.value = await auth.session();
		} catch {
			user.value = null;
		} finally {
			loading.value = false;
			ready.value = true;
		}
	}

	async function login(usr: string, pwd: string) {
		await auth.login(usr, pwd);
		await load();
	}

	async function logout() {
		await auth.logout();
		user.value = null;
	}

	return { user, ready, loading, isAuthenticated, load, login, logout };
});
