/**
 * KodLyft FSM token build.
 * Reads tokens.json (the single source of truth) and generates:
 *   css/kodlyft-tokens.css  — CSS custom properties for the Vue console & portal
 *   css/ionic-variables.css — Ionic variable contract for the mobile app
 *   css/tailwind-theme.css  — Tailwind v4 @theme mapping (utilities follow the tokens, incl. dark)
 *   src/tokens.ts           — typed export for use in component logic
 *
 * Run with `yarn tokens` (from frontend/) or `node build-tokens.mjs` (from design/).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(resolve(root, "tokens.json"), "utf8"));

const raw = (node) => (node && typeof node === "object" && "value" in node ? node.value : node);
const at = (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), tokens);
const resolveRef = (v) => {
	if (typeof v !== "string") return v;
	const m = v.match(/^\{([^}]+)\}$/);
	return m ? resolveRef(raw(at(m[1]))) : v;
};
const get = (path) => resolveRef(raw(at(path)));
const hexToRgb = (hex) => {
	const h = hex.replace("#", "");
	const n = parseInt(h.length === 3 ? h.replace(/(.)/g, "$1$1") : h, 16);
	return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};
const BANNER = (what) =>
	`/* KodLyft FSM — ${what} (generated from tokens.json — do not edit by hand). */\n`;

function buildWebCss() {
	const c = tokens.color;
	const s = tokens.semantic;
	const lines = [];
	lines.push(BANNER("CSS custom properties"));
	lines.push(":root {");
	lines.push("\t/* Brand */");
	lines.push(`\t--kl-brand-50: ${raw(c.brand["50"])};`);
	lines.push(`\t--kl-brand-100: ${raw(c.brand["100"])};`);
	lines.push(`\t--kl-brand: ${raw(c.brand["300"])}; /* primary accent */`);
	lines.push(`\t--kl-brand-500: ${raw(c.brand["500"])};`);
	lines.push(`\t--kl-brand-700: ${raw(c.brand["700"])};`);
	lines.push(`\t--kl-brand-900: ${raw(c.brand["900"])};`);
	lines.push("");
	lines.push("\t/* Surfaces (light) */");
	for (const k of Object.keys(s.light)) {
		if (k === "brand") continue;
		lines.push(`\t--kl-${k}: ${get(`semantic.light.${k}`)};`);
	}
	lines.push("");
	lines.push("\t/* Status */");
	for (const [k, v] of Object.entries(c.status)) lines.push(`\t--kl-${k}: ${raw(v)};`);
	lines.push("");
	lines.push("\t/* Type */");
	lines.push(`\t--kl-font-ui: ${raw(tokens.font.family.ui)};`);
	lines.push(`\t--kl-font-mono: ${raw(tokens.font.family.mono)};`);
	for (const [k, v] of Object.entries(tokens.font.size))
		lines.push(`\t--kl-text-${k}: ${raw(v)};`);
	for (const [k, v] of Object.entries(tokens.font.weight))
		lines.push(`\t--kl-weight-${k}: ${raw(v)};`);
	for (const [k, v] of Object.entries(tokens.font.lineHeight))
		lines.push(`\t--kl-leading-${k}: ${raw(v)};`);
	lines.push("");
	lines.push("\t/* Space (4px scale) */");
	for (const [k, v] of Object.entries(tokens.space)) {
		if (k.startsWith("$")) continue;
		lines.push(`\t--kl-space-${k}: ${raw(v)};`);
	}
	lines.push("");
	lines.push("\t/* Radius + elevation */");
	for (const [k, v] of Object.entries(tokens.radius))
		lines.push(`\t--kl-radius-${k}: ${raw(v)};`);
	lines.push(`\t--kl-elevation-card: ${raw(tokens.elevation.card)};`);
	lines.push(`\t--kl-elevation-sheet: ${raw(tokens.elevation.sheet)};`);
	lines.push(`\t--kl-elevation-focus: ${raw(tokens.elevation.focus)};`);
	lines.push(`\t--kl-elevation-e1: ${raw(tokens.elevation.e1)};`);
	lines.push(`\t--kl-elevation-e2: ${raw(tokens.elevation.e2)};`);
	lines.push(`\t--kl-elevation-e3: ${raw(tokens.elevation.e3)};`);
	lines.push(`\t--kl-elevation-e4: ${raw(tokens.elevation.e4)};`);
	lines.push(`\t--kl-elevation-glass: ${raw(tokens.elevation.glass)};`);
	lines.push(`\t--kl-elevation-glass-lg: ${raw(tokens.elevation["glass-lg"])};`);
	lines.push("");
	lines.push("\t/* Command theme (dark glass) — raw values; .kl-command opts in */");
	for (const k of Object.keys(s.command)) {
		if (k.startsWith("$")) continue;
		lines.push(`\t--kl-cmd-${k}: ${get(`semantic.command.${k}`)};`);
	}
	lines.push("");
	lines.push("\t/* Brand gradients */");
	for (const [k, v] of Object.entries(tokens.gradient)) {
		if (k.startsWith("$")) continue;
		lines.push(`\t--kl-grad-${k}: ${raw(v)};`);
	}
	lines.push("");
	lines.push(`\t--kl-touch-min: ${raw(tokens.touchTarget.min)};`);
	lines.push("}");
	lines.push("");
	lines.push("@media (prefers-color-scheme: dark) {");
	lines.push("\t:root {");
	for (const [k] of Object.entries(s.dark))
		lines.push(`\t\t--kl-${k}: ${get(`semantic.dark.${k}`)};`);
	lines.push(`\t\t--kl-elevation-card: ${raw(tokens.elevation["card-dark"])};`);
	lines.push("\t}");
	lines.push("}");
	return lines.join("\n") + "\n";
}

// --- ionic-variables.css ---------------------------------------------------
function buildIonicCss() {
	const brand = get("color.brand.300");
	const shade = get("color.brand.500");
	const tint = get("semantic.dark.brand");
	const bg = get("semantic.light.bg");
	const text = get("semantic.light.text");
	const border = get("semantic.light.border");
	const header = `/* KodLyft FSM — Ionic theme (generated from tokens.json — do not edit by hand).
 * Place at mobile/src/theme/variables.css and import in main.ts. Maps KodLyft tokens
 * onto Ionic's CSS variable contract so Ionic's adaptive iOS/Android components render
 * in the KodLyft visual language. */`;
	const out = `${header}

:root {
	/* Primary = KodLyft brand */
	--ion-color-primary: ${brand};
	--ion-color-primary-rgb: ${hexToRgb(brand)};
	--ion-color-primary-contrast: #ffffff;
	--ion-color-primary-contrast-rgb: 255,255,255;
	--ion-color-primary-shade: ${shade};
	--ion-color-primary-tint: ${tint};

	/* Status tokens */
	--ion-color-success: ${get("color.status.success")};
	--ion-color-warning: ${get("color.status.warning")};
	--ion-color-danger: ${get("color.status.danger")};

	/* Typography */
	--ion-font-family: ${raw(tokens.font.family.ui)};

	/* Surfaces */
	--ion-background-color: ${bg};
	--ion-background-color-rgb: ${hexToRgb(bg)};
	--ion-text-color: ${text};
	--ion-text-color-rgb: ${hexToRgb(text)};
	--ion-border-color: ${border};
	--ion-item-background: ${bg};
	--ion-card-background: ${bg};
	--ion-toolbar-background: ${bg};

	/* Radius (applied via component CSS) */
	--kl-radius-md: ${get("radius.md")};
}

@media (prefers-color-scheme: dark) {
	:root {
		--ion-background-color: ${get("semantic.dark.bg")};
		--ion-background-color-rgb: ${hexToRgb(get("semantic.dark.bg"))};
		--ion-text-color: ${get("semantic.dark.text")};
		--ion-text-color-rgb: ${hexToRgb(get("semantic.dark.text"))};
		--ion-border-color: ${get("semantic.dark.border")};
		--ion-item-background: ${get("semantic.dark.surface")};
		--ion-card-background: ${get("semantic.dark.surface")};
		--ion-toolbar-background: ${get("semantic.dark.surface")};
		--ion-color-primary: ${get("semantic.dark.brand")};
		--ion-color-primary-shade: ${get("color.brand.300")};
	}
}
`;
	return out;
}

// --- tailwind-theme.css ----------------------------------------------------
function buildTailwindTheme() {
	const lines = [];
	lines.push(BANNER("Tailwind v4 theme"));
	lines.push("/* Maps tokens onto Tailwind's @theme so utilities (bg-brand, text-fg-muted,");
	lines.push("   rounded-lg, text-2xl …) follow the design tokens, including dark mode. */");
	lines.push("@theme {");
	lines.push("\t/* Brand + status colors */");
	lines.push("\t--color-brand: var(--kl-brand);");
	lines.push(`\t--color-brand-50: ${get("color.brand.50")};`);
	lines.push(`\t--color-brand-100: ${get("color.brand.100")};`);
	lines.push(`\t--color-brand-500: ${get("color.brand.500")};`);
	lines.push(`\t--color-brand-700: ${get("color.brand.700")};`);
	lines.push(`\t--color-brand-900: ${get("color.brand.900")};`);
	lines.push("\t--color-success: var(--kl-success);");
	lines.push("\t--color-warning: var(--kl-warning);");
	lines.push("\t--color-danger: var(--kl-danger);");
	lines.push("\t--color-info: var(--kl-info);");
	lines.push("\t/* Semantic surfaces (follow light/dark automatically) */");
	lines.push("\t--color-bg: var(--kl-bg);");
	lines.push("\t--color-bg-subtle: var(--kl-bg-subtle);");
	lines.push("\t--color-surface: var(--kl-surface);");
	lines.push("\t--color-border: var(--kl-border);");
	lines.push("\t--color-fg: var(--kl-text);");
	lines.push("\t--color-fg-muted: var(--kl-text-muted);");
	lines.push("\t/* Command (dark glass) surfaces — opt-in via .kl-command wrapper */");
	lines.push("\t--color-cmd-bg: var(--kl-cmd-bg);");
	lines.push("\t--color-cmd-glass: var(--kl-cmd-glass);");
	lines.push("\t--color-cmd-glass-strong: var(--kl-cmd-glass-strong);");
	lines.push("\t--color-cmd-border: var(--kl-cmd-glass-border);");
	lines.push("\t--color-cmd-border-strong: var(--kl-cmd-glass-border-strong);");
	lines.push("\t--color-cmd-fg: var(--kl-cmd-text);");
	lines.push("\t--color-cmd-fg-muted: var(--kl-cmd-text-muted);");
	lines.push("\t--color-cmd-brand: var(--kl-cmd-brand);");
	lines.push("\t/* Type */");
	lines.push("\t--font-sans: var(--kl-font-ui);");
	lines.push("\t--font-mono: var(--kl-font-mono);");
	for (const [k, v] of Object.entries(tokens.font.size)) lines.push(`\t--text-${k}: ${raw(v)};`);
	lines.push("\t/* Radius (sm/md/lg overridden to KodLyft values) */");
	lines.push(`\t--radius-sm: ${get("radius.sm")};`);
	lines.push(`\t--radius-md: ${get("radius.md")};`);
	lines.push(`\t--radius-lg: ${get("radius.lg")};`);
	lines.push(
		"\t/* Elevation (card/sheet follow the runtime var so the command theme can deepen them) */",
	);
	lines.push("\t--shadow-card: var(--kl-elevation-card);");
	lines.push("\t--shadow-sheet: var(--kl-elevation-sheet);");
	lines.push("\t--shadow-e1: var(--kl-elevation-e1);");
	lines.push("\t--shadow-e2: var(--kl-elevation-e2);");
	lines.push("\t--shadow-e3: var(--kl-elevation-e3);");
	lines.push("\t--shadow-e4: var(--kl-elevation-e4);");
	lines.push("\t--shadow-glass: var(--kl-elevation-glass);");
	lines.push("\t--shadow-glass-lg: var(--kl-elevation-glass-lg);");
	lines.push("}");
	return lines.join("\n") + "\n";
}

function buildCommandCss() {
	return `${BANNER("command theme (dark glass)")}
/* Apply \`.kl-command\` to a root element (console #app, mobile content). It remaps the
   semantic token roles to the command palette — so existing components styled with
   bg-bg / text-fg / border-border / shadow-card automatically adopt the dark glass look —
   then provides .kl-glass / .kl-grad-brand / .kl-grad-text helpers for accents. */

.kl-command {
	/* Remap semantic roles → command (dark glass) */
	--kl-bg: var(--kl-cmd-glass); /* card + input surfaces become glass */
	--kl-bg-subtle: var(--kl-cmd-bg); /* page base */
	--kl-surface: var(--kl-cmd-glass-strong);
	--kl-border: var(--kl-cmd-glass-border);
	--kl-text: var(--kl-cmd-text);
	--kl-text-muted: var(--kl-cmd-text-muted);
	--kl-brand: var(--kl-cmd-brand);
	--kl-elevation-card: var(--kl-elevation-glass);

	color: var(--kl-cmd-text);
	background-color: var(--kl-cmd-bg);
	background-image:
		radial-gradient(120% 85% at 100% 0%, var(--kl-cmd-glow) 0%, transparent 55%),
		radial-gradient(95% 70% at 0% 100%, rgba(24, 95, 165, 0.1) 0%, transparent 60%),
		linear-gradient(180deg, var(--kl-cmd-bg) 0%, var(--kl-cmd-bg-2) 100%);
}

/* Frosted glass surface */
.kl-glass {
	background-color: var(--kl-cmd-glass);
	background-image: var(--kl-grad-surface);
	border: 1px solid var(--kl-cmd-glass-border);
	-webkit-backdrop-filter: blur(var(--kl-cmd-blur));
	backdrop-filter: blur(var(--kl-cmd-blur));
	box-shadow: var(--kl-elevation-glass);
}

.kl-glass-strong {
	background-color: var(--kl-cmd-glass-strong);
	border-color: var(--kl-cmd-glass-border-strong);
}

/* Brand gradient fill + clipped gradient text */
.kl-grad-brand {
	background-image: var(--kl-grad-brand);
}

.kl-grad-text {
	background-image: var(--kl-grad-brand);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
}

/* Fallback where backdrop-filter is unsupported — keep glass legible */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
	.kl-glass {
		background-color: rgba(20, 28, 42, 0.92);
	}
}
`;
}

function buildTs() {
	const flat = {
		brand: {
			50: get("color.brand.50"),
			100: get("color.brand.100"),
			300: get("color.brand.300"),
			500: get("color.brand.500"),
			700: get("color.brand.700"),
			900: get("color.brand.900"),
		},
		status: {
			success: get("color.status.success"),
			warning: get("color.status.warning"),
			danger: get("color.status.danger"),
			info: get("color.status.info"),
		},
		surface: {
			light: Object.fromEntries(
				Object.keys(tokens.semantic.light).map((k) => [k, get(`semantic.light.${k}`)]),
			),
			dark: Object.fromEntries(
				Object.keys(tokens.semantic.dark).map((k) => [k, get(`semantic.dark.${k}`)]),
			),
		},
		font: {
			ui: raw(tokens.font.family.ui),
			mono: raw(tokens.font.family.mono),
			size: Object.fromEntries(Object.entries(tokens.font.size).map(([k, v]) => [k, raw(v)])),
		},
		radius: Object.fromEntries(Object.entries(tokens.radius).map(([k, v]) => [k, raw(v)])),
		command: Object.fromEntries(
			Object.keys(tokens.semantic.command)
				.filter((k) => !k.startsWith("$"))
				.map((k) => [k, get(`semantic.command.${k}`)]),
		),
		gradient: Object.fromEntries(
			Object.entries(tokens.gradient)
				.filter(([k]) => !k.startsWith("$"))
				.map(([k, v]) => [k, raw(v)]),
		),
		touchMin: raw(tokens.touchTarget.min),
	};
	return (
		"// KodLyft FSM design tokens — generated from tokens.json. Do not edit by hand.\n" +
		`export const tokens = ${JSON.stringify(flat, null, "\t")} as const;\n` +
		"export type Tokens = typeof tokens;\n"
	);
}

mkdirSync(resolve(root, "css"), { recursive: true });
mkdirSync(resolve(root, "src"), { recursive: true });
writeFileSync(resolve(root, "css/kodlyft-tokens.css"), buildWebCss());
writeFileSync(resolve(root, "css/ionic-variables.css"), buildIonicCss());
writeFileSync(resolve(root, "css/tailwind-theme.css"), buildTailwindTheme());
writeFileSync(resolve(root, "css/command.css"), buildCommandCss());
writeFileSync(resolve(root, "src/tokens.ts"), buildTs());
console.log(
	"✓ tokens built: css/{kodlyft-tokens,ionic-variables,tailwind-theme,command}.css, src/tokens.ts",
);
