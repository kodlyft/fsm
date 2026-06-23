import { ref, readonly } from "vue";

export type Theme = "dark" | "light";

const KEY = "kl-theme";
const current = ref<Theme>("dark");

function apply(t: Theme) {
	document.documentElement.classList.toggle("kl-theme-light", t === "light");
}

/** Read the saved preference and apply it. Call once before mount. */
export function initTheme() {
	const saved = (localStorage.getItem(KEY) as Theme | null) ?? "dark";
	current.value = saved === "light" ? "light" : "dark";
	apply(current.value);
}

export function setTheme(t: Theme) {
	current.value = t;
	localStorage.setItem(KEY, t);
	apply(t);
}

export function toggleTheme() {
	setTheme(current.value === "dark" ? "light" : "dark");
}

export const theme = readonly(current);
