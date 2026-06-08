import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { loadSession, session } from "@/lib/session";

const routes: RouteRecordRaw[] = [
	{ path: "/", name: "book", component: () => import("@/views/BookingView.vue") },
	{ path: "/signup", name: "signup", component: () => import("@/views/SignupView.vue") },
	{ path: "/login", name: "login", component: () => import("@/views/LoginView.vue") },
	{
		path: "/account",
		name: "account",
		component: () => import("@/views/AccountView.vue"),
		meta: { auth: true },
	},
	{
		path: "/track/:job",
		name: "track",
		component: () => import("@/views/TrackView.vue"),
		props: true,
	},
];

const base = import.meta.env.DEV ? "/" : "/book/";

const router = createRouter({
	history: createWebHistory(base),
	routes,
});

router.beforeEach(async (to) => {
	await loadSession();
	if (to.meta.auth && !session.session.authenticated) {
		return { name: "login", query: { redirect: to.fullPath } };
	}
	if ((to.name === "login" || to.name === "signup") && session.session.authenticated) {
		return { name: "account" };
	}
	return true;
});

export default router;
