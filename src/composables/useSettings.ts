import { ref, watch } from "vue";

const edgeReductionButtons = ref(
	localStorage.getItem("edgeReductionButtons") || "Combined",
);
watch(edgeReductionButtons, (x) => {
	localStorage.setItem("edgeReductionButtons", x);
});

const searchDepth = ref(
	Number.parseInt(
		localStorage.getItem("searchDepth") ||
			localStorage.getItem("optimizationDepth") ||
			"2",
	),
);
watch(searchDepth, (x) => {
	localStorage.setItem("searchDepth", x.toString());
});

const searchWidth = ref(
	Number.parseInt(localStorage.getItem("searchWidth") || "16"),
);
watch(searchWidth, (x) => {
	localStorage.setItem("searchWidth", x.toString());
});

const allowRotation = ref(localStorage.getItem("allowRotation") !== "false");
watch(allowRotation, (x) => {
	localStorage.setItem("allowRotation", x.toString());
});

const sheetLength = ref(
	Number.parseInt(localStorage.getItem("sheetLength") || "2800"),
);
watch(sheetLength, (x) => {
	localStorage.setItem("sheetLength", x.toString());
});

const sheetWidth = ref(
	Number.parseInt(localStorage.getItem("sheetWidth") || "2070"),
);
watch(sheetWidth, (x) => {
	localStorage.setItem("sheetWidth", x.toString());
});

const sheetTopEdgeReduction = ref(
	Number.parseInt(localStorage.getItem("sheetTopEdgeReduction") || "0"),
);
watch(sheetTopEdgeReduction, (x) => {
	localStorage.setItem("sheetTopEdgeReduction", x.toString());
});

const sheetRightEdgeReduction = ref(
	Number.parseInt(localStorage.getItem("sheetRightEdgeReduction") || "0"),
);
watch(sheetRightEdgeReduction, (x) => {
	localStorage.setItem("sheetRightEdgeReduction", x.toString());
});

const sheetBottomEdgeReduction = ref(
	Number.parseInt(localStorage.getItem("sheetBottomEdgeReduction") || "0"),
);
watch(sheetBottomEdgeReduction, (x) => {
	localStorage.setItem("sheetBottomEdgeReduction", x.toString());
});

const sheetLeftEdgeReduction = ref(
	Number.parseInt(localStorage.getItem("sheetLeftEdgeReduction") || "0"),
);
watch(sheetLeftEdgeReduction, (x) => {
	localStorage.setItem("sheetLeftEdgeReduction", x.toString());
});

const bladeThickness = ref(
	Number.parseInt(localStorage.getItem("bladeThickness") || "3"),
);
watch(bladeThickness, (x) => {
	localStorage.setItem("bladeThickness", x.toString());
});

const panelEdgeReduction = ref(
	Number.parseInt(localStorage.getItem("panelEdgeReduction") || "0"),
);
watch(panelEdgeReduction, (x) => {
	localStorage.setItem("panelEdgeReduction", x.toString());
});

const savedTheme = localStorage.getItem("currentTheme");
const currentTheme = ref(
	savedTheme && savedTheme !== "lime" ? savedTheme : "bumblebee",
);
watch(
	currentTheme,
	(x) => {
		localStorage.setItem("currentTheme", x);
		if (typeof document !== "undefined") {
			document.documentElement.setAttribute("data-theme", x);
		}
	},
	{ immediate: true },
);

export default function useSettings() {
	return {
		sheetLength,
		sheetWidth,
		sheetTopEdgeReduction,
		sheetRightEdgeReduction,
		sheetBottomEdgeReduction,
		sheetLeftEdgeReduction,
		bladeThickness,
		panelEdgeReduction,
		edgeReductionButtons,
		currentTheme,
		searchDepth,
		searchWidth,
		optimizationDepth: searchDepth,
		allowRotation,
	};
}
