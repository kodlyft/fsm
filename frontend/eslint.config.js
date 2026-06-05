// Flat ESLint config (ESLint 9) for the KodLyft FSM frontends.
// Scoped to frontend/** only — the Frappe desk JS is handled by the repo's .eslintrc + pre-commit.
import pluginVue from "eslint-plugin-vue";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";

export default defineConfigWithVueTs(
	{
		name: "kodlyft/ignores",
		ignores: [
			"**/node_modules/**",
			"**/dist/**",
			"**/.vite/**",
			"design/css/**",
			"mobile/android/**",
			"mobile/ios/**",
			"**/*.min.js",
		],
	},
	{
		name: "kodlyft/files",
		files: ["**/*.{ts,mts,tsx,vue,js,mjs}"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				// Capacitor / browser globals used across the apps
				navigator: "readonly",
				window: "readonly",
				document: "readonly",
			},
		},
	},
	pluginVue.configs["flat/essential"],
	vueTsConfigs.recommended,
	{
		name: "kodlyft/rules",
		rules: {
			"vue/multi-word-component-names": "off",
			// Ionic web components use the native `slot` attribute by design.
			"vue/no-deprecated-slot-attribute": "off",
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
		},
	},
);
