import { execSync } from "node:child_process";
import { URL, fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico", "apple-touch-icon.png", "icon.png"],
			manifest: {
				name: "AutoCut",
				short_name: "AutoCut",
				description: "Sheet cutting optimization software",
				theme_color: "#ffffff",
				icons: [
					{
						src: "icon.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "icon.png",
						sizes: "512x512",
						type: "image/png",
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	define: {
		__COMMIT_HASH__: JSON.stringify(
			execSync("git rev-parse --short HEAD").toString().trim(),
		),
	},
});
