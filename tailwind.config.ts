import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter Variable", ...defaultTheme.fontFamily.sans],
				mono: ["Roboto Mono", ...defaultTheme.fontFamily.mono],
			},
		},
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: [
			"light",
			"dark",
			"cupcake",
			"bumblebee",
			"synthwave",
			"retro",
			"cyberpunk",
			"dracula",
			"night",
			"coffee",
			"dim",
			"nord",
			{
				lime: {
					primary: "#a3e635",
					secondary: "#a3e635",
					accent: "#a3e635",
					neutral: "#1c1c1e",
					"base-100": "#0d0d0d",
					"base-200": "#1c1c1e",
					"base-300": "#2a2a2c",
				},
			},
		],
	},
} satisfies Config;
