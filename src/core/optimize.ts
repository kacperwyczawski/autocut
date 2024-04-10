import type { Cut } from "./cut";
import type { OptimizationResult } from "./optimizationResult";
import type { OptimizedSheet } from "./optimizedSheet";
import type { Panel } from "./panel";
import type { Sheet } from "./sheet";

type FreeSpace = {
	length: number;
	width: number;
	x: number;
	y: number;
	sheet: OptimizedSheet;
};

export function optimize(
	sheet: Sheet,
	panels: Panel[],
	bladeThickness: number,
): OptimizationResult {
	validatePanels(panels, sheet);
	const startTime = performance.now();
	const freeSpaces: FreeSpace[] = [];
	panels.sort((a, b) =>
		a.length === b.length ? b.width - a.width : b.length - a.length,
	);
	console.log(panels);
	// TODO: apply edge reduction
	const optimizedSheets: OptimizedSheet[] = [];
	let passCount = 0;
	for (const panel of panels) {
		let fit = findBestFit(freeSpaces, panel);
		if (!fit) {
			// if no fit is found, create a new sheet
			const newSheet: OptimizedSheet = {
				sheet: { ...sheet },
				panels: [],
				cuts: [],
			};
			optimizedSheets.push(newSheet);
			fit = {
				x: 0,
				y: 0,
				length: sheet.length,
				width: sheet.width,
				sheet: newSheet,
			};
		} else {
			// if fit is found, remove it from free rectangles
			freeSpaces.splice(freeSpaces.indexOf(fit), 1);
		}

		fit.sheet.panels.push({
			panel,
			x: fit.x,
			y: fit.y,
		});

		// generate new cuts and free rectangles if needed
		if (fit.length === panel.length && fit.width === panel.width) {
			// panel fits perfectly 👌
			// so no new free rectangles
			// TODO: Check if cuts are needed
		} else if (fit.length === panel.length) {
			const newFreeSpace = { ...fit };
			newFreeSpace.y = fit.y + panel.width + bladeThickness;
			newFreeSpace.width = fit.width - panel.width;
			freeSpaces.push(newFreeSpace);

			const newCut: Cut = {
				x: fit.x,
				y: fit.y + panel.width,
				length: fit.length,
				direction: "horizontal",
			};
			fit.sheet.cuts.push(newCut);
		} else if (fit.width === panel.width) {
			const newFreeSpace = { ...fit };
			newFreeSpace.x = fit.x + panel.length + bladeThickness;
			newFreeSpace.length = fit.length - panel.length;
			freeSpaces.push(newFreeSpace);

			const newCut: Cut = {
				x: fit.x + panel.length,
				y: fit.y,
				length: fit.width,
				direction: "vertical",
			};
			fit.sheet.cuts.push(newCut);
		} else {
			// panel is smaller than fit, so we need to create two new free rectangles and two new cuts

			// TODO: maybe change preference based on length/width ratio of sheet.
			// it would require changing the sort function of freeSpaces

			// for now prefer horizontal cut, like this:
			// +---+---+
			// | N |   | <- N = new panel
			// +---+---+
			// |       |
			// +---+---+

			// new idea below:
			// new panels can be placed in every possible fit, and can be rotated. after some set depth the algorithm would evaluate wast percentage and choose the best variant
			// and cut would be either horizontal or vertical. both options would be checked

			const newFreeSpaceToTheRight = { ...fit };
			newFreeSpaceToTheRight.x = fit.x + panel.length + bladeThickness;
			newFreeSpaceToTheRight.length =
				fit.length - panel.length - bladeThickness;
			newFreeSpaceToTheRight.width = panel.width + bladeThickness;
			freeSpaces.push(newFreeSpaceToTheRight);

			const newFreeSpaceBelow = { ...fit };
			newFreeSpaceBelow.y = fit.y + panel.width + bladeThickness;
			newFreeSpaceBelow.width = fit.width - panel.width - bladeThickness;
			freeSpaces.push(newFreeSpaceBelow);

			const newHorizontalCut: Cut = {
				x: fit.x,
				y: fit.y + panel.width,
				length: fit.length,
				direction: "horizontal",
			};
			fit.sheet.cuts.push(newHorizontalCut);

			const newVerticalCut: Cut = {
				x: fit.x + panel.length,
				y: fit.y,
				length: panel.width + bladeThickness / 2,
				direction: "vertical",
			};
			fit.sheet.cuts.push(newVerticalCut);
		}
		passCount++;
		console.info(
			`Pass ${passCount}: waste: ${getWastePercentage(optimizedSheets)}%`,
		);
	}
	const endTime = performance.now();
	return {
		sheets: optimizedSheets,
		bladeThickness,
		wastePercentage: getWastePercentage(optimizedSheets),
		time: endTime - startTime,
	};
}

function getWastePercentage(sheets: OptimizedSheet[]) {
	const usedArea = sheets.reduce((acc, sheet) => {
		const panelArea = sheet.panels.reduce(
			(acc, panel) => acc + panel.panel.length * panel.panel.width,
			0,
		);
		return acc + panelArea;
	}, 0);
	const totalArea = sheets.reduce(
		(acc, sheet) => acc + sheet.sheet.length * sheet.sheet.width,
		0,
	);
	return 100 - (usedArea / totalArea) * 100;
}

function validatePanels(panels: Panel[], sheet: Sheet) {
	if (
		panels.some(
			(panel) => panel.length > sheet.length || panel.width > sheet.width,
		)
	) {
		return "at least one panel is bigger than the sheet";
	}
	if (panels.length === 0) {
		return "no panels to optimize";
	}
}

function findBestFit(freeSpaces: FreeSpace[], panel: Panel): FreeSpace | null {
	const sorted = freeSpaces.sort((a, b) =>
		a.width === b.width ? a.length - b.length : a.width - b.width,
	);
	return (
		sorted.find(
			(freeSpace) =>
				freeSpace.length >= panel.length && freeSpace.width >= panel.width,
		) ?? null
	);
}
