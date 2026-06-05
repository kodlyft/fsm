// KodLyft FSM design tokens — generated from tokens.json. Do not edit by hand.
export const tokens = {
	brand: {
		"50": "#E1F5EE",
		"100": "#9FE1CB",
		"300": "#1D9E75",
		"500": "#0F6E56",
		"700": "#085041",
		"900": "#04342C",
	},
	status: {
		success: "#1D9E75",
		warning: "#BA7517",
		danger: "#A32D2D",
		info: "#185FA5",
	},
	surface: {
		light: {
			bg: "#FFFFFF",
			"bg-subtle": "#F7F6F2",
			surface: "#F1EFE8",
			border: "#D3D1C7",
			text: "#1A1A19",
			"text-muted": "#5F5E5A",
			brand: "#1D9E75",
		},
		dark: {
			bg: "#1A1A19",
			"bg-subtle": "#222220",
			surface: "#2C2C2A",
			border: "#44443F",
			text: "#F1EFE8",
			"text-muted": "#B4B2A9",
			brand: "#5DCAA5",
		},
	},
	font: {
		ui: "'Plus Jakarta Sans', system-ui, sans-serif",
		mono: "'JetBrains Mono', monospace",
		size: {
			xs: "12px",
			sm: "14px",
			base: "16px",
			lg: "18px",
			xl: "22px",
			"2xl": "28px",
			"3xl": "34px",
		},
	},
	radius: {
		sm: "6px",
		md: "10px",
		lg: "14px",
		full: "999px",
	},
	touchMin: "44px",
} as const;
export type Tokens = typeof tokens;
