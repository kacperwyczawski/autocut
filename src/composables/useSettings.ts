import { ref, watch } from "vue";

/**
 * Exports the settings loaded from local storage and watches for their changes
 */
export default function useSettings() {
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

	const sheetEdgeReduction = ref(
		Number.parseInt(localStorage.getItem("sheetEdgeReduction") || "0"),
	);
	watch(sheetEdgeReduction, (x) => {
		localStorage.setItem("sheetEdgeReduction", x.toString());
	});

	const bladeThickness = ref(
		Number.parseInt(localStorage.getItem("bladeThickness") || "3"),
	);
	watch(bladeThickness, (x) => {
		localStorage.setItem("bladeThickness", x.toString());
	});

	const panelEdgeReduction = ref(
		Number.parseInt(localStorage.getItem("panelEdgeReduction") || "3"),
	);
	watch(panelEdgeReduction, (x) => {
		localStorage.setItem("panelEdgeReduction", x.toString());
	});

	const edgeReductionButtons = ref(
		localStorage.getItem("edgeReductionButtons") || "Combined",
	);
	watch(edgeReductionButtons, (x) => {
		localStorage.setItem("edgeReductionButtons", x);
	});

	const currentTheme = ref(
		localStorage.getItem("currentTheme") || "retro",
	);
	watch(currentTheme, (x) => {
		localStorage.setItem("currentTheme", x);

	});

    return {
        sheetLength,
        sheetWidth,
        sheetEdgeReduction,
        bladeThickness,
        panelEdgeReduction,
        edgeReductionButtons,
		currentTheme,
    }
}
