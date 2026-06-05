import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
	base: "/portal/",
	plugins: [vue(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	server: {
		port: 5174,
		middlewareMode: false,
		proxy: {
			"/api": {
				target: "http://localhost:8000",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, "/api"),
				configure: (proxy) => {
					proxy.on("proxyReq", (_proxyReq, req) => {
						console.log("Request:", req.method, req.url);
					});
				},
			},
			"/method": {
				target: "http://localhost:8000",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/method/, "/method"),
			},
			"/assets": {
				target: "http://localhost:8000",
				changeOrigin: true,
			},
			"/files": {
				target: "http://localhost:8000",
				changeOrigin: true,
			},
			"/upload_file": {
				target: "http://localhost:8000",
				changeOrigin: true,
			},
			"/api/resource": {
				target: "http://localhost:8000",
				changeOrigin: true,
			},
			"/socket.io": {
				target: "http://localhost:9000",
				changeOrigin: true,
				ws: true,
				rewrite: (path) => path.replace(/^\/socket.io/, "/socket.io"),
			},
		},
	},
	optimizeDeps: {
		exclude: ["@vite/client", "@vite/env"],
	},
	build: {
		outDir: path.resolve(__dirname, "../../fsm/public/portal"),
		emptyOutDir: true,
		sourcemap: true,
		rollupOptions: {
			input: path.resolve(__dirname, "index.html"),
			output: {
				manualChunks(id) {
					if (!id.includes("node_modules")) return;

					if (
						id.includes("node_modules/vue") ||
						id.includes("node_modules/vue-router") ||
						id.includes("node_modules/pinia")
					) {
						return "vendor-vue";
					}

					const parts = id.split("node_modules/")[1]?.split("/") || [];
					const pkgName = parts[0]?.startsWith("@")
						? `${parts[0]}/${parts[1]}`
						: parts[0];
					if (pkgName) return `vendor-${pkgName.replace("/", "-")}`;
				},
			},
		},
	},
});
