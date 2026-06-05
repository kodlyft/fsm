import { createRouter, createWebHistory } from "@ionic/vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
	{ path: "/", redirect: "/jobs" },
	{ path: "/jobs", name: "jobs", component: () => import("@/views/JobListView.vue") },
	{
		path: "/jobs/:id",
		name: "job-detail",
		component: () => import("@/views/JobDetailView.vue"),
		props: true,
	},
];

export default createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
});
