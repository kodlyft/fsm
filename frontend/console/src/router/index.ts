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
				path: "/",
				name: "dispatch",
				component: () => import("@/views/DispatchBoardView.vue"),
			},
			{ path: "/jobs", name: "jobs", component: () => import("@/views/JobsView.vue") },
			{
				path: "/jobs/new",
				name: "job-new",
				component: () => import("@/views/NewJobView.vue"),
			},
			{
				path: "/jobs/:name",
				name: "job-detail",
				component: () => import("@/views/JobDetailView.vue"),
				props: true,
			},
			{
				path: "/inventory",
				name: "inventory",
				component: () => import("@/views/InventoryView.vue"),
			},
			{
				path: "/returns",
				name: "returns",
				component: () => import("@/views/ReturnsView.vue"),
			},
			{
				path: "/account",
				name: "account",
				component: () => import("@/views/AccountView.vue"),
			},
		],
	},
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
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
