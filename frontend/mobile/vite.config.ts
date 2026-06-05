import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// Standalone Capacitor app — bundled into dist/ and packaged into native shells.
export default defineConfig({
	plugins: [vue(), tailwindcss()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	server: {
		port: 8083,
	},
	build: {
		outDir: "dist",
		emptyOutDir: true,
		sourcemap: true,
	},
});
