import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes: RouteRecordRaw[] = [
	{
		path: "/login",
		name: "login",
		component: () => import("@/views/LoginView.vue"),
		meta: { public: true },
	},
	{
		path: "/",
		component: () => import("@/layouts/AppShell.vue"),
		children: [
			{
				path: "",
				name: "dispatch",
				component: () => import("@/views/DispatchBoardView.vue"),
			},
			{ path: "jobs", name: "jobs", component: () => import("@/views/JobsView.vue") },
		],
	},
];

// Assets load from /assets/fsm/console/, but users navigate under /console.
const base = import.meta.env.DEV ? "/" : "/console/";

const router = createRouter({
	history: createWebHistory(base),
	routes,
});

router.beforeEach(async (to) => {
	const store = useAuthStore();
	if (!store.ready) await store.load();
	if (!to.meta.public && !store.isAuthenticated) {
		return { name: "login", query: { redirect: to.fullPath } };
	}
	if (to.name === "login" && store.isAuthenticated) {
		return { path: "/" };
	}
	return true;
});

export default router;
