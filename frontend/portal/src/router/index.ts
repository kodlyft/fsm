import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
	{ path: "/", name: "book", component: () => import("@/views/BookingView.vue") },
	{
		path: "/track/:job",
		name: "track",
		component: () => import("@/views/TrackView.vue"),
		props: true,
	},
];

const base = import.meta.env.DEV ? "/" : "/book/";

export default createRouter({
	history: createWebHistory(base),
	routes,
});
